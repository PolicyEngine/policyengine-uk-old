from plotly import graph_objects as go
from typing import Union

CONFIG = {"displayModeBar": False}

WHITE = "#FFF"
BLUE = "#1976D2"  # Blue 700.
DARK_BLUE = "#0F4AA1"  # Blue 900.
GRAY = "#BDBDBD"


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
