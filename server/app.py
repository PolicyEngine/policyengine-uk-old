import json
from typing import Any
from flask import Flask, request, redirect, make_response, send_from_directory
from flask_cors import CORS
import logging
from time import time
from openfisca_uk import Microsimulation, IndividualSim
from pathlib import Path
from google.cloud import storage
import os

from server.simulation.situations import create_situation
from server.simulation.reforms import create_reform

from server.populations.metrics import headline_metrics
from server.populations.charts import (
    decile_chart,
    intra_decile_chart,
    poverty_chart,
    age_chart,
    population_waterfall_chart,
)

from server.situations.metrics import headline_figures
from server.situations.charts import (
    household_waterfall_chart,
    mtr_chart,
    budget_chart,
)

VERSION = "0.0.1"
USE_CACHE = False
logging.getLogger("werkzeug").disabled = True

client = storage.Client()
bucket = client.get_bucket("uk-policy-engine.appspot.com")

baseline = Microsimulation()

app = Flask(__name__, static_url_path="")
logging.getLogger("werkzeug").disabled = True
CORS(app)


def static_site():
    return send_from_directory("static", "index.html")


STATIC_SITE_ROUTES = (
    "/",
    "/situation",
    "/population-results",
    "/situation-results",
)

for route in STATIC_SITE_ROUTES:
    static_site = app.route(route)(static_site)


@app.route("/api/population-reform")
def population_reform():
    start_time = time()
    app.logger.info("Population reform request received")
    params = {**request.args, **(request.json or {})}
    request_id = "population-" + dict_to_string(params) + "-" + VERSION
    blob = bucket.blob(request_id + ".json")
    if blob.exists() and USE_CACHE:
        app.logger.info("Returning cached response")
        result = json.loads(blob.download_as_string())
        return result
    reform, components = create_reform(params, return_names=True)
    reformed = Microsimulation(reform)
    result = dict(
        **headline_metrics(baseline, reformed),
        decile_chart=decile_chart(baseline, reformed),
        age_chart=age_chart(baseline, reformed),
        poverty_chart=poverty_chart(baseline, reformed),
        waterfall_chart=population_waterfall_chart(
            reform, components, baseline, reformed
        ),
        intra_decile_chart=intra_decile_chart(baseline, reformed),
    )
    if USE_CACHE:
        blob.upload_from_string(json.dumps(result))
    duration = time() - start_time
    app.logger.info(f"Population reform completed ({round(duration, 2)}s)")
    return result


def dict_to_string(d):
    return "_".join(["_".join((x, y)) for x, y in d.items()])


@app.route("/api/situation-reform", methods=["GET", "POST"])
def situation_reform():
    start_time = time()
    app.logger.info("Situation reform request received")
    params = {**request.args, **(request.json or {})}
    request_id = "situation-" + dict_to_string(params) + "-" + VERSION
    blob = bucket.blob(request_id + ".json")
    if blob.exists() and USE_CACHE:
        app.logger.info("Returning cached response")
        result = json.loads(blob.download_as_string())
        return result
    situation = create_situation(params)
    reform, subreform_labels = create_reform(params, return_names=True)
    baseline = situation(IndividualSim())
    reformed = situation(IndividualSim(reform))
    headlines = headline_figures(baseline, reformed)
    waterfall = household_waterfall_chart(
        reform, subreform_labels, situation, baseline, reformed
    )
    baseline_varying = situation(IndividualSim())
    baseline_varying.vary("employment_income")
    reformed_varying = situation(IndividualSim(reform))
    reformed_varying.vary("employment_income")
    budget = budget_chart(baseline_varying, reformed_varying)
    mtr = mtr_chart(baseline_varying, reformed_varying)
    result = dict(
        **headlines,
        waterfall_chart=waterfall,
        budget_chart=budget,
        mtr_chart=mtr,
    )
    if USE_CACHE:
        blob.upload_from_string(json.dumps(result))
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
        response.headers[
            "Cache-Control"
        ] = "no-cache, no-store, must-revalidate, public, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response


if __name__ == "__main__":
    app.run()
