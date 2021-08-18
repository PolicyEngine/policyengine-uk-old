from server.populations.metrics import poverty_rate, pct_change
from server.utils.formatting import format_fig, BLUE, GRAY
import plotly.express as px
import json
import numpy as np
from openfisca_uk import Microsimulation
import pandas as pd

WHITE = "#FFF"


def decile_chart(baseline, reformed):
    income = baseline.calc("household_net_income", map_to="person")
    equiv_income = baseline.calc("equiv_household_net_income", map_to="person")
    gain = reformed.calc("household_net_income", map_to="person") - income
    fig = (
        format_fig(
            px.bar(gain.groupby(equiv_income.decile_rank()).mean()), show=False
        )
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
    fig = format_fig(
        px.bar(
            x=["Child", "Working-age", "Retired", "All"],
            y=[child, adult, senior, person],
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


def waterfall_chart(reform, components, baseline, **kwargs):
    partial_funding = np.array(
        [0] + get_partial_funding(reform, baseline, **kwargs)
    )
    spending = partial_funding[1:] - partial_funding[:-1]
    final_spending = partial_funding[-1]
    df = pd.DataFrame(
        {
            "Component": components,
            "Spending": spending,
            "Type": np.where(spending > 0, "Spending", "Revenue"),
            "is_value": True,
        }
    )
    df = df[df.Spending != 0].reset_index(drop=True)
    base = pd.Series([0] + list(df.Spending.cumsum()))
    for i in range(1, len(base)):
        if base[i] < base[i - 1]:
            base[i - 1] = base[i]
    df.Spending = df.Spending.abs()
    df = pd.concat(
        [
            pd.DataFrame(
                dict(
                    Component=df.Component,
                    Spending=base,
                    Type="",
                    is_value=False,
                )
            ),
            df,
        ]
    )
    df = pd.concat(
        [
            df,
            pd.DataFrame(
                dict(
                    Component=["Net cost"],
                    Spending=[final_spending],
                    Type=np.where(
                        np.array([final_spending]) > 0, "Spending", "Revenue"
                    ),
                    is_value=[True],
                )
            ),
        ]
    )
    df = df[~df.Component.isna()]
    fig = format_fig(
        px.bar(
            df,
            x="Component",
            y="Spending",
            color="Type",
            barmode="stack",
            color_discrete_map={"Revenue": BLUE, "Spending": GRAY, "": WHITE},
        ).update_layout(
            title="Funding breakdown", legend_title="", yaxis_tickprefix="£"
        ),
        show=False,
    )
    fig = add_zero_line(fig)
    return json.loads(fig.to_json())


def age_chart(baseline, reformed):
    income = baseline.calc("household_net_income", map_to="person")
    gain = reformed.calc("household_net_income", map_to="person") - income
    values = gain.groupby(baseline.calc("age")).mean().rolling(3).median()
    fig = (
        format_fig(px.line(values), show=False)
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
