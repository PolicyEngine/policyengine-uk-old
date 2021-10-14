from typing import Callable
from openfisca_uk import IndividualSim
from policy_engine_uk.utils import charts
import plotly.express as px
import pandas as pd
from rdbl import gbp

COLOR_MAP = {
    "Baseline": charts.GRAY,
    "Reform": charts.BLUE,
}

LABELS = dict(
    variable="Policy",
    employment_income="Employment income",
)


def budget_chart(baseline: IndividualSim, reformed: IndividualSim) -> str:
    """Produces line chart with employment income on the x axis and net income
    on the y axis, for baseline and reform simulations.
    :param baseline: Baseline simulation.
    :type baseline: IndividualSim
    :param reformed: Reform simulation.
    :type reformed: IndividualSim
    :return: Representation of the budget plotly chart as a JSON string.
    :rtype: str
    """
    variable_values = {}
    for explaining_variable in (
        "total_income",
        "income_tax",
        "national_insurance",
        "benefits",
    ):
        variable_values[explaining_variable + "_baseline"] = baseline.calc(
            explaining_variable
        ).sum(axis=0)
        variable_values[explaining_variable + "_reform"] = reformed.calc(
            explaining_variable
        ).sum(axis=0)
    df = pd.DataFrame(
        {
            "employment_income": baseline.calc("employment_income").sum(
                axis=0
            ),
            "Baseline": baseline.calc("net_income").sum(axis=0),
            "Reform": reformed.calc("net_income").sum(axis=0),
            **variable_values,
        }
    )
    df["hover"] = df.apply(
        lambda x: budget_hover_label(
            x.employment_income,
            x.Baseline,
            x.Reform,
            x.total_income_baseline,
            x.total_income_reform,
            x.income_tax_baseline,
            x.income_tax_reform,
            x.national_insurance_baseline,
            x.national_insurance_reform,
            x.benefits_baseline,
            x.benefits_reform,
        ),
        axis=1,
    )
    fig = px.line(
        df.round(0),
        x="employment_income",
        y=["Baseline", "Reform"],
        labels=dict(LABELS, value="Net income"),
        color_discrete_map=COLOR_MAP,
        custom_data=["hover"],
    )
    charts.add_custom_hovercard(fig)
    fig.update_layout(
        title="Net income by employment income",
        xaxis_title="Employment income",
        yaxis_title="Household net income",
        yaxis_tickprefix="£",
        xaxis_tickprefix="£",
        legend_title=None,
    )
    return charts.formatted_fig_json(fig)


def describe_change(
    x: float, y: float, formatter: Callable = lambda x: x
) -> str:
    if y > x:
        return f"rises from {formatter(x)} to {formatter(y)} (+{formatter(y - x)})"
    elif y == x:
        return f"remains at {formatter(x)}"
    else:
        return f"falls from {formatter(x)} to {formatter(y)} (-{formatter(x - y)})"


def budget_hover_label(
    earnings: float,
    baseline_budget: float,
    reform_budget: float,
    total_income_baseline: float,
    total_income_reform: float,
    income_tax_baseline: float,
    income_tax_reform,
    ni_baseline,
    ni_reform,
    benefits_baseline,
    benefits_reform,
) -> str:
    def f(x):
        return gbp(x, exact_upper_bound=1e5)

    earnings_str = f(earnings)
    budget_change = describe_change(baseline_budget, reform_budget, f)
    total_income_change = describe_change(
        total_income_baseline, total_income_reform, f
    )
    it_change = describe_change(income_tax_baseline, income_tax_reform, f)
    ni_change = describe_change(ni_baseline, ni_reform, f)
    benefits_change = describe_change(benefits_baseline, benefits_reform, f)
    return f"At {earnings_str}, your net income {budget_change}. This is because: <br>Total income {total_income_change}<br>Income Tax {it_change}<br>NI {ni_change}<br>Benefits {benefits_change}"


