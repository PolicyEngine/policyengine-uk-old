from flask import Flask, request, make_response, jsonify
import openfisca_uk
from openfisca_core import periods, populations
from openfisca_core.model_api import *
from openfisca_uk.entities import *
from openfisca_uk.tools.general import *
from flask_cors import CORS
from openfisca_uk import Microsimulation
from rdbl import gbp
import plotly.express as px
import logging
import json
from time import time
import plotly.graph_objects as go
from server.reforms import *
from server.graphs import *
from server.individual import *
from pathlib import Path
from microdf import MicroSeries
from pathlib import Path
from threading import Thread
#
app = Flask(__name__)
CORS(app)


SYSTEM = openfisca_uk.CountryTaxBenefitSystem()
baseline = openfisca_uk.Microsimulation()
baseline.calc("household_net_income")

avg_mtr = lambda sim: float(
    (
        1
        - sim.deriv(
            "household_net_income", wrt="employment_income", group_limit=2
        )
    )[sim.calc("is_adult")]
    .dropna()
    .mean()
)

baseline_mtr = 0.3# avg_mtr(baseline)


def pct_change(x, y):
    return (y - x) / x


CACHE = Path("cache")

cached_results = {}
cached_situation_results = {}

@app.route("/", methods=["get"])
def test():
    return "Status check: server up"


@app.route("/situation-reform", methods=["post"])
def compute_situation_reform():
    try:
        print("Received situation reform request")
        start_time = time()
        params = request.json
        param_string = json.dumps(params)
        if param_string in cached_situation_results:
            return cached_situation_results[param_string]
        else:
            cached_situation_results[param_string] = {}
        reform_object = create_reform(params)
        print("Constructed reform")
        baseline, reformed = get_sims(reform_object, params)
        headline_figures = get_headline_figures(baseline, reformed)
        print("Calculated headline figures")
        budget_graph = get_budget_graph(reform_object, params)
        print("Budget graph done")
        mtr_graph = get_mtr_graph(reform_object, params)
        print("MTR graph done")
        waterfall_chart = get_budget_waterfall_chart(reform_object, params)
        print("Waterfall graph done")
        output = {
            **headline_figures,
            "budget_chart": json.loads(budget_graph),
            "mtr_chart": json.loads(mtr_graph),
            "waterfall_chart": json.loads(waterfall_chart),
        }
        print(f"Completed situation reform ({round(time() - start_time, 1)})s")
        cached_situation_results[param_string] = output
        return output
    except Exception as e:
        print(e.with_traceback())


@app.route("/reform", methods=["POST"])
def compute_reform():
    try:
        print("Received reform request")
        start_time = time()
        params = request.json
        parameters = {x:y for x, y in params.items() if x != "component"}
        param_string = json.dumps(params)
        if param_string in cached_results:
            if "component" in params:
                return cached_results[param_string][params["component"]]
            return cached_results[param_string]
        else:
            cached_results[param_string] = {}
        reform_object, reform_components = create_reform(
            params, return_names=True
        )
        reform = Microsimulation(reform_object)
        reform_sim_build = time()
        print(
            f"Constructed reform sim ({round(reform_sim_build - start_time, 2)}s)"
        )
        new_income = reform.calc("equiv_household_net_income", map_to="person")
        old_income = baseline.calc(
            "equiv_household_net_income", map_to="person"
        )
        calculations_done = time()
        print(
            f"Calculated new net incomes ({round(calculations_done - reform_sim_build, 2)}s)"
        )
        gain = MicroSeries(
            (new_income - old_income).values.astype(float),
            weights=old_income.weights.values,
        )
        net_cost = (
            reform.calc("net_income").sum() - baseline.calc("net_income").sum()
        )
        cached_results[param_string]["net_cost"] = gbp(net_cost)
        decile_plot = create_decile_plot(gain, old_income)
        cached_results[param_string]["decile_plot"] = json.loads(decile_plot)
        poverty_change = pct_change(
            baseline.calc("in_poverty_bhc", map_to="person").mean(),
            reform.calc("in_poverty_bhc", map_to="person").mean(),
        )
        cached_results[param_string]["poverty_change"] = float(poverty_change)
        hnet_r = reform.calc("household_net_income", map_to="person")
        hnet = baseline.calc("household_net_income", map_to="person")
        winner_share = (hnet_r > hnet).mean()
        cached_results[param_string]["winner_share"] = float(winner_share)
        loser_share = (hnet_r < hnet).mean()
        cached_results[param_string]["loser_share"] = float(loser_share)
        gini_change = pct_change(
            MicroSeries(hnet.dropna()).gini(), MicroSeries(hnet_r).gini()
        )
        cached_results[param_string]["inequality_change"] = float(gini_change)
        headliners = time()
        print(
            f"Calculated headline figures ({round(headliners - calculations_done, 2)}s)"
        )
        poverty = poverty_chart(baseline, reform)
        cached_results[param_string]["poverty_plot"] = json.loads(poverty)
        print("Poverty chart done")
        age_plot = create_age_plot(gain, baseline)
        cached_results[param_string]["age"] = json.loads(age_plot)
        print("Age chart done")
        mtr_plot = average_mtr_changes(baseline_mtr, reform)
        cached_results[param_string]["mtr_plot"] = json.loads(mtr_plot)
        print("MTR chart done")
        waterfall = get_funding_breakdown(reform_object, reform_components)
        cached_results[param_string]["waterfall"] = json.loads(waterfall)
        print("Waterfall chart done")
        analysis_done = time()
        del reform
        print(
            f"Plots calculated ({round(analysis_done - calculations_done, 2)}s)"
        )
        return cached_results[param_string]
    except Exception as e:
        print(e.with_traceback())
        return {"status": "error"}


@app.after_request
def after_request_func(response):
    origin = request.headers.get("Origin")
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Headers", "x-csrf-token")
        response.headers.add(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS, PUT, PATCH, DELETE",
        )
        if origin:
            response.headers.add("Access-Control-Allow-Origin", origin)
    else:
        response.headers.add("Access-Control-Allow-Credentials", "true")
        if origin:
            response.headers.add("Access-Control-Allow-Origin", origin)

    return response


if __name__ == "__main__":
    app.run()
