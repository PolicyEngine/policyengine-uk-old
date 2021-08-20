from google.cloud import storage

client = storage.Client()
bucket = client.get_bucket("uk-policy-engine.appspot.com")
for blob in bucket.list_blobs():
    blob.delete()
