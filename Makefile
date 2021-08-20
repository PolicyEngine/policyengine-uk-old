format:
	black . -l 79
deploy: openfisca_data openfisca_uk
	rm -rf server/static
	cd client; npm run build
	cp -r client/build server/static
	y | gcloud app deploy
test:
	pytest tests