reset:
	rm -rf openfisca_uk
	rm -rf openfisca_uk_data
install: openfisca_uk openfisca_uk_data
	pip install -e .
	cd client; npm install
format:
	autopep8 -r --in-place .
	black . -l 79
debug-client:
	cd client; npm start
debug-server:
	FLASK_APP=main.py FLASK_DEBUG=1 flask run
openfisca_uk:
	pip install git+https://github.com/PSLmodels/synthimpute
	git clone https://github.com/PolicyEngine/openfisca-uk --depth 1 --branch v0.4.0
	sed -i 's/microdf @ git+https:\/\/github.com\/PSLmodels\/microdf/microdf-python==0.4.4/' openfisca-uk/setup.py
	sed -i 's/autopep8 >=1.5/autopep8==1.3.5/' openfisca-uk/setup.py
	cd openfisca-uk; make install
	cp -r openfisca-uk/openfisca_uk openfisca_uk
	rm -rf openfisca-uk
openfisca_uk_data:
	git clone https://github.com/ubicenter/openfisca-uk-data --depth 1
	pip install 'h5py<3.9'
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
deploy-local: test
	rm -rf policy_engine_uk/static
	cd client; npm run build
	cp -r client/build server/static
	FLASK_APP=main.py FLASK_DEBUG=1 flask run
