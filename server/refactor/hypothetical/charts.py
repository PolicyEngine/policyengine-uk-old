from server.formatting import format_fig
from openfisca_uk import graphs, IndividualSim
from server.refactor.utils.formatting import format_fig
import json
import plotly.express as px
import pandas as pd
import numpy as np
from ubicenter.plotly import GRAY, BLUE
WHITE = "#FFF"


def budget_chart(reform, situation):
    graph = graphs.budget_chart(
        reform, situation_function=situation
    )
    return json.loads(
        format_fig(graph, show=False)
        .update_layout(
            title="Net income by employment income",
            xaxis_title="Employment income",
            yaxis_title="Yearly amount",
            yaxis_tickprefix="£",
            showlegend=False
        )
        .update_traces(marker_color="#1890ff")
        .to_json()
    )



def mtr_chart(reform, situation):
    graph = graphs.mtr_chart(
        reform, situation_function=situation
    )
    return json.loads(
        format_fig(graph, show=False)
        .update_layout(
            title="Effective marginal tax rate by employment income",
            xaxis_title="Employment income",
            yaxis_title="Effective MTR",
            showlegend=False
        )
        .update_traces(marker_color="#1890ff")
        .to_json()
    )


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


def budget_waterfall_chart(reform, situation):
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
    return json.loads(fig.to_json())
