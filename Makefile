install:
	pip install -e .
	openfisca-uk-setup --set-default frs_was_imp
	openfisca-uk-data frs_was_imp download 2019
	cd client; npm install
format:
	black . -l 79
debug-client:
	cd client; npm start
debug-server:
	FLASK_APP=main.py FLASK_DEBUG=1 flask run
deploy: openfisca_uk_data openfisca_uk test
	rm -rf policy_engine_uk/static
	cd client; npm run build
	cp -r client/build policy_engine_uk/static
	y | gcloud app deploy
test:
	pytest tests -vv
