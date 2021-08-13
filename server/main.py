from server.server import app
from openfisca_data import SynthFRS

if len(SynthFRS.years) == 0:
    SynthFRS.save(2018)

app.run()