from openfisca_core.reforms import reform
from openfisca_uk import CountryTaxBenefitSystem, IndividualSim, graphs
import numpy as np
from formatting import format_fig
import pandas as pd
import plotly.express as px
from ubicenter.plotly import GRAY, BLUE, format_fig

WHITE = "#FFF"
from openfisca_uk import BASELINE_VARIABLES


def get_situation_func(params):
    def situation(sim):
        household = params["situation"]["household"]
        num_families = len(household["families"])
        hh_adults = []
        hh_children = []
        for i in range(num_families):
            family = household["families"][i]
            num_people = len(family["people"])
            bu_adults = []
            bu_children = []
            head_assigned = False
            for j in range(num_people):
                person = family["people"][j]
                name = f"family-{i}-person-{j}"
                age = person["age"]["value"]
                variable_values = {}
                for var in person.keys():
                    if var in BASELINE_VARIABLES:
                        variable_values[var] = person[var]["value"]
                is_head = age >= 18 and not head_assigned
                if is_head:
                    head_assigned = True
                sim.add_person(
                    name=name,
                    **variable_values,
                    is_benunit_head=is_head,
                    is_household_head=is_head,
                )
                if person["age"]["value"] >= 18:
                    bu_adults += [name]
                else:
                    bu_children += [name]
            sim.add_benunit(
                adults=bu_adults,
                children=bu_children,
                claims_UC=True,
                claims_child_benefit=True,
            )
            hh_adults += bu_adults
            hh_children += bu_children
        sim.add_household(adults=hh_adults, children=hh_children)
        return sim

    return situation


def get_sims(reform_obj, params):
    baseline = IndividualSim(year=2021)
    reformed = IndividualSim(reform_obj, year=2021)
    situation = get_situation_func(params)
    for sim in (baseline, reformed):
        situation(sim)
    return baseline, reformed


def get_headline_figures(baseline, reformed):
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


def get_budget_graph(reform_obj, params):
    graph = graphs.budget_chart(
        reform_obj, situation_function=get_situation_func(params)
    )
    return (
        format_fig(graph, show=False)
        .update_layout(
            title="Net income by employment income",
            xaxis_title="Employment income",
            yaxis_title="Yearly amount",
            yaxis_tickprefix="£",
        )
        .update_traces(marker_color="#1890ff")
        .to_json()
    )


def get_mtr_graph(reform_obj, params):
    graph = graphs.mtr_chart(
        reform_obj, situation_function=get_situation_func(params)
    )
    return (
        format_fig(graph, show=False)
        .update_layout(
            title="Effective marginal tax rate by employment income",
            xaxis_title="Employment income",
            yaxis_title="Effective MTR",
        )
        .update_traces(marker_color="#1890ff")
        .to_json()
    )


def get_changes(reform, situation, variables):
    baseline = IndividualSim(year=2021)
    reformed = IndividualSim(reform, year=2021)

    for sim in baseline, reformed:
        situation(sim)

    changes = [0] * len(variables)

    for i in range(len(variables)):
        try:
            baseline_value = baseline.calc(variables[i]).sum()
        except KeyError:
            baseline_value = 0
        try:
            reformed_value = reformed.calc(variables[i]).sum()
        except KeyError:
            reformed_value = 0
        changes[i] = reformed_value - baseline_value

    return changes


def get_waterfall_df(reform, situation):
    VARIABLES = (
        "income_tax",
        "national_insurance",
        "UBI",
        "household_net_income",
    )
    NAMES = ("Income Tax", "National Insurance", "UBI")
    INVERT = (True, True, False)
    changes = get_changes(reform, situation, VARIABLES)
    final_change = changes[-1]
    changes = changes[:-1]
    df = pd.DataFrame(
        {
            "Component": NAMES,
            "Change": changes * np.where(INVERT, -1, 1),
            "Type": np.where(
                changes * np.where(INVERT, -1, 1) > 0, "Gain", "Loss"
            ),
        }
    )
    base = df.Change.cumsum()
    for i in range(len(base) - 1, 0, -1):
        if base[i] - base[i - 1] > 0:
            base[i] = base[i - 1]
    df.Change = df.Change.abs()
    df = pd.concat(
        [
            df,
            pd.DataFrame(
                {"Component": df.Component, "Change": base, "Type": "-"}
            ),
        ]
    )
    if final_change > 0:
        final_type = "Gain"
    elif final_change == 0:
        final_type = "-"
    else:
        final_type = "Loss"
    df = pd.concat(
        [
            df,
            pd.DataFrame(
                {
                    "Component": ["Net income"],
                    "Change": [final_change],
                    "Type": [final_type],
                }
            ),
        ]
    )
    return df


