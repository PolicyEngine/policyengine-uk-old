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
from reforms import *
from graphs import *

app = Flask(__name__)
CORS(app)


SYSTEM = openfisca_uk.CountryTaxBenefitSystem()
baseline = openfisca_uk.Microsimulation(input_year=2020)
baseline.calc("household_net_income")


def pct_change(x, y):
    return (y - x) / x


cached_results = {}


@app.route("/reform", methods=["POST"])
def compute_reform():
    try:
        print("Received reform request")
        start_time = time()
        params = request.json
        param_string = json.dumps(params)
        if param_string in cached_results:
            return cached_results[param_string]
        reform_object = create_reform(params)
        reform = Microsimulation(reform_object, input_year=2020)
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
        gain = new_income - old_income
        net_cost = (
            reform.calc("net_income").sum() - baseline.calc("net_income").sum()
        )
        decile_plot = create_decile_plot(gain, old_income)
        poverty_change = pct_change(
            baseline.calc("in_poverty_bhc", map_to="person").mean(),
            reform.calc("in_poverty_bhc", map_to="person").mean(),
        )
        hnet_r = reform.calc("household_net_income", map_to="person")
        hnet = baseline.calc("household_net_income", map_to="person")
        winner_share = (hnet_r > hnet).mean()
        loser_share = (hnet_r < hnet).mean()
        gini_change = pct_change(hnet.gini(), hnet_r.gini())
        poverty = poverty_chart(baseline, reform)
        age_plot = create_age_plot(gain, baseline)
        mtr_plot = average_mtr_changes(baseline, reform)
        analysis_done = time()
        del reform
        print(
            f"Analysis results calculated ({round(analysis_done - calculations_done, 2)}s)"
        )
        result = {
            "status": "success",
            "age": json.loads(age_plot),
            "net_cost": gbp(net_cost),
            "decile_plot": json.loads(decile_plot),
            "poverty_plot": json.loads(poverty),
            "poverty_change": float(poverty_change),
            "winner_share": float(winner_share),
            "loser_share": float(loser_share),
            "inequality_change": float(gini_change),
            "mtr_plot": json.loads(mtr_plot),
        }
        cached_results[param_string] = result
        return result
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
