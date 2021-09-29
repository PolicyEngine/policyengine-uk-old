install: openfisca_uk_data
	openfisca-uk-setup --set-default frs_was_imp
	cd client; npm install
format:
	black . -l 79
debug-client:
	cd client; npm start
debug-server:
	FLASK_APP=main.py FLASK_DEBUG=1 flask run
openfisca_uk_data:
	pip install -e .
	pip install openfisca-uk
	git clone https://github.com/ubicenter/openfisca-uk-data --depth 1
	cd openfisca-uk-data; pip install -e .
	openfisca-uk-data frs_was_imp download 2019
	cp -r openfisca-uk-data/openfisca_uk_data/ openfisca_uk_data
	rm -rf openfisca-uk-data
deploy: openfisca_uk_data openfisca_uk test
	rm -rf policy_engine_uk/static
	cd client; npm run build
	cp -r client/build policy_engine_uk/static
	y | gcloud app deploy
test:
	pytest tests -vv
