import plotly.graph_objects as go
import plotly.express as px
import numpy as np
import pandas as pd
from typing import Union

CONFIG = {"displayModeBar": False}

WHITE = "#FFF"
BLUE = "#1976D2"  # Blue 700.
DARK_BLUE = "#0F4AA1"  # Blue 900.
GRAY = "#BDBDBD"
DARK_GRAY = "#616161"
LIGHT_GRAY = "#F5F5F5"
LIGHT_GREEN = "#C5E1A5"
DARK_GREEN = "#558B2F"


def format_fig(
    fig: go.Figure,
    show: bool = True,
) -> Union[None, go.Figure]:
    """Formats figure with styling and logo.

    :param fig: Plotly figure.
    :type fig: go.Figure
    :param show: Whether to show the figure, defaults to True.
        If False, returns the figure.
    :type show: bool
    :return: If show is True, nothing. If show is False, returns the
        formatted plotly figure.
    :rtype: go.Figure
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
    if show:
        fig.show(config=CONFIG)
    else:
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
