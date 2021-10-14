"""
Functions to convert JSON web app parameters into OpenFisca reform objects.
"""

from openfisca_core import periods
from openfisca_core.model_api import *
from openfisca_core.parameters import (
    load_parameter_file,
    Parameter,
    ParameterScale,
)
from openfisca_uk import BASELINE_VARIABLES, CountryTaxBenefitSystem
from openfisca_uk import reforms as reform_tools
from openfisca_uk.reforms.presets.current_date import use_current_parameters
from openfisca_uk.entities import *
from openfisca_uk.tools.general import *
from policy_engine_uk import REPO
import yaml
import datetime

CURRENT_DATE = datetime.datetime.now().strftime("%Y-%m-%d")


def add_structural_reforms() -> Reform:

    # Land value tax reform

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
            rate = parameters(period).reforms.LVT.rate
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

    # UBI reform

    class UBI(Variable):
        entity = Person
        definition_period = YEAR
        label = "UBI"
        value_type = float

        def formula(person, period, parameters):
            UBI_params = parameters(period).reforms.UBI
            age = person("age", period)
            is_child = age < UBI_params.WA_adult_UBI_age
            is_SP_age = person("is_SP_age", period)
            is_WA_adult = ~is_child & ~is_SP_age
            basic_income = (
                is_child * UBI_params.child
                + is_WA_adult * UBI_params.adult
                + is_SP_age * UBI_params.senior
            ) * 52
            return basic_income

    class benefits(BASELINE_VARIABLES.benefits):
        def formula(person, period, parameters):
            original_benefits = BASELINE_VARIABLES.benefits.formula(
                person, period, parameters
            )
            return original_benefits + person("UBI", period)

    # Liberal Democrat parameters

    class personal_allowance(BASELINE_VARIABLES.personal_allowance):
        def formula(person, period, parameters):
            original_PA = BASELINE_VARIABLES.personal_allowance.formula(
                person, period, parameters
            )
            ubi_amount = person("UBI", period)
            return where(ubi_amount > 0, 0, original_PA)

    class structural_reform(Reform):
        def apply(self):
            self.update_variable(land_value)
            self.update_variable(LVT)
            self.update_variable(tax)
            self.add_variable(UBI)
            self.update_variable(benefits)
            self.update_variable(personal_allowance)

    return structural_reform


def add_parameter_file():
    def modify_parameters(parameters: ParameterNode):
        file_path = Path(__file__).parent / "reform_parameters.yaml"
        reform_parameters_subtree = load_parameter_file(file_path)
        parameters.add_child("reforms", reform_parameters_subtree.reforms)
        return parameters

    class reform(Reform):
        def apply(self):
            self.modify_parameters(modify_parameters)

    return reform


def get_PE_parameters():
    parameters = []
    for parameter in BASELINE_PARAMETERS.get_descendants():
        if isinstance(parameter, Parameter):
            parameters += [parameter]
        elif isinstance(parameter, ParameterScale):
            for bracket in parameter.brackets:
                for attribute in ("rate", "amount", "threshold"):
                    if hasattr(bracket, attribute):
                        parameters += [getattr(bracket, attribute)]
    parameters = list(
        filter(
            lambda param: hasattr(param, "metadata")
            and "policyengine" in param.metadata,
            parameters,
        )
    )
    parameter_metadata = {}
    for p in parameters:
        meta = p.metadata["policyengine"]
        param = dict(
            parameter=p.name,
            title=meta["title"],
            short_name=meta["short_name"],
            description=meta["description"],
            default=p(CURRENT_DATE),
            value=p(CURRENT_DATE),
            summary=meta["summary"],
        )
        default_values = dict(
            min=0,
            max=1,
            variable=None,
            type=None,
        )
        for key, value in default_values.items():
            if key in meta:
                param[key] = meta[key]
            else:
                param[key] = value
        parameter_metadata[param["short_name"]] = param
    return parameter_metadata


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
        metadata = POLICYENGINE_PARAMETERS[param]
        names += [metadata["title"]]
        if "abolish" in param:
            reforms += [reform_tools.structural.abolish(metadata["variable"])]
        else:
            reforms += [
                reform_tools.parametric.set_parameter(
                    metadata["parameter"], value
                )
            ]
    if not return_names:
        return tuple(reforms)
    else:
        return tuple(reforms), names


DEFAULT_REFORM = (
    use_current_parameters(),
    add_parameter_file(),
    add_structural_reforms(),
)

BASELINE_PARAMETERS = add_parameter_file()(
    CountryTaxBenefitSystem()
).parameters
POLICYENGINE_PARAMETERS = get_PE_parameters()
