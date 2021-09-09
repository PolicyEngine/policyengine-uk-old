reset:
	rm -rf openfisca_uk
	rm -rf openfisca_uk_data
install: openfisca_uk openfisca_uk_data
	pip install -e .
	cd client; npm install
format:
	black . -l 79
debug-client:
	cd client; npm start
debug-server:
	FLASK_APP=main.py FLASK_DEBUG=1 flask run
openfisca_uk:
	git clone https://github.com/PSLmodels/openfisca-uk --depth 1
	pip install -e openfisca-uk
	openfisca-uk-setup --set-default frs
	cp -r openfisca-uk/openfisca_uk openfisca_uk
	rm -rf openfisca-uk
openfisca_uk_data:
	git clone https://github.com/ubicenter/openfisca-uk-data --depth 1
	pip install -e openfisca-uk-data
	cp -r openfisca-uk-data/openfisca_uk_data/ openfisca_uk_data
	rm -rf openfisca-uk-data
	gsutil cp gs://uk-policy-engine.appspot.com/frs_2018.h5 openfisca_uk_data/microdata/openfisca_uk/frs_2018.h5
deploy: openfisca_uk_data openfisca_uk test
	rm -rf policy_engine/static
	cd client; npm run build
	cp -r client/build policy_engine/static
	y | gcloud app deploy
test:
	pytest tests
deploy-local: test
	rm -rf policy_engine/static
	cd client; npm run build
	cp -r client/build server/static
	FLASK_APP=main.py FLASK_DEBUG=1 flask run