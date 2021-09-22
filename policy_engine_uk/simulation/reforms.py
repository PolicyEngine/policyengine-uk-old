"""
Functions to convert JSON web app parameters into OpenFisca reform objects.
"""

from openfisca_core import periods
from openfisca_core.model_api import *
from openfisca_uk import BASELINE_VARIABLES, Microsimulation
from openfisca_uk.reforms.presets.current_date import use_current_parameters
from openfisca_uk.entities import *
from openfisca_uk.tools.general import *


def change_param(param, value, bracket=None, threshold=False):
    def modifier(parameters):
        node = parameters
        for name in param.split("."):
            node = node.children[name]
        if bracket is not None:
            node = node.brackets[bracket]
            if threshold:
                node = node.threshold
            else:
                node = node.rate
        node.update(periods.period("year:2015:10"), value=value)
        return parameters

    class reform(Reform):
        def apply(self):
            self.modify_parameters(modifier)

    return reform


def add_empty_UBI():
    def add_age_params(parameters: ParameterNode):
        parameters.benefit.add_child(
            "UBI",
            ParameterNode(
                data={
                    "child": {"values": {"0000-01-01": 0.00}},
                    "WA_adult": {"values": {"0000-01-01": 0.00}},
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
            basic_income = (
                person("is_child", period) * UBI_params.child
                + person("is_WA_adult", period) * UBI_params.WA_adult
                + person("is_SP_age", period) * UBI_params.senior
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


def neutralizer_reform(variable):
    class reform(Reform):
        def apply(self):
            self.neutralize_variable(variable)

    return reform


def create_reform(parameters: dict, return_names=False, baseline=None):
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
    added_UBI = False
    child_UBI = 0
    WA_adult_UBI = 0
    senior_UBI = 0
    if "child_UBI" in params:
        names += ["Child UBI"]
        child_UBI = 52 * params["child_UBI"]
        if not added_UBI:
            reforms += [
                (
                    add_empty_UBI(),
                    change_param("benefit.UBI.child", child_UBI),
                )
            ]
            added_UBI = True
        else:
            reforms += [change_param("benefit.UBI.child", child_UBI)]
    if "adult_UBI" in params:
        names += ["WA Adult UBI"]
        WA_adult_UBI = 52 * params["adult_UBI"]
        if not added_UBI:
            reforms += [
                (
                    add_empty_UBI(),
                    change_param("benefit.UBI.WA_adult", WA_adult_UBI),
                )
            ]
            added_UBI = True
        else:
            reforms += [change_param("benefit.UBI.WA_adult", WA_adult_UBI)]
    if "senior_UBI" in params:
        names += ["Senior UBI"]
        senior_UBI = 52 * params["senior_UBI"]
        if not added_UBI:
            reforms += [
                (
                    add_empty_UBI(),
                    change_param("benefit.UBI.senior", senior_UBI),
                )
            ]
            added_UBI = True
        else:
            reforms += [change_param("benefit.UBI.senior", senior_UBI)]
    if "basic_rate" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["basic_rate"] / 100,
                bracket=0,
                threshold=False,
            )
        ]
        names += ["Basic rate"]
    if "higher_rate" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["higher_rate"] / 100,
                bracket=1,
                threshold=False,
            )
        ]
        names += ["Higher rate"]
    if "add_rate" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["add_rate"] / 100,
                bracket=2,
                threshold=False,
            )
        ]
        names += ["Additional rate"]
    if "basic_threshold" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["basic_threshold"],
                bracket=0,
                threshold=True,
            )
        ]
        names += ["Basic threshold"]
    if "higher_threshold" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["higher_threshold"],
                bracket=1,
                threshold=True,
            )
        ]
        names += ["Higher threshold"]
    if "add_threshold" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["add_threshold"],
                bracket=2,
                threshold=True,
            )
        ]
        names += ["Additional threshold"]
    if "personal_allowance" in params:
        reforms += [
            change_param(
                "tax.income_tax.allowances.personal_allowance.amount",
                params["personal_allowance"],
            )
        ]
        names += ["PA"]
    if "NI_main_rate" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_1.rates.employee.main",
                params["NI_main_rate"] / 100,
            )
        ]
        names += ["NI main rate"]
    if "NI_add_rate" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_1.rates.employee.additional",
                params["NI_add_rate"] / 100,
            )
        ]
        names += ["NI add. rate"]
    if "NI_PT" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_1.thresholds.primary_threshold",
                params["NI_PT"],
            )
        ]
        names += ["PT"]
    if "NI_UEL" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_1.thresholds.upper_earnings_limit",
                params["NI_UEL"],
            )
        ]
        names += ["NI UEL"]
    if "NI_LPL" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_4.thresholds.lower_profits_limit",
                params["NI_LPL"],
            )
        ]
        names += ["NI LPL"]
    if "NI_UPL" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_4.thresholds.upper_profits_limit",
                params["NI_UPL"],
            )
        ]
        names += ["NI UPL"]
    if "NI_class_4_main_rate" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_4.rates.main",
                params["NI_class_4_main_rate"] / 100,
            )
        ]
        names += ["NI Self-emp main"]
    if "NI_class_4_add_rate" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_4.rates.additional",
                params["NI_class_4_add_rate"] / 100,
            )
        ]
        names += ["NI Self-emp add."]
    if "UC_single_young" in params:
        reforms += [
            change_param(
                "benefit.universal_credit.standard_allowance.amount.SINGLE_YOUNG",
                params["UC_single_young"],
            )
        ]
        names += ["UC Single amount (young)"]
    ABOLITIONS = (
        "savings_allowance",
        "dividend_allowance",
        "income_tax",
        "NI",
        "UC",
        "CB",
        "CTC",
        "WTC",
        "HB",
        "SP",
    )
    ABOLITION_NAMES = (
        "Savings Allowance",
        "Dividend Allowance",
        "Income Tax",
        "National Insurance",
        "Universal Credit",
        "Child Benefit",
        "Child Tax Credit",
        "Working Tax Credit",
        "Housing Benefit",
        "State Pension",
    )
    ABOLITION_VARS = (
        "savings_allowance",
        "dividend_allowance",
        "income_tax",
        "national_insurance",
        "universal_credit",
        "child_benefit",
        "child_tax_credit",
        "working_tax_credit",
        "housing_benefit",
        "state_pension",
    )
    for variable, var, name in zip(
        ABOLITIONS, ABOLITION_VARS, ABOLITION_NAMES
    ):
        if f"abolish_{variable}" in params:
            if params[f"abolish_{variable}"]:
                reforms += [neutralizer_reform(var)]
                names += [name]
    first_reform, later_reforms = (), ()
    if len(reforms) > 0:
        first_reform = reforms[0]
    if len(reforms) > 1:
        later_reforms = reforms[1:]
    reform_tuple = tuple(
        ((use_current_parameters(), first_reform), *later_reforms)
    )
    if not return_names:
        return reform_tuple
    else:
        return reform_tuple, names
