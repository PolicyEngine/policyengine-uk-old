from policy_engine_uk.populations.metrics import poverty_rate, pct_change
from policy_engine_uk.utils.formatting import format_fig, BLUE, GRAY, DARK_BLUE
import plotly.express as px
from plotly.subplots import make_subplots
import json
import numpy as np
from openfisca_uk import Microsimulation
from openfisca_uk_data import FRS_WAS_Imputation
from openfisca_uk.reforms.presets.current_date import use_current_parameters
import pandas as pd

WHITE = "#FFF"


def decile_chart(baseline, reformed):
    income = baseline.calc("household_net_income", map_to="person")
    equiv_income = baseline.calc("equiv_household_net_income", map_to="person")
    gain = reformed.calc("household_net_income", map_to="person") - income
    changes = (
        gain.groupby(equiv_income.decile_rank()).sum()
        / income.groupby(equiv_income.decile_rank()).sum()
    )
    df = pd.DataFrame({"Decile": changes.index, "Change": changes.values})
    fig = (
        format_fig(px.bar(df, x="Decile", y="Change"), show=False)
        .update_layout(
            title="Change to net income by decile",
            xaxis_title="Equivalised disposable income decile",
            yaxis_title="Percentage change",
            yaxis_tickformat="%",
            showlegend=False,
            xaxis_tickvals=list(range(1, 11)),
        )
        .update_traces(marker_color=BLUE)
    )
    fig = add_zero_line(fig)
    return json.loads(fig.to_json())


def poverty_chart(baseline, reform):
    def pov_chg(criterion):
        return pct_change(
            poverty_rate(baseline, criterion), poverty_rate(reform, criterion)
        )

    df = pd.DataFrame(
        {
            "group": ["Child", "Working-age", "Senior", "All"],
            "pov_chg": [
                pov_chg(i)
                for i in ["is_child", "is_WA_adult", "is_SP_age", "people"]
            ],
        }
    )
    df["abs_chg_str"] = df.pov_chg.abs().map("{:.1%}".format)
    df["label"] = (
        np.where(df.group == "All", "Total", df.group)
        + " poverty "
        + np.where(
            df.abs_chg_str == "0.0%",
            "does not change",
            (np.where(df.pov_chg < 0, "falls ", "rises ") + df.abs_chg_str),
        )
    )
    fig = format_fig(
        px.bar(
            df,
            x="group",
            y="pov_chg",
            custom_data=["label"],
            labels={"group": "Group", "pov_chg": "Poverty rate change"},
        ),
        show=False,
    )
    fig.update_layout(
        title="Poverty impact by age",
        xaxis_title=None,
        yaxis=dict(title="Percent change", tickformat="%"),
    )
    fig.update_traces(marker_color=BLUE, hovertemplate="%{customdata[0]}")
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


def waterfall(values, labels, gain_label="Revenue", loss_label="Spending"):
    final_color = DARK_BLUE

    def amount_reform_type(amount, reform, type):
        return pd.DataFrame({"Amount": amount, "Reform": reform, "Type": type})

    if len(labels) == 0:
        df = amount_reform_type([], [], [])
    else:
        df = amount_reform_type(values, labels, "")
        if len(df) != 0:
            order = np.where(
                df.Amount >= 0, -np.log(df.Amount), 1e2 - np.log(-df.Amount)
            )
            df = df.set_index(order).sort_index().reset_index(drop=True)
            df["Type"] = np.where(df.Amount >= 0, gain_label, loss_label)
            base = np.array([0] + list(df.Amount.cumsum()[:-1]))
            final_value = df.Amount.cumsum().values[-1]
            if final_value >= 0:
                final_color = DARK_BLUE
            else:
                final_color = DARK_GRAY
            df = pd.concat(
                [
                    amount_reform_type(base, df.Reform, ""),
                    df,
                    amount_reform_type([final_value], ["Final"], ["Final"]),
                ]
            )
        else:
            df = amount_reform_type([], [], [])
    fig = px.bar(
        df.round(),
        x="Reform",
        y="Amount",
        color="Type",
        barmode="stack",
        color_discrete_map={
            gain_label: BLUE,
            loss_label: GRAY,
            "": WHITE,
            "Final": final_color,
        },
    )
    return format_fig(fig, show=False)


def total_income(sim):
    return sim.calc("net_income").sum()


def population_waterfall_chart(reform, labels, baseline, reformed):
    GROUPS = ["tax", "benefits"]
    MULTIPLIERS = [1, -1]
    effects = [
        (reformed.calc(var).sum() - baseline.calc(var).sum()) * multiplier
        for var, multiplier in zip(GROUPS, MULTIPLIERS)
    ]
    fig = waterfall(effects, ["Tax", "Benefit"])
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
    baseline_hh_net_income = baseline.calc(
        "household_net_income", map_to="person"
    )
    reformed_hh_net_income = reformed.calc(
        "household_net_income", map_to="person"
    )
    gain = reformed_hh_net_income - baseline_hh_net_income
    rel_gain = (gain / baseline_hh_net_income).dropna()
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
    TEXT_MAP = {
        "Gain more than 5%": "gain more than 5%",
        "Gain less than 5%": "gain less than 5%",
        "No change": "experience no change",
        "Lose less than 5%": "lose less than 5%",
        "Lose more than 5%": "lose more than 5%",
    }
    df["hover"] = (
        df.Fraction.apply(lambda x: "{:.0%}".format(x))
        + " of "
        + np.where(
            df.Decile == "All",
            "all people",
            "decile " + df.Decile.astype(str),
        )
        + " "
        + df.Outcome.map(TEXT_MAP)
    )

    def single_intra_decile_graph(df):
        return px.bar(
            df,
            x="Fraction",
            y="Decile",
            color="Outcome",
            custom_data=["hover"],
            color_discrete_sequence=INTRA_DECILE_COLORS,
            orientation="h",
        ).update_traces(hovertemplate="%{customdata[0]}")

    decile_fig = single_intra_decile_graph(df[df.Decile != "All"])
    total_fig = single_intra_decile_graph(df[df.Decile == "All"])
    fig = make_subplots(
        rows=2,
        cols=1,
        shared_xaxes=True,
        row_heights=[1, 10],
        vertical_spacing=0.05,
        x_title="Population share",
        y_title="Income decile",
    )
    fig.update_xaxes(showgrid=False)
    # Unused, delete?
    f = total_fig.full_figure_for_development(warn=False)
    fig.add_traces(total_fig.data, 1, 1)
    fig.add_traces(decile_fig.data, 2, 1)
    fig.update_layout(
        barmode="stack",
        title="Distribution of gains and losses",
    )
    fig = format_fig(fig, show=False)
    fig.update_xaxes(tickformat="%")
    for i in range(5):
        fig.data[i].showlegend = False
    return json.loads(fig.to_json())
