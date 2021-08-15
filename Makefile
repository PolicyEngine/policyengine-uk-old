format:
	black . -l 79
start-server:
	FLASK_APP=server/server.py flask run -p 4000
start-client:
	cd client; npm start
deploy-server: openfisca_uk openfisca_data main.py app.yaml requirements.txt .gcloudignore
	gcloud app deploy