def mtr_hover_label(
    earnings: float,
    baseline_mtr: float,
    reform_mtr: float,
    income_tax_baseline: float,
    income_tax_reform,
    ni_baseline,
    ni_reform,
    benefits_baseline,
    benefits_reform,
) -> str:
    earnings_str = gbp(earnings, exact_upper_bound=1e5)

    def pct_formatter(x):
        return str(round(x * 100)) + "%"

    mtr_change = describe_change(baseline_mtr, reform_mtr, pct_formatter)
    it_change = describe_change(
        income_tax_baseline, income_tax_reform, pct_formatter
    )
    ni_change = describe_change(ni_baseline, ni_reform, pct_formatter)
    benefits_change = describe_change(
        benefits_baseline, benefits_reform, pct_formatter
    )
    return f"At {earnings_str}, your MTR {mtr_change}. This is because: <br>Income Tax MTR {it_change}<br>NI MTR {ni_change}<br>Benefits MTR {benefits_change}"


def mtr_chart(baseline: IndividualSim, reformed: IndividualSim) -> str:
    """Produces line chart with employment income on the x axis and marginal
    tax rate on the y axis, for baseline and reform simulations.
    :param baseline: Baseline simulation.
    :type baseline: IndividualSim
    :param reformed: Reform simulation.
    :type reformed: IndividualSim
    :return: Representation of the marginal tax rate plotly chart as a JSON
        string.
    :rtype: str
    """
    earnings = baseline.calc("employment_income").sum(axis=0)
    baseline_net = baseline.calc("net_income").sum(axis=0)
    reform_net = reformed.calc("net_income").sum(axis=0)

    def get_mtr(x, y):
        return 1 - ((y[1:] - y[:-1]) / (x[1:] - x[:-1]))

    baseline_mtr = get_mtr(earnings, baseline_net)
    reform_mtr = get_mtr(earnings, reform_net)
    variable_mtrs = {}
    for explaining_variable, inverted in zip(
        (
            "income_tax",
            "national_insurance",
            "benefits",
        ),
        (False, False, True),
    ):
        baseline_values = baseline.calc(explaining_variable).sum(axis=0)
        reform_values = reformed.calc(explaining_variable).sum(axis=0)
        multiplier = 1 if inverted else -1
        addition = -1 if inverted else 1
        variable_mtrs[explaining_variable + "_baseline"] = (
            get_mtr(earnings, baseline_values) * multiplier + addition
        )
        variable_mtrs[explaining_variable + "_reform"] = (
            get_mtr(earnings, reform_values) * multiplier + addition
        )
    df = pd.DataFrame(
        {
            "employment_income": earnings[:-1].round(0),
            "Baseline": baseline_mtr,
            "Reform": reform_mtr,
            **variable_mtrs,
        }
    )
    df["hover"] = df.apply(
        lambda x: mtr_hover_label(
            x.employment_income,
            x.Baseline,
            x.Reform,
            x.income_tax_baseline,
            x.income_tax_reform,
            x.national_insurance_baseline,
            x.national_insurance_reform,
            x.benefits_baseline,
            x.benefits_reform,
        ),
        axis=1,
    )
    fig = px.line(
        df,
        x="employment_income",
        y=["Baseline", "Reform"],
        labels=dict(LABELS, value="Effective MTR"),
        color_discrete_map=COLOR_MAP,
        line_shape="hv",
        custom_data=["hover"],
    )
    charts.add_custom_hovercard(fig)
    fig.update_layout(
        title="Effective marginal tax rate by employment income",
        xaxis_title="Employment income",
        xaxis_tickprefix="£",
        yaxis_tickformat="%",
        yaxis_title="Effective MTR",
        legend_title=None,
    )
    return charts.formatted_fig_json(fig)


def household_waterfall_chart(
    baseline: IndividualSim, reformed: IndividualSim
) -> dict:
    return charts.waterfall_chart(baseline, reformed)
