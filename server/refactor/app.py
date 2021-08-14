import json
from server.refactor.populations.charts import age_chart, decile_chart, poverty_chart, waterfall_chart
from typing import Any
from flask import Flask, request, make_response
from flask_cors import CORS

from openfisca_uk import Microsimulation
from server.refactor.simulation.reforms import create_reform
from server.refactor.populations.metrics import get_headline_metrics


app = Flask(__name__)
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
    policy = {x: y for x, y in params.items() if x not in ("target", "situation")}

    if "situation" in params:
        key = json.dumps({**policy, "situation": params["situation"]})
    else:
        key = json.dumps(policy)
    
    # check if already started or finished

    if key in CACHE:
        if "target" in params:
            app.logger.info("Returning target")
            if params["target"] in CACHE[key]:
                return {
                    "status": COMPLETE,
                    "data": CACHE[key][params["target"]]
                }
            else:
                return {
                    "status": IN_PROGRESS
                }
        else:
            app.logger.info("Returning entire results")
            return CACHE[key]

    app.logger.info("Reform not in cache, computing")

    CACHE[key] = {
        "status": IN_PROGRESS
    }
    
    reform, subreform_names = create_reform(params, return_names=True)
    reformed = Microsimulation(reform)

    for metric, value in get_headline_metrics(baseline, reformed).items():
        CACHE[key][metric] = value

    CACHE[key]["decile_chart"] = decile_chart(baseline, reformed)
    CACHE[key]["poverty_chart"] = poverty_chart(baseline, reformed)
    CACHE[key]["age_chart"] = age_chart(baseline, reformed)
    CACHE[key]["waterfall_chart"] = waterfall_chart(reform, subreform_names)

    CACHE[key]["status"] = COMPLETE
    
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
