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


def create_reform(params):
    reforms = []
    if "basic_rate" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["basic_rate"] / 100,
                bracket=0,
                threshold=False,
            )
        ]
    if "higher_rate" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["higher_rate"] / 100,
                bracket=1,
                threshold=False,
            )
        ]
    if "add_rate" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["add_rate"] / 100,
                bracket=2,
                threshold=False,
            )
        ]
    if "basic_threshold" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["basic_threshold"],
                bracket=0,
                threshold=True,
            )
        ]
    if "higher_threshold" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["higher_threshold"],
                bracket=1,
                threshold=True,
            )
        ]
    if "add_threshold" in params:
        reforms += [
            change_param(
                "tax.income_tax.rates.uk",
                params["add_threshold"],
                bracket=2,
                threshold=True,
            )
        ]
    if "personal_allowance" in params:
        reforms += [
            change_param(
                "tax.income_tax.allowances.personal_allowance.amount",
                params["personal_allowance"],
            )
        ]
    if "NI_main_rate" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_1.rates.employee.main",
                params["NI_main_rate"] / 100,
            )
        ]
    if "NI_add_rate" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_1.rates.employee.additional",
                params["NI_add_rate"] / 100,
            )
        ]
    if "NI_PT" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_1.thresholds.primary_threshold",
                params["NI_PT"],
            )
        ]
    if "NI_UEL" in params:
        reforms += [
            change_param(
                "tax.national_insurance.class_1.thresholds.upper_earnings_limit",
                params["NI_UEL"],
            )
        ]
    if "child_BI" in params:
        child_BI = params["child_BI"]
    else:
        child_BI = 0
    if "adult_BI" in params:
        adult_BI = params["adult_BI"]
    else:
        adult_BI = 0
    if "senior_BI" in params:
        senior_BI = params["senior_BI"]
    else:
        senior_BI = 0
    if adult_BI + child_BI + senior_BI > 0:
        reforms += [basic_income(child_BI, adult_BI, senior_BI)]
    return tuple(reforms)
