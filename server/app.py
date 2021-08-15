import json
from typing import Any
from flask import Flask, request, make_response
from flask_cors import CORS
import logging

from openfisca_uk import Microsimulation
from server.simulation.reforms import create_reform
from server.populations.charts import (
    age_chart,
    decile_chart,
    poverty_chart,
    waterfall_chart,
)
from server.populations.metrics import headline_metrics
from server.hypothetical.situation import get_situation_func
from server.hypothetical.metrics import headline_figures
from server.hypothetical.charts import mtr_chart, budget_chart, budget_waterfall_chart


app = Flask(__name__)
logging.getLogger('werkzeug').disabled = True
CORS(app)


baseline = Microsimulation()
baseline.calc("household_net_income")

CACHE = {}

IN_PROGRESS = "in_progress"
COMPLETE = "complete"


@app.route("/", methods=["get"])
def test():
    return "Status check: server up."


@app.route("/reform", methods=["post"])
def compute_reform():
    params = request.json
    policy = {
        x: y for x, y in params.items() if x not in ("target", "situation")
    }

    if "situation" in params:
        key = json.dumps({**policy, "situation": params["situation"]})
    else:
        key = json.dumps(policy)

    # check if already started or finished

    if key in CACHE:
        if "target" in params:
            # app.logger.info("Returning target")
            if params["target"] in CACHE[key]:
                return {
                    "status": COMPLETE,
                    "data": CACHE[key][params["target"]],
                }
            else:
                return {"status": IN_PROGRESS}
        else:
            app.logger.info("Returning entire results")
            return CACHE[key]

    app.logger.info("Reform not in cache, computing")

    CACHE[key] = {"status": IN_PROGRESS}

    reform, subreform_names = create_reform(params, return_names=True)

    if "situation" not in params:
        reformed = Microsimulation(reform)

        for metric, value in headline_metrics(baseline, reformed).items():
            CACHE[key][metric] = value

        CACHE[key]["decile_chart"] = decile_chart(baseline, reformed)
        CACHE[key]["poverty_chart"] = poverty_chart(baseline, reformed)
        CACHE[key]["age_chart"] = age_chart(baseline, reformed)
        CACHE[key]["waterfall_chart"] = waterfall_chart(
            reform, subreform_names
        )
    else:
        situation = get_situation_func(params)
        CACHE[key]["headline_figures"] = headline_figures(reform, situation)
        CACHE[key]["waterfall_chart"] = budget_waterfall_chart(reform, situation)
        CACHE[key]["mtr_chart"] = mtr_chart(reform, situation)
        CACHE[key]["budget_chart"] = budget_chart(reform, situation)

    CACHE[key]["status"] = COMPLETE

    app.logger.info("Reform complete.")

    return {}


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
