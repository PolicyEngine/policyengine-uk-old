# PolicyEngine UK

[PolicyEngine UK](https://uk.policyengine.org) allows anyone to reform the tax and benefit system, and see how it affects society and their own household.
It builds on the [OpenFisca UK](https://github.com/PolicyEngine/openfisca-uk) microsimulation model.
PolicyEngine is entirely open source and free to use.

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
