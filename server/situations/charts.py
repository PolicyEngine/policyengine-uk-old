from openfisca_uk import IndividualSim
from server.utils.formatting import format_fig
from server.populations.charts import waterfall
import json
import plotly.express as px
import pandas as pd
import numpy as np
from ubicenter.plotly import GRAY, BLUE

WHITE = "#FFF"


def budget_chart(baseline, reformed):
    df = pd.DataFrame(
        {
            "Employment income": baseline.calc("employment_income").sum(
                axis=0
            ),
            "Baseline": baseline.calc("net_income").sum(axis=0),
            "Reform": reformed.calc("net_income").sum(axis=0),
        }
    )
    graph = px.line(
        df,
        x="Employment income",
        y=["Baseline", "Reform"],
        labels={"variable": "Policy", "value": "Net income"},
        color_discrete_map={"Baseline": GRAY, "Reform": BLUE},
    )
    return json.loads(
        format_fig(graph, show=False)
        .update_layout(
            title="Net income by employment income",
            xaxis_title="Employment income",
            yaxis_title="Household net income",
            yaxis_tickprefix="£",
            xaxis_tickprefix="£",
            legend_title="Policy",
        )
        .to_json()
    )


def mtr_chart(baseline, reformed):
    earnings = baseline.calc("employment_income").sum(axis=0)
    baseline_net = baseline.calc("net_income").sum(axis=0)
    reform_net = reformed.calc("net_income").sum(axis=0)
    get_mtr = lambda x, y: 1 - ((y[1:] - y[:-1]) / (x[1:] - x[:-1]))
    baseline_mtr = get_mtr(earnings, baseline_net)
    reform_mtr = get_mtr(earnings, reform_net)
    df = pd.DataFrame(
        {
            "Employment income": earnings[:-1],
            "Baseline": baseline_mtr,
            "Reform": reform_mtr,
        }
    )
    graph = px.line(
        df,
        x="Employment income",
        y=["Baseline", "Reform"],
        labels={"variable": "Policy", "value": "Effective MTR"},
        color_discrete_map={"Baseline": GRAY, "Reform": BLUE},
    )
    return json.loads(
        format_fig(graph, show=False)
        .update_layout(
            title="Effective marginal tax rate by employment income",
            xaxis_title="Employment income",
            xaxis_tickprefix="£",
            yaxis_tickformat="%",
            yaxis_title="Effective MTR",
            legend_title="Policy",
        )
        .to_json()
    )


def household_waterfall_chart(reform, labels, situation, baseline, reformed):
    net_income = [baseline.calc("net_income").sum()]
    for i in range(1, len(reform)):
        partially_reformed = situation(IndividualSim(reform[:i], year=2021))
        net_income += [partially_reformed.calc("net_income").sum()]
    net_income += [reformed.calc("net_income").sum()]
    net_income = np.array(net_income)
    budget_effects = net_income[1:] - net_income[:-1]
    fig = waterfall(
        budget_effects, labels, gain_label="Gain", loss_label="Loss"
    )
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
    fig.update_layout(
        title="Budget breakdown",
        xaxis_title="",
        yaxis_title="Yearly amount",
        yaxis_tickprefix="£",
        legend_title="",
    )
    return json.loads(fig.to_json())
