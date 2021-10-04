"""
Functions to convert JSON web app parameters into OpenFisca reform objects.
"""

from openfisca_core import periods
from openfisca_core.model_api import *
from openfisca_uk import BASELINE_VARIABLES
from openfisca_uk import reforms as reform_tools
from openfisca_uk.reforms.presets.current_date import use_current_parameters
from openfisca_uk.entities import *
from openfisca_uk.tools.general import *
from policy_engine_uk import REPO
import yaml


def add_LVT() -> Reform:
    class land_value(Variable):
        entity = Household
        label = "Land value"
        definition_period = YEAR
        value_type = float

    class LVT(Variable):
        entity = Household
        label = "Land value tax"
        definition_period = YEAR
        value_type = float

        def formula(household, period, parameters):
            rate = parameters(period).tax.land_value.rate
            return rate * household("land_value", period)

    class tax(BASELINE_VARIABLES.tax):
        def formula(person, period, parameters):
            LVT_charge = person.household("LVT", period) * person(
                "is_household_head", period
            )
            original_tax = BASELINE_VARIABLES.tax.formula(
                person, period, parameters
            )
            return original_tax + LVT_charge

    def add_lvt_param(parameters: ParameterNode):
        parameters.tax.add_child(
            "land_value",
            ParameterNode(
                data={
                    "rate": {"values": {"0000-01-01": 0.00}},
                }
            ),
        )
        return parameters

    class lvt_param_reform(Reform):
        def apply(self):
            self.update_variable(land_value)
            self.update_variable(LVT)
            self.update_variable(tax)
            self.modify_parameters(add_lvt_param)

    return lvt_param_reform


def add_empty_UBI():
    def add_age_params(parameters: ParameterNode):
        parameters.benefit.add_child(
            "UBI",
            ParameterNode(
                data={
                    "child": {"values": {"0000-01-01": 0.00}},
                    "WA_adult_age": {"values": {"0000-01-01": 18}},
                    "WA_adult": {"values": {"0000-01-01": 0.00}},
                    "senior_age": {"values": {"0000-01-01": 65}},
                    "senior": {"values": {"0000-01-01": 0.00}},
                }
            ),
        )
        return parameters

    class UBI(Variable):
        entity = Person
        definition_period = YEAR
        label = "UBI"
        value_type = float

        def formula(person, period, parameters):
            UBI_params = parameters(period).benefit.UBI
            age = person("age", period)
            is_child = age < UBI_params.WA_adult_age
            is_WA_adult = ~is_child & (age < UBI_params.senior_age)
            is_senior = age >= UBI_params.senior_age
            basic_income = (
                is_child * UBI_params.child
                + is_WA_adult * UBI_params.WA_adult
                + is_senior * UBI_params.senior
            )
            return basic_income

    class benefits(BASELINE_VARIABLES.benefits):
        def formula(person, period, parameters):
            original_benefits = BASELINE_VARIABLES.benefits.formula(
                person, period, parameters
            )
            return original_benefits + person("UBI", period)

    class add_UBI(Reform):
        def apply(self):
            self.modify_parameters(add_age_params)
            self.add_variable(UBI)
            self.update_variable(benefits)

    return add_UBI


with open(REPO / "simulation" / "parameters.yaml") as f:
    PARAMETER_METADATA = yaml.load(f)


def create_reform(parameters: dict, return_names=False):
    params = {}
    for key, value in parameters.items():
        components = key.split("_")
        if components[0] == "policy":
            name = "_".join(components[1:])
            try:
                params[name] = float(value)
            except:
                params[name] = value
    reforms = []
    names = []

    for param, value in params.items():
        if "abolish" in param:
            param_name = param[8:]
        else:
            param_name = param
        metadata = PARAMETER_METADATA[param_name]
        names += [metadata["name"]]
        if "multiplier" not in metadata:
            metadata["multiplier"] = 1
        if "abolish" in param:
            reforms += [reform_tools.structural.abolish(metadata["variable"])]
        else:
            reforms += [
                reform_tools.parametric.set_parameter(
                    metadata["parameter"], value * metadata["multiplier"]
                )
            ]

    first_reform, later_reforms = (), ()
    if len(reforms) > 0:
        first_reform = reforms[0]
    if len(reforms) > 1:
        later_reforms = reforms[1:]
    reform_tuple = tuple(
        (
            (
                use_current_parameters(),
                add_empty_UBI(),
                add_LVT(),
                first_reform,
            ),
            *later_reforms,
        )
    )
    if not return_names:
        return reform_tuple
    else:
        return reform_tuple, names
