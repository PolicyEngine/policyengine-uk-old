from openfisca_uk.tools.simulation import IndividualSim
import numpy as np

def headline_figures(reform, situation):
    baseline = situation(IndividualSim(year=2021))
    reformed = situation(IndividualSim(reform, year=2021))
    getValue = lambda sim, name: float(np.array(sim.calc(name)).sum())
    getValues = lambda name: {
        "old": getValue(baseline, name),
        "new": getValue(reformed, name),
    }
    return {
        name: getValues(name)
        for name in [
            "tax",
            "income_tax",
            "national_insurance",
            "universal_credit",
            "benefits",
            "household_net_income",
        ]
    }