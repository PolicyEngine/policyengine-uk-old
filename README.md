# UK Policy Engine

A user interface for OpenFisca-UK showing population- and individual-level policy impacts.

To run:
- Install [`openfisca-uk`](http://github.com/pslmodels/openfisca-uk)
- Initialise the microdata if using, with the prompt at `openfisca-uk-data`
- In one terminal (for the server):
  - `cd server`
  - `export FLASK_APP=server.py`
  - `flask run -p 4000`
- In another terminal (for the client):
  - `npm start`