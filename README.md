# UK Policy Engine

A user interface for OpenFisca-UK showing population- and individual-level policy impacts.

To develop:
- Run the client `make debug-client`
  - If you're developing the backend too, change the API URLs from "https://uk.policyengine.org/..." to "http://localhost:5000/..."
- To run the server:
  - Install dependencies with `pip install -r requirements.txt`
  - Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/downloads-snap)
  - `gcloud auth application-default login` and then `gcloud config set project uk-policy-engine`. 
  - Run in debug mode with `make debug-server`

To deploy to GCP:
- Run `make deploy`. This will run tests first, and stop if they fail.

## Contributing

We're using ZenHub for project management - the public board is [here](https://app.zenhub.com/workspaces/uk-policy-engine-6122e05075f9f200146e2697/board).
