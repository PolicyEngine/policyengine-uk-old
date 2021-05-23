import plotly.express as px
import plotly.graph_objects as go
from openfisca_uk import IndividualSim

def create_decile_plot(gain, old_income):
    return px.bar(gain.groupby(old_income.percentile_rank()).mean().rolling(3).mean()).update_layout(
        title="Income effect by percentile",
        xaxis_title="Equivalised disposable income percentile",
        yaxis_title="Average income effect",
        yaxis_tickprefix="£",
        template="plotly_white",
        showlegend=False,
    ).update_traces(marker_color='#1890ff').to_json()

def create_age_plot(gain, sim):
    return px.bar(gain.groupby(sim.calc("age")).mean().rolling(3).median()).update_layout(
        title="Income effect by age",
        xaxis_title="Age",
        yaxis_title="Average income effect",
        yaxis_tickprefix="£",
        template="plotly_white",
        showlegend=False
    ).update_traces(marker_color='#1890ff').to_json()

def percent_change(x, y):
    return (y - x) / x

def poverty_rate(sim, population_var):
    return sim.calc("in_poverty_bhc", map_to="person")[sim.calc(population_var) > 0].mean()

def poverty_chart(baseline, reform):
    child = percent_change(poverty_rate(baseline, "is_child"), poverty_rate(reform, "is_child"))
    adult = percent_change(poverty_rate(baseline, "is_WA_adult"), poverty_rate(reform, "is_WA_adult"))
    senior = percent_change(poverty_rate(baseline, "is_SP_age"), poverty_rate(reform, "is_SP_age"))
    person = percent_change(poverty_rate(baseline, "people"), poverty_rate(reform, "people"))
    fig = px.bar(x=["Child", "Working-age", "Retired", "All"], y=[child, adult, senior, person])
    fig.update_layout(template="plotly_white", title="Poverty rate changes", xaxis=dict(title="Population"), yaxis=dict(title="Percent change", tickformat="%"))
    return fig.update_traces(marker_color='#1890ff').to_json()