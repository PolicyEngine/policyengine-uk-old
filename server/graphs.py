import plotly.express as px
import plotly.graph_objects as go
from openfisca_uk import IndividualSim
import pandas as pd
from formatting import format_fig


def create_decile_plot(gain, old_income):
    return (
        format_fig(
            px.bar(gain.groupby(old_income.decile_rank()).mean()), show=False
        )
        .update_layout(
            title="Impact on net income by decile",
            xaxis_title="Equivalised disposable income decile",
            yaxis_title="Average change to net income",
            yaxis_tickprefix="£",
            showlegend=False,
        )
        .update_traces(marker_color="#1890ff")
        .to_json()
    )


def create_age_plot(gain, sim):
    values = gain.groupby(sim.calc("age")).mean().rolling(3).median()
    return (
        format_fig(px.line(values), show=False)
        .update_layout(
            title="Impact on net income by age",
            xaxis_title="Age",
            yaxis_title="Average change to net income",
            yaxis_tickprefix="£",
            showlegend=False,
        )
        .update_traces(marker_color="#1890ff")
        .to_json()
    )


def percent_change(x, y):
    return (y - x) / x


def poverty_rate(sim, population_var):
    return sim.calc("in_poverty_bhc", map_to="person")[
        sim.calc(population_var) > 0
    ].mean()


def poverty_chart(baseline, reform):
    child = percent_change(
        poverty_rate(baseline, "is_child"), poverty_rate(reform, "is_child")
    )
    adult = percent_change(
        poverty_rate(baseline, "is_WA_adult"),
        poverty_rate(reform, "is_WA_adult"),
    )
    senior = percent_change(
        poverty_rate(baseline, "is_SP_age"), poverty_rate(reform, "is_SP_age")
    )
    person = percent_change(
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
    return fig.update_traces(marker_color="#1890ff").to_json()


def hypothetical_tax_chart(reform_obj):
    def plot_budget(household_config, title):
        BLUE = "#1890ff"  # "#1976D2"
        GREY = "#BDBDBD"
        individual_colors = [GREY, BLUE]
        baseline_policy = IndividualSim(year=2020)
        household_config(baseline_policy)
        baseline_policy.vary("employment_income")
        employment_income = baseline_policy.calc("employment_income")[0]
        reform_policy = IndividualSim(reform_obj, year=2020)
        household_config(reform_policy)
        reform_policy.vary("employment_income")
        df = pd.DataFrame(
            {
                "Net income (Baseline)": baseline_policy.calc(
                    "household_net_income"
                )[0],
                "Net income (Reform)": reform_policy.calc(
                    "household_net_income"
                )[0],
                "Tax (Baseline)": baseline_policy.calc("tax")[0],
                "Tax (Reform)": reform_policy.calc("tax")[0],
                "Benefits (Baseline)": baseline_policy.calc("benefits")[0],
                "Benefits (Reform)": reform_policy.calc("benefits")[0],
                "Employment income": employment_income,
                "MTR (Baseline)": 1
                - baseline_policy.calc_deriv(
                    "household_net_income",
                    var_target="household",
                    wrt_target="adult",
                ),
                "MTR (Reform)": 1
                - reform_policy.calc_deriv(
                    "household_net_income",
                    var_target="household",
                    wrt_target="adult",
                ),
                "Tax MTR (Baseline)": baseline_policy.calc_deriv(
                    "tax", var_target="adult", wrt_target="adult"
                ),
                "Tax MTR (Reform)": reform_policy.calc_deriv(
                    "tax", var_target="adult", wrt_target="adult"
                ),
                "Income Tax MTR (Baseline)": baseline_policy.calc_deriv(
                    "income_tax", var_target="adult", wrt_target="adult"
                ),
                "Income Tax MTR (Reform)": reform_policy.calc_deriv(
                    "income_tax", var_target="adult", wrt_target="adult"
                ),
                "NI MTR (Baseline)": baseline_policy.calc_deriv(
                    "national_insurance",
                    var_target="adult",
                    wrt_target="adult",
                ),
                "NI MTR (Reform)": reform_policy.calc_deriv(
                    "national_insurance",
                    var_target="adult",
                    wrt_target="adult",
                ),
                "Benefit MTR (Baseline)": -baseline_policy.calc_deriv(
                    "benefits", var_target="adult", wrt_target="adult"
                ),
                "Benefit MTR (Reform)": -reform_policy.calc_deriv(
                    "benefits", var_target="adult", wrt_target="adult"
                ),
            }
        )

        fig = format_fig(
            px.line(
                df,
                x="Employment income",
                y=[
                    "Net income (Baseline)",
                    "Net income (Reform)",
                    "Tax (Baseline)",
                    "Tax (Reform)",
                    "Benefits (Baseline)",
                    "Benefits (Reform)",
                ],
                color_discrete_sequence=individual_colors,
            ),
            show=False,
        )
        fig.update_layout(
            title=title,
            yaxis_tickprefix="£",
            xaxis_tickprefix="£",
            yaxis_title="Yearly amount",
            xaxis_title="Employment income",
            showlegend=True,
            legend_title_text="",
        )
        hidden = [False] * 2 + [True] * 4
        for i in range(6):
            if hidden[i]:
                fig.data[i].visible = "legendonly"
        return fig

    def single_parent_UC(sim):
        sim.add_person(age=26, is_benunit_head=True, name="adult")
        sim.add_benunit(adults=["adult"], claims_UC=True)
        sim.add_household(adults=["adult"])

    fig = plot_budget(
        single_parent_UC,
        "Budget effect (Single person)",
    )

    return fig.to_json()


def average_mtr_changes(baseline_mtr, reform_sim):
    avg_mtr = lambda sim: float(
        (1 - sim.deriv("household_net_income", wrt="employment_income"))[
            sim.calc("is_adult")
        ]
        .dropna()
        .mean()
    )
    fig = (
        format_fig(
            px.bar(
                x=["Baseline", "Reform"],
                y=[baseline_mtr, avg_mtr(reform_sim)],
            ),
            show=False,
        )
        .update_layout(
            title="Changes to marginal tax rates",
            xaxis_title="Policy",
            yaxis_title="Average effective marginal tax rate",
            yaxis_tickformat="%",
            showlegend=False,
        )
        .update_traces(marker_color="#1890ff")
    )
    return fig.to_json()
