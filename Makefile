format:
	black . -l 79
start-server:
	FLASK_APP=main.py flask run -p 4000
static-site:
	cd client; npm run build
	cp -r client/build/ server/static/
start-client:
	cd client; npm start
deploy-server: openfisca_uk openfisca_data
	cp server/gcp ./gcp -r
	gcloud app deploy
test:
	pytest tests