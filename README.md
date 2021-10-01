# UK Policy Engine

A user interface for OpenFisca-UK showing population- and individual-level policy impacts.

To develop:
- Run the client `make debug-client` (if you're only developing the client, you're done)
- If you're running the server for the first time:
  - Install dependencies with `pip install -r requirements.txt`
  - Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/downloads-snap)
  - `gcloud auth application-default login` and then `gcloud config set project uk-policy-engine`
- Change API URLs in the `.jsx` files from `https://uk.policyengine.org` to `http://localhost:5000` (not `https`)
- Switch `USE_CACHE` from `True` to `False` in `app.py`
- Run the server `make debug-server`

To deploy to GCP:
- Run `make deploy`. This will run tests first, and stop if they fail.

## Contributing

We're using ZenHub for project management - the public board is [here](https://app.zenhub.com/workspaces/uk-policy-engine-6122e05075f9f200146e2697/board).
