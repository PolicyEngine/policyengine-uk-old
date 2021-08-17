import json
from typing import Any
from flask import Flask, request, redirect, make_response, send_from_directory
from flask_cors import CORS
import logging
from time import time
from openfisca_uk import Microsimulation, IndividualSim

from server.simulation.situations import create_situation
from server.simulation.reforms import create_reform

from server.populations.metrics import headline_metrics
from server.populations.charts import decile_chart, poverty_chart, age_chart, waterfall_chart

from server.situations.metrics import headline_figures
from server.situations.charts import budget_waterfall_chart, mtr_chart, budget_chart

logging.getLogger('werkzeug').disabled = True


baseline = Microsimulation()

STORAGE = {}

def save(key, data):
    STORAGE[key] = data

def load(key):
    try:
        return STORAGE[key]
    except:
        return None

app = Flask(__name__, static_url_path='')
logging.getLogger('werkzeug').disabled = True
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return send_from_directory("static", "index.html")

@app.route("/api/population-reform", methods=["GET"])
def population_reform():
    start_time = time()
    app.logger.info("Population reform request received")
    params = request.args
    reform, components = create_reform(params, return_names=True)
    reformed = Microsimulation(reform)
    result = dict(
        **headline_metrics(baseline, reformed),
        decile_chart=decile_chart(baseline, reformed),
        age_chart=age_chart(baseline, reformed),
        poverty_chart=poverty_chart(baseline, reformed),
        waterfall_chart=waterfall_chart(reform, components, baseline)
    )
    duration = time() - start_time
    app.logger.info(f"Population reform completed ({round(duration, 2)}s)")
    return result

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/population-reform"):
        return population_reform()
    if request.path.startswith("/api/situation-reform"):
        return situation_reform()
    return send_from_directory("static", "index.html")

@app.route("/api/situation-reform", methods=["GET", "POST"])
def situation_reform():
    start_time = time()
    app.logger.info("Situation reform request received")
    params = {**request.args, **(request.json or {})}
    situation = create_situation(params)
    reform = create_reform(params)
    baseline = situation(IndividualSim())
    reformed = situation(IndividualSim(reform))
    result = dict(
        **headline_figures(baseline, reformed),
        waterfall_chart=budget_waterfall_chart(baseline, reformed),
        budget_chart=budget_chart(reform, situation),
        mtr_chart=mtr_chart(reform, situation)
    )
    duration = time() - start_time
    app.logger.info(f"Situation reform completed ({round(duration, 2)}s)")
    return result

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
