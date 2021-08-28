from server.populations.metrics import poverty_rate, pct_change
from server.utils.formatting import format_fig, BLUE, GRAY, DARK_BLUE
import plotly.express as px
from plotly.subplots import make_subplots
import json
import numpy as np
from openfisca_uk import Microsimulation
import pandas as pd

WHITE = "#FFF"


def decile_chart(baseline, reformed):
    income = baseline.calc("household_net_income", map_to="person")
    equiv_income = baseline.calc("equiv_household_net_income", map_to="person")
    gain = reformed.calc("household_net_income", map_to="person") - income
    changes = gain.groupby(equiv_income.decile_rank()).mean()
    df = pd.DataFrame({"Decile": changes.index, "Change": changes.values})
    fig = (
        format_fig(px.bar(df, x="Decile", y="Change"), show=False)
        .update_layout(
            title="Impact on net income by decile",
            xaxis_title="Equivalised disposable income decile",
            yaxis_title="Average change to net income",
            yaxis_tickprefix="£",
            showlegend=False,
            xaxis_tickvals=list(range(1, 11)),
        )
        .update_traces(marker_color=BLUE)
    )
    fig = add_zero_line(fig)
    return json.loads(fig.to_json())


def poverty_chart(baseline, reform):
    child = pct_change(
        poverty_rate(baseline, "is_child"), poverty_rate(reform, "is_child")
    )
    adult = pct_change(
        poverty_rate(baseline, "is_WA_adult"),
        poverty_rate(reform, "is_WA_adult"),
    )
    senior = pct_change(
        poverty_rate(baseline, "is_SP_age"), poverty_rate(reform, "is_SP_age")
    )
    person = pct_change(
        poverty_rate(baseline, "people"), poverty_rate(reform, "people")
    )
    df = pd.DataFrame(
        {
            "Group": ["Child", "Working-age", "Retired", "All"],
            "Poverty rate change": [child, adult, senior, person],
        }
    )
    fig = format_fig(
        px.bar(
            df,
            x="Group",
            y="Poverty rate change",
        ),
        show=False,
    )
    fig.update_layout(
        title="Poverty rate changes",
        xaxis=dict(title="Population"),
        yaxis=dict(title="Percent change", tickformat="%"),
    )
    fig.update_traces(marker_color=BLUE)
    fig = add_zero_line(fig)
    return json.loads(fig.to_json())


def spending(baseline, reformed):
    return (
        reformed.calc("net_income").sum() - baseline.calc("net_income").sum()
    )


def get_partial_funding(reform, baseline, **kwargs):
    expenditure = []
    for i in range(1, len(reform) + 1):
        expenditure += [
            spending(baseline, Microsimulation(reform[:i], **kwargs))
        ]
    return expenditure


def add_zero_line(fig):
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
    return fig


def waterfall(values, labels, gain_label="Spending", loss_label="Revenue"):
    df = pd.DataFrame(
        {
            "Amount": values,
            "Reform": labels,
        }
    )
    df = df[df.Amount != 0]
    order = np.where(
        df.Amount >= 0, -np.log(df.Amount), 1e2 - np.log(-df.Amount)
    )
    df = df.set_index(order).sort_index().reset_index(drop=True)
    df["Type"] = np.where(df.Amount >= 0, gain_label, loss_label)
    base = np.array([0] + list(df.Amount.cumsum()[:-1]))
    df = pd.concat(
        [
            pd.DataFrame(
                {
                    "Amount": base,
                    "Reform": df.Reform,
                    "Type": "",
                }
            ),
            df,
            pd.DataFrame(
                {
                    "Amount": [df.Amount.cumsum().values[-1]],
                    "Reform": ["Final"],
                    "Type": ["Final"],
                }
            ),
        ]
    )
    fig = px.bar(
        df,
        x="Reform",
        y="Amount",
        color="Type",
        barmode="stack",
        color_discrete_map={
            gain_label: BLUE,
            loss_label: GRAY,
            "": WHITE,
            "Final": DARK_BLUE,
        },
    )
    return format_fig(fig, show=False)


