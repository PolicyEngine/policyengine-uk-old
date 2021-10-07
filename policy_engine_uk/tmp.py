@app.route("/api/ubi")
def ubi():
    start_time = time()
    app.logger.info("UBI size request received")

    request_id = "ubi-" + dict_to_string(params) + "-" + VERSION
    blob = bucket.blob(request_id + ".json")
    if blob.exists() and USE_CACHE:
        app.logger.info("Returning cached response")
        result = json.loads(blob.download_as_string())
        return result
    reform = create_reform(params)
    reformed = Microsimulation(reform)
    revenue = (
        baseline.calc("net_income").sum() - reformed.calc("net_income").sum()
    )
    UBI_amount = max(0, revenue / baseline.calc("people").sum())
    result = {"UBI": float(UBI_amount)}
    if USE_CACHE:
        blob.upload_from_string(json.dumps(result))
    gc.collect()
    duration = time() - start_time
    app.logger.info(f"UBI size calculation completed ({round(duration, 2)}s)")
    return result


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
    reform = create_reform(params)
    reformed = Microsimulation(reform)
    result = dict(
        **headline_metrics(baseline, reformed),
        decile_chart=decile_chart(baseline, reformed),
        poverty_chart=poverty_chart(baseline, reformed),
        waterfall_chart=population_waterfall_chart(baseline, reformed),
        intra_decile_chart=intra_decile_chart(baseline, reformed),
    )
    del reformed
    del reform
    if USE_CACHE:
        blob.upload_from_string(json.dumps(result))
    gc.collect()
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
    app.logger.info("Creating situation")

    if USE_CACHE:
        blob.upload_from_string(json.dumps(result))
    gc.collect()
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
