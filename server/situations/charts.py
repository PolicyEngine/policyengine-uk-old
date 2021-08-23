from openfisca_uk import graphs, IndividualSim
from server.utils.formatting import DARK_BLUE, format_fig
import json
import plotly.express as px
import pandas as pd
import numpy as np
from ubicenter.plotly import GRAY, BLUE

WHITE = "#FFF"

COLOR_MAP = {
    "Baseline": GRAY,
    "Reform": BLUE,
    "Gain": BLUE,
    "Loss": GRAY,
    "": WHITE,
    "Final": DARK_BLUE,
}


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
        color_discrete_map=COLOR_MAP,
    )
    return json.loads(
        format_fig(graph, show=False)
        .update_layout(
            title="Net income by employment income",
            xaxis_title="Employment income",
            yaxis_title="Household net income",
            yaxis_tickprefix="£",
            xaxis_tickprefix="£",
            legend_title="",
        )
        .to_json()
    )


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
        color_discrete_map=COLOR_MAP,
    )
    return json.loads(
        format_fig(graph, show=False)
        .update_layout(
            title="Effective marginal tax rate by employment income",
            xaxis_title="Employment income",
            xaxis_tickprefix="£",
            yaxis_tickformat="%",
            yaxis_title="Effective MTR",
            legend_title="",
        )
        .to_json()
    )


COMPONENT_SIGN = dict(
    employment_income=True,
    self_employment_income=True,
    pension_income=True,
    savings_interest_income=True,
    dividend_income=True,
    income_tax=False,
    national_insurance=False,
    universal_credit=True,
    child_benefit=True,
    UBI=True,
    net_income=True,
)


def get_variables(sim: IndividualSim, variables: dict = None) -> pd.DataFrame:
    """Creates DataFrame of total amount of each variable for an individual
    simulation.

    :param sim: Simulation.
    :type sim: IndividualSim
    :param variables: Dict of variables to sum and whether they are positive
        or negative. Defaults to COMPONENT_SIGN.
    :type variables: dict, optional
    :return: DataFrame with one row per variable and columns for value,
        type (Gain or Loss), and is_value (always True).
    :rtype: pd.DataFrame
    """
    if variables is None:
        variables = COMPONENT_SIGN
    amounts = []
    for variable in COMPONENT_SIGN.keys():
        try:
            amounts += [sim.calc(variable).sum()]
        except:
            amounts += [0]
    df = pd.DataFrame(
        dict(
            variable=COMPONENT_SIGN.keys(),
            value=amounts,
            type=np.where(list(COMPONENT_SIGN.values()), "Gain", "Loss"),
            is_value=True,
        )
    )
    df.value *= np.where(list(COMPONENT_SIGN.values()), 1, -1)
    return df[df.variable.isin(variables)].reset_index(drop=True)


KEY_TO_LABEL = dict(
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


def get_budget_waterfall_data(
    sim: IndividualSim, label: str = "Baseline", variables: list = None
) -> pd.DataFrame:
    """Returns a dataframe with the budget breakdown for a given simulation.

    :param sim: Simulation.
    :type sim: IndividualSim
    :param label: Value of Policy column in returned DataFrame, defaults to
        "Baseline"
    :type label: str, optional
    :param variables: List of variables to produce waterfall chart of,
        defaults to COMPONENT_SIGN
    :type variables: list, optional
    :return: DataFrame with budget breakdown.
    :rtype: pd.DataFrame
    """
    if variables is None:
        variables = COMPONENT_SIGN
    df = get_variables(sim, variables=variables)
    net_income = df[df.variable == "net_income"].copy()
    net_income.type = ["Final"]
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
    df.variable = df.variable.map(KEY_TO_LABEL).fillna("")
    df["Policy"] = label
    return df


def budget_waterfall_chart(
    baseline: IndividualSim, reformed: IndividualSim
) -> str:
    """Returns a chart with the budget breakdown for a given simulation.

    :param sim: Simulation.
    :type sim: IndividualSim
    :param label: Value of Policy column in returned DataFrame, defaults to
        "Baseline"
    :type label: str, optional
    :param variables: List of variables to produce waterfall chart of,
        defaults to COMPONENTS
    :type variables: list, optional
    :return: Representation of the budget waterfall plotly chart as a JSON
        string.
    :rtype: str
    """

    def nonzero_variables(sim):
        var_df = get_variables(sim)
        return var_df[var_df.value != 0].variable.unique().tolist()

    variables = list(
        set(nonzero_variables(baseline) + nonzero_variables(reformed))
    )
    df = pd.concat(
        [
            get_budget_waterfall_data(
                baseline, "Baseline", variables=variables
            ),
            get_budget_waterfall_data(reformed, "Reform", variables=variables),
        ]
    )
    fig = px.bar(
        df.rename(
            columns={
                "type": "Type",
                "value": "Amount",
                "variable": "Component",
            }
        ),
        x="Component",
        y="Amount",
        color="Type",
        animation_frame="Policy",
        color_discrete_map=COLOR_MAP,
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