def population_waterfall_chart(reform, labels, baseline, reformed):
    net_income = [baseline.calc("net_income").sum()]
    for i in range(1, len(reform)):
        partially_reformed = Microsimulation(reform[:i])
        net_income += [partially_reformed.calc("net_income").sum()]
    net_income += [reformed.calc("net_income").sum()]
    net_income = np.array(net_income)
    budget_effects = net_income[1:] - net_income[:-1]
    fig = waterfall(budget_effects, labels)
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


def age_chart(baseline, reformed):
    income = baseline.calc("household_net_income", map_to="person")
    gain = reformed.calc("household_net_income", map_to="person") - income
    values = gain.groupby(baseline.calc("age")).mean().rolling(3).median()
    df = pd.DataFrame({"Age": values.index, "Change": values.values})
    fig = (
        format_fig(px.line(df, x="Age", y="Change"), show=False)
        .update_layout(
            title="Impact on net income by age",
            xaxis_title="Age",
            yaxis_title="Average change to net income",
            yaxis_tickprefix="£",
            showlegend=False,
        )
        .update_traces(marker_color=BLUE)
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
    return json.loads(fig.to_json())


NAMES = (
    "Gain more than 5%",
    "Gain less than 5%",
    "No change",
    "Lose less than 5%",
    "Lose more than 5%",
)


def intra_decile_graph_data(baseline, reformed):
    l = []
    income = baseline.calc("equiv_household_net_income", map_to="person")
    decile = income.decile_rank()
    gain = reformed.calc(
        "household_net_income", map_to="person"
    ) - baseline.calc("household_net_income", map_to="person")
    rel_gain = (
        gain / baseline.calc("household_net_income", map_to="person")
    ).dropna()
    bands = (None, 0.05, 1e-3, -1e-3, -0.05, None)
    for upper, lower, name in zip(bands[:-1], bands[1:], NAMES):
        fractions = []
        for j in range(1, 11):
            subset = rel_gain[decile == j]
            if lower is not None:
                subset = subset[rel_gain > lower]
            if upper is not None:
                subset = subset[rel_gain <= upper]
            fractions += [subset.count() / rel_gain[decile == j].count()]
        tmp = pd.DataFrame(
            {
                "Fraction": fractions,
                "Decile": list(map(str, range(1, 11))),
                "Outcome": name,
            }
        )
        l.append(tmp)
        subset = rel_gain
        if lower is not None:
            subset = subset[rel_gain > lower]
        if upper is not None:
            subset = subset[rel_gain <= upper]
        all_row = pd.DataFrame(
            {
                "Fraction": [subset.count() / rel_gain.count()],
                "Decile": "All",
                "Outcome": name,
            }
        )
        l.append(all_row)
    return pd.concat(l).reset_index()


DARK_GRAY = "#616161"
LIGHT_GRAY = "#F5F5F5"
LIGHT_GREEN = "#C5E1A5"
DARK_GREEN = "#558B2F"
INTRA_DECILE_COLORS = (
    DARK_GRAY,
    GRAY,
    LIGHT_GRAY,
    LIGHT_GREEN,
    DARK_GREEN,
)[::-1]


def intra_decile_chart(baseline, reformed):
    df = intra_decile_graph_data(baseline, reformed)
    fig1 = px.bar(
        df[df.Decile != "All"],
        x="Fraction",
        y="Decile",
        color="Outcome",
        color_discrete_sequence=INTRA_DECILE_COLORS,
        orientation="h",
    )
    fig2 = px.bar(
        df[df.Decile == "All"],
        x="Fraction",
        y="Decile",
        color="Outcome",
        color_discrete_sequence=INTRA_DECILE_COLORS,
        orientation="h",
    )
    fig = make_subplots(
        rows=2,
        cols=1,
        shared_xaxes=True,
        row_heights=[1, 10],
        vertical_spacing=0.05,
        x_title="Outcome distribution",
        y_title="Income decile",
    )
    fig.update_xaxes(showgrid=False)
    f = fig2.full_figure_for_development(warn=False)
    fig.add_traces(fig2.data, 1, 1)
    fig.add_traces(fig1.data, 2, 1)
    fig.update_layout(barmode="stack")
    fig = format_fig(fig, show=False).update_layout(
        title="Intra-decile outcomes",
        xaxis_tickformat="%",
    )
    fig.update_xaxes(tickformat="%")
    for i in range(5):
        fig.data[i].showlegend = False
    return json.loads(fig.to_json())
