from server.formatting import format_fig
from openfisca_uk import graphs, IndividualSim
from server.refactor.hypothetical.situation import get_situation_func
from server.refactor.utils.formatting import format_fig
import json
import plotly.express as px
import pandas as pd
import numpy as np
from ubicenter.plotly import GRAY


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
        )
        .update_traces(marker_color="#1890ff")
        .to_json()
    )



def mtr_chart(reform, situation):
    graph = graphs.mtr_chart(
        reform, situation_function=situation
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


def waterfall_chart(reform, params):
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
