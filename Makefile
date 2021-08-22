format:
	black . -l 79
debug-client:
	cd client; npm start
debug-server:
	FLASK_APP=main.py FLASK_DEBUG=1 flask run
deploy: openfisca_data openfisca_uk test
	rm -rf server/static
	cd client; npm run build
	cp -r client/build server/static
	y | gcloud app deploy
test:
	pytest tests