import plotly.express as px


def create_decile_plot(gain, old_income):
    return px.bar(gain.groupby(old_income.percentile_rank()).mean()).update_layout(
        title="Income effect by percentile",
        xaxis_title="Equivalised disposable income percentile",
        yaxis_title="Average income effect",
        yaxis_tickprefix="£",
        template="plotly_white",
        showlegend=False
    ).to_json()

def percent_change(x, y):
    return (y - x) / x

def poverty_rate(sim, population_var):
    return sim.calc("in_poverty_bhc", map_to="person")[sim.calc(population_var) > 0].mean()

def poverty_chart(baseline, reform):
    child = percent_change(poverty_rate(baseline, "is_child"), poverty_rate(reform, "is_child"))
    adult = percent_change(poverty_rate(baseline, "is_WA_adult"), poverty_rate(reform, "is_WA_adult"))
    senior = percent_change(poverty_rate(baseline, "is_SP_age"), poverty_rate(reform, "is_SP_age"))
    fig = px.bar(x=["Child", "Working-age", "Retired"], y=[child, adult, senior])
    fig.update_layout(template="plotly_white", title="Poverty rate changes", xaxis=dict(title="Population"), yaxis=dict(title="Percent change", tickformat="%"))
    return fig.to_json()