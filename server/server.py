from flask import Flask, request, make_response, jsonify
import openfisca_uk
from openfisca_core import periods, populations
from openfisca_core.model_api import *
from openfisca_uk.entities import *
from openfisca_uk.tools.general import *
from flask_cors import CORS
from openfisca_uk.microdata.simulation import Microsimulation
from rdbl import gbp
import plotly.express as px
import logging
import json
from time import time
import plotly.graph_objects as go
from server.reforms import *
from server.graphs import *

app = Flask(__name__)
CORS(app)


SYSTEM = openfisca_uk.CountryTaxBenefitSystem()
baseline = openfisca_uk.Microsimulation(input_year=2020)
baseline.calc("household_net_income")


@app.route("/reform", methods=["POST"])
def compute_reform():
    try:
        print("Received reform request")
        start_time = time()
        params = request.json
        reform_object = create_reform(params)
        reform = Microsimulation(reform_object, input_year=2020)
        reform_sim_build = time()
        print(f"Constructed reform sim ({round(reform_sim_build - start_time, 2)}s)")
        new_income = reform.calc("equiv_household_net_income", map_to="person")
        old_income = baseline.calc("equiv_household_net_income", map_to="person")
        calculations_done = time()
        print(f"Calculated new net incomes ({round(calculations_done - reform_sim_build, 2)}s)")
        gain = new_income - old_income
        net_cost = reform.calc("net_income").sum() - baseline.calc("net_income").sum()
        decile_plot = create_decile_plot(gain, old_income)
        top_1_pct_share_effect = gain[old_income.percentile_rank() == 100].mean()
        top_10_pct_share_effect = gain[old_income.decile_rank() == 10].mean()
        median_effect = new_income.median() - old_income.median()
        poverty = poverty_chart(baseline, reform)
        age_plot = create_age_plot(gain, baseline)
        analysis_done = time()
        del reform
        print(f"Analysis results calculated ({round(analysis_done - calculations_done, 2)}s)")
        return {"status": "success", "age": json.loads(age_plot), "net_cost": gbp(net_cost), "decile_plot": json.loads(decile_plot), "1pct": top_1_pct_share_effect, "10pct": top_10_pct_share_effect, "median": median_effect, "poverty_plot": json.loads(poverty)}
    except Exception as e:
        print(e)
        return {"status": "error"}

@app.after_request
def after_request_func(response):
    origin = request.headers.get('Origin')
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Headers', 'x-csrf-token')
        response.headers.add('Access-Control-Allow-Methods',
                            'GET, POST, OPTIONS, PUT, PATCH, DELETE')
        if origin:
            response.headers.add('Access-Control-Allow-Origin', origin)
    else:
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        if origin:
            response.headers.add('Access-Control-Allow-Origin', origin)

    return response

if __name__ == "__main__":
    app.run()