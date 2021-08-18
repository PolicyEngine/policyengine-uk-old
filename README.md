# UK Policy Engine

A user interface for OpenFisca-UK showing population- and individual-level policy impacts.

To develop:
- Run the client on port 3000 in debug mode with `cd client; npm start`
  - Change the API URLs from "https://uk.policyengine.org/..." to "http://localhost:5000/..."
- Run the server in debug mode with `FLASK_APP=main.py FLASK_DEBUG=1 flask run`

To deploy to GCP:
- Build the static site and copy to the static folder with `make static-site`
- Run `gcloud app deploy`