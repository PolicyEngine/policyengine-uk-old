import numpy as np
from openfisca_core.reforms import reform
from openfisca_core.tracers.full_tracer import FullTracer
from openfisca_uk.tools.simulation import IndividualSim
import random
from policy_engine_uk.simulation.reforms import BASELINE_PARAMETERS, PE_VARIABLES as BASELINE_VARIABLES


def headline_figures(baseline: IndividualSim, reformed: IndividualSim) -> dict:
    """Create dictionary of totals for the reform and baseline.

    :param baseline: Baseline simulation
    :type baseline: IndividualSim
    :param reformed: Reform simulation
    :type reformed: IndividualSim
    :return: Dictionary of baseline and reformed sums for a set of variables
    """

    def get_value(sim, name):
        return float(np.array(sim.calc(name)).sum())

    def get_values(name):
        return {
            "old": get_value(baseline, name),
            "new": get_value(reformed, name),
        }

    VARIABLES = [
        "net_income",
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
    ]
    return {name: get_values(name) for name in VARIABLES}

from openfisca_uk import BASELINE_VARIABLES, BASELINE_PARAMETERS
from functools import reduce

def get_name(baseline_node, reform_node):
    if isinstance(baseline_node.value, np.ndarray) or isinstance(reform_node.value, np.ndarray):
        baseline_value = round(sum(baseline_node.value), 2)
        reform_value = round(sum(reform_node.value), 2)
    else:
        baseline_value = baseline_node.value
        reform_value = reform_node.value
    if reform_value != baseline_value:
        value_str = f"changes from {baseline_value} to {reform_value}"
    else:
        value_str = f"is {baseline_value}"
    if baseline_node.name in BASELINE_VARIABLES:
        return f"{BASELINE_VARIABLES[baseline_node.name].label} in {str(baseline_node.period)} {value_str}"
    else:
        try:
            parameter = reduce(getattr, baseline_node.name.split("."), BASELINE_PARAMETERS)
            return parameter.description + " at " + str(baseline_node.period) + value_str
        except:
            return baseline_node.name


def convert_parallel_trees(baseline_node, reform_node, depth=1e3):
    node = {
        "key": f"{baseline_node.name}-{baseline_node.period}-{np.random.randint(1, 1000)}",
        "title": get_name(baseline_node, reform_node)
    }
    if len(baseline_node.children + baseline_node.parameters) == 0 or depth == 0:
        node["children"] = []
        return [node]
    else:
        children = [convert_parallel_trees(baseline_child, reform_child, depth=depth-1) for baseline_child, reform_child in zip((baseline_node.children + baseline_node.parameters), (reform_node.children + reform_node.parameters))]
        node["children"] = [child[0] for child in children]
        return [node]

# We assume that both the baseline and reform computation trees have exactly 
# the same structure - this will likely break if not

def get_trees(baseline: IndividualSim, reformed: IndividualSim):
    for variable in BASELINE_VARIABLES:
        baseline.sim.delete_arrays(variable)
        reformed.sim.delete_arrays(variable)
    baseline.calc("household_net_income")
    reformed.calc("household_net_income")
    return convert_parallel_trees(baseline.sim.tracer.trees[0], reformed.sim.tracer.trees[0])