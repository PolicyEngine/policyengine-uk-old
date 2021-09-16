from openfisca_uk.tools.simulation import IndividualSim
import numpy as np


def headline_figures(baseline: IndividualSim, reformed: IndividualSim) -> dict:
    """ Create dictionary of totals for the reform and baseline.
    
    :param baseline: Baseline simulation
    :type baseline: IndividualSim
    :param reformed: Reform simulation
    :type reformed: IndividualSim
    :return: Dictionary of baseline and reformed sums for a set of variables
    """
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
            "basic_rate_earned_income_tax",
            "higher_rate_earned_income_tax",
            "add_rate_earned_income_tax",
            "national_insurance",
            "employee_NI_class_1",
            "employer_NI_class_1",
            "NI_class_2",
            "NI_class_4",
            "universal_credit",
            "UC_maximum_amount",
            "UC_income_reduction",
            "benefits",
            "child_benefit",
            "household_net_income",
            "total_income",
            "gross_income",
            "net_income",
        ]
    }
