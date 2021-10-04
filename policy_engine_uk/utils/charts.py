import plotly.graph_objects as go
import plotly.express as px
import numpy as np
import pandas as pd
import json
from rdbl import gbp


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


def bar_data(start, amount, label):
    # Creates 1-2 bars which may include a blank white space or multiple
    # bars if it crosses the zero axis.
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
    # res.value = res.value.astype(int)
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


def tax_benefit_waterfall_data(baseline, reformed) -> pd.DataFrame:
    GROUPS = ["benefits", "tax"]
    MULTIPLIERS = [1, -1]
    effects = [
        (reformed.calc(var).sum() - baseline.calc(var).sum()) * multiplier
        for var, multiplier in zip(GROUPS, MULTIPLIERS)
    ]
    return waterfall_data(effects, GROUPS)


def hover_label(component, amount):
    res = component
    if amount == 0:
        res += " doesn't change"
    if amount > 0:
        res += " rise by " + gbp(amount)
    if amount < 0:
        res += " fall by " + gbp(-amount)
    return res


def add_dotted_xaxis(fig: go.Figure) -> None:
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


def waterfall_chart(baseline, reformed) -> dict:
    """[summary]

    :param baseline: [description]
    :type baseline: [type]
    :param reformed: [description]
    :type reformed: [type]
    :return: [description]
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
    fig.update_traces(hovertemplate="%{customdata[0]}")
    add_dotted_xaxis(fig)
    fig.update_layout(
        title="Budget breakdown",
        yaxis_title="Yearly amount",
        yaxis_tickprefix="£",
        showlegend=False,
        xaxis_title=None,
    )
    return format_fig(fig)
