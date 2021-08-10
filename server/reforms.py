from openfisca_core import periods
from openfisca_core.model_api import *
from openfisca_uk import BASELINE_VARIABLES
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


def basic_income(child, adult, senior):
    class UBI(Variable):
        entity = Person
        definition_period = YEAR
        label = u"UBI"
        value_type = float

        def formula(person, period):
            basic_income = (
                person("is_child", period) * child * 52
                + person("is_WA_adult", period) * adult * 52
                + person("is_SP_age", period) * senior * 52
            )
            return basic_income

    class benefits(BASELINE_VARIABLES.benefits):
        def formula(person, period, parameters):
            original_benefits = BASELINE_VARIABLES.benefits.formula(
                person, period, parameters
            )
            return original_benefits + person("UBI", period)

    class basic_income(Reform):
        def apply(self):
            self.add_variable(UBI)
            self.update_variable(benefits)

    return basic_income


def neutralizer_reform(variable):
    class reform(Reform):
        def apply(self):
            self.neutralize_variable(variable)

    return reform


def create_reform(params, return_names=False):
    reforms = []
    names = []
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
    if "child_UBI" in params:
        child_UBI = params["child_UBI"]
    else:
        child_UBI = 0
    if "adult_UBI" in params:
        adult_UBI = params["adult_UBI"]
    else:
        adult_UBI = 0
    if "senior_UBI" in params:
        senior_UBI = params["senior_UBI"]
    else:
        senior_UBI = 0
    if adult_UBI + child_UBI + senior_UBI > 0:
        reforms += [basic_income(child_UBI, adult_UBI, senior_UBI)]
        names += ["UBI"]
    ABOLITIONS = (
        "savings_allowance",
        "dividend_allowance",
        "income_tax",
        "NI",
        "UC",
        "CB"
    )
    ABOLITION_NAMES = (
        "Savings Allowance",
        "Dividend Allowance",
        "Income Tax abolition",
        "NI abolition",
        "UC abolition",
        "CB abolition",
    )
    ABOLITION_VARS = (
        "savings_allowance",
        "dividend_allowance",
        "income_tax",
        "national_insurance",
        "universal_credit",
        "child_benefit"
    )
    for variable, var, name in zip(ABOLITIONS, ABOLITION_VARS, ABOLITION_NAMES):
        if f"abolish_{variable}" in params:
            if params[f"abolish_{variable}"]:
                reforms += [neutralizer_reform(var)]
                names += [name]
    if not return_names:
        return tuple(reforms)
    else:
        return tuple(reforms), names