def get_waterfall_chart(reform, params):
    situation = get_situation_func(params)
    WHITE = "#FFF"
    df = get_waterfall_df(reform, situation)
    fig = format_fig(
        px.bar(
            df.sort_values("Type"),
            x="Component",
            y="Change",
            color="Type",
            barmode="stack",
            color_discrete_sequence=[WHITE, "#1890ff", GRAY],
        ).update_layout(
            title="Change to net income by component", yaxis_tickprefix="£"
        ),
        show=False,
    )
    return fig.to_json()


COMPONENTS = (
    "employment_income",
    "self_employment_income",
    "pension_income",
    "savings_interest_income",
    "dividend_income",
    "universal_credit",
    "child_benefit",
    "UBI",
    "income_tax",
    "national_insurance",
    "net_income",
)

IS_POSITIVE = [True] * 8 + [False] * 2 + [True]


def get_variables(reform, situation, variables=COMPONENTS):
    sim = IndividualSim(reform, year=2021)
    situation(sim)
    amounts = []
    for variable in COMPONENTS:
        try:
            amounts += [sim.calc(variable).sum()]
        except:
            amounts += [0]
    df = pd.DataFrame(
        dict(
            variable=COMPONENTS,
            value=amounts,
            type=np.where(IS_POSITIVE, "Gain", "Loss"),
            is_value=True,
        )
    )
    df.value *= np.where(IS_POSITIVE, 1, -1)
    df = df[df.variable.isin(variables)].reset_index(drop=True)
    return df


key_to_label = dict(
    net_income="Net income",
    employment_income="Employment income",
    self_employment_income="Self-employment income",
    pension_income="Pension income",
    savings_interest_income="Savings income",
    dividend_income="Dividend income",
    universal_credit="Universal Credit",
    child_benefit="Child Benefit",
    UBI="UBI",
    income_tax="Income Tax",
    national_insurance="NI",
)


def variable_key_to_label(key):
    try:
        return key_to_label[key]
    except:
        return ""


def get_budget_waterfall_data(
    reform, situation, label="Baseline", variables=COMPONENTS
):
    df = get_variables(reform, situation, variables=variables)
    net_income = df[df.variable == "net_income"].copy()
    df = df[df.variable != "net_income"].reset_index(drop=True)
    base = pd.Series([0] + list(df.value.cumsum()))
    for i in range(1, len(base)):
        if base[i] < base[i - 1]:
            base[i - 1] = base[i]
    df.value = df.value.abs()
    df = pd.concat(
        [
            pd.DataFrame(
                dict(variable=df.variable, value=base, type="", is_value=False)
            ),
            df,
        ]
    )
    df = pd.concat([df, net_income])
    df = df[~df.variable.isna()]
    df.variable = df.variable.apply(variable_key_to_label)
    df["Policy"] = label
    return df


def get_budget_waterfall_chart(reform, params):
    situation = get_situation_func(params)
    baseline_variable_df = get_variables((), situation)
    baseline_variables = baseline_variable_df.variable[
        baseline_variable_df.value != 0
    ].unique()
    reform_variable_df = get_variables(reform, situation)
    reform_variables = reform_variable_df.variable[
        reform_variable_df.value != 0
    ].unique()
    variables = list(set(list(baseline_variables) + list(reform_variables)))
    df = pd.concat(
        [
            get_budget_waterfall_data(
                (), situation, "Baseline", variables=variables
            ),
            get_budget_waterfall_data(
                reform, situation, "Reform", variables=variables
            ),
        ]
    )
    fig = px.bar(
        df,
        x="variable",
        y="value",
        color="type",
        animation_frame="Policy",
        color_discrete_map={"Gain": BLUE, "Loss": GRAY, "": WHITE},
    )
    variable_sums = df.groupby(["variable", "Policy"]).value.sum()
    fig.update_layout(
        title="Budget breakdown",
        xaxis_title="",
        yaxis_title="Yearly amount",
        yaxis_tickprefix="£",
        legend_title="",
        yaxis_range=(min(variable_sums.min(), 0), variable_sums.max()),
    )
    fig = format_fig(fig, show=False)
    fig.add_shape(
        type="line",
        xref="paper",
        yref="y",
        x0=0,
        y0=0,
        x1=1,
        y1=0,
        line=dict(color="grey", width=1, dash="dash"),
    )
    return fig.to_json()
