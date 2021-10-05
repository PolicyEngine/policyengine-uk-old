import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import json
from rdbl import gbp
from openfisca_uk import Microsimulation, IndividualSim
from typing import Union


WHITE = "#FFF"
BLUE = "#1976D2"  # Blue 700.
DARK_BLUE = "#0F4AA1"  # Blue 900.
GRAY = "#BDBDBD"
DARK_GRAY = "#616161"
LIGHT_GRAY = "#F5F5F5"
LIGHT_GREEN = "#C5E1A5"
DARK_GREEN = "#558B2F"


def format_fig(fig: go.Figure) -> dict:
    """Formats figure with styling and returns as JSON.

    :param fig: Plotly figure.
    :type fig: go.Figure
    :return: Formatted plotly figure as a JSON dict.
    :rtype: dict
    """
    fig.update_xaxes(
        title_font=dict(size=16, color="black"), tickfont={"size": 14}
    )
    fig.update_yaxes(
        title_font=dict(size=16, color="black"), tickfont={"size": 14}
    )
    fig.update_layout(
        hoverlabel_align="right",
        font_family="Roboto",
        title_font_size=20,
        plot_bgcolor="white",
        paper_bgcolor="white",
    )
    return json.loads(fig.to_json())


def bar_data(start: float, amount: float, label: str) -> pd.DataFrame:
    """Generates a pair of data points for a waterfall bar.

    :param start: Starting value of bar.
    :type start: float
    :param amount: Amount of bar.
    :type amount: float
    :return: DataFrame with two rows:
        - In the case of start and end (start + amount) being on the same side
        of zero, it will be one for the hidden white bar and one for the
        true value.
        - In the case of start and end being on opposite sides of zero, it will
        be one for the positive value and one for the negative value.
        Each row contains columns for value and color (which are specific to
        the row), and label and amount (which are the same for both rows).
    :rtype: pd.DataFrame
    """
    end = amount + start
    res = pd.DataFrame(index=[0, 1], columns=["value", "color"])
    amount_color = "positive" if amount > 0 else "negative"
    if start > 0:
        if end > 0:
            # Empty white space then a bar from start to end.
            res.iloc[0] = min(start, end), "blank"
            res.iloc[1] = abs(start - end), amount_color
        else:
            # Two bars for positive and negative sections.
            res.iloc[0] = start, amount_color
            res.iloc[1] = end, amount_color
    else:
        if end < 0:
            # Empty white space then a bar from start to end.
            res.iloc[0] = -abs(start - end), amount_color
            res.iloc[1] = max(start, end), "blank"
        else:
            # Two bars for positive and negative sections.
            res.iloc[1] = end, amount_color
            res.iloc[0] = start, amount_color
    res["label"] = label
    res["amount"] = amount
    return res


def waterfall_data(amounts: list, labels: list) -> pd.DataFrame:
    """Generates data for waterfall charts.

    :param amounts: List of amounts.
    :type amounts: list
    :param labels: List of labels corresponding to each amount.
    :type labels: list
    :return: DataFrame with two rows for each amount plus the total.
    :rtype: pd.DataFrame
    """
    l = []
    components = pd.DataFrame(dict(amount=amounts), index=labels)
    components.loc["total"] = dict(amount=components.amount.sum())
    components["start"] = [0] + components.amount.cumsum()[:-2].tolist() + [0]
    # Create two rows per component to include difference from zero.
    for index, row in components.iterrows():
        l.append(bar_data(row.start, row.amount, index))
    return pd.concat(l)


def tax_benefit_waterfall_data(
    baseline: Union[Microsimulation, IndividualSim],
    reformed: Union[Microsimulation, IndividualSim],
) -> pd.DataFrame:
    GROUPS = ["benefits", "tax"]
    MULTIPLIERS = [1, -1]
    effects = [
        (reformed.calc(var).sum() - baseline.calc(var).sum()) * multiplier
        for var, multiplier in zip(GROUPS, MULTIPLIERS)
    ]
    return waterfall_data(effects, GROUPS)


def hover_label(component: str, amount: float) -> str:
    res = component
    if amount == 0:
        res += " doesn't change"
    if amount > 0:
        res += " rise by " + gbp(amount)
    if amount < 0:
        res += " fall by " + gbp(-amount)
    return res


def add_zero_line(fig: go.Figure) -> None:
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


def waterfall_chart(
    baseline: Union[Microsimulation, IndividualSim],
    reformed: Union[Microsimulation, IndividualSim],
) -> dict:
    """Create a waterfall chart for tax and benefit changes.

    :param baseline: Baseline simulation.
    :type baseline: Union[Microsimulation, IndividualSim]
    :param reformed: Reform simulation.
    :type reformed: Union[Microsimulation, IndividualSim]
    :return: Waterfall chart as a JSON dict.
    :rtype: dict
    """
    data = tax_benefit_waterfall_data(baseline, reformed)
    data["hover"] = data.apply(
        lambda x: hover_label(x.label, x.amount), axis=1
    )
    fig = px.bar(
        data,
        "label",
        "value",
        "color",
        custom_data=["hover"],
        color_discrete_map=dict(blank=WHITE, negative=GRAY, positive=BLUE),
        barmode="relative",
        category_orders={
            "label": ["tax", "benefits", "total"],
            "color": ["blank", "negative", "positive"],
        },
        labels=dict(tax="Taxes", benefit="Benefits", total="Net"),
    )
    add_custom_hovercard(fig)
    add_zero_line(fig)
    fig.update_layout(
        title="Budget breakdown",
        yaxis_title="Yearly amount",
        yaxis_tickprefix="£",
        showlegend=False,
        xaxis_title=None,
    )
    return format_fig(fig)


def ordinal(n: int) -> str:
    """ Create an ordinal number (1st, 2nd, etc.) from an integer.

    Source: https://stackoverflow.com/a/20007730/1840471

    :param n: Number.
    :type n: int
    :return: Ordinal number (1st, 2nd, etc.).
    :rtype: str
    """
    return "%d%s" % (n,"tsnrhtdd"[(n//10%10!=1)*(n%10<4)*n%10::4])

def add_custom_hovercard(fig: go.Figure) -> None:
    """Add a custom hovercard to the figure based on the first element of
    customdata, without the title to the right.

    :param fig: Plotly figure.
    :type fig: go.Figure
    """
    # Per https://stackoverflow.com/a/69430974/1840471.
    fig.update_traces(hovertemplate="%{customdata[0]}<extra></extra>")
