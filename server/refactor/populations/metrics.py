

from openfisca_uk import Microsimulation
from rdbl import gbp

pct_change = lambda x, y: (y - x) / x

def poverty_rate(sim, population_var):
    return sim.calc("in_poverty_bhc", map_to="person", period=2021)[
        sim.calc(population_var) > 0
    ].mean()


def get_headline_metrics(baseline: Microsimulation, reformed: Microsimulation):
    new_income = reformed.calc("equiv_household_net_income", map_to="person")
    old_income = baseline.calc(
        "equiv_household_net_income", map_to="person"
    )
    gain = new_income - old_income
    net_cost = (
        reformed.calc("net_income").sum() - baseline.calc("net_income").sum()
    )
    poverty_change = pct_change(
            baseline.calc("in_poverty_bhc", map_to="person").mean(),
            reformed.calc("in_poverty_bhc", map_to="person").mean(),
        )
    winner_share = (gain > 0).mean()
    loser_share = (gain < 0).mean()
    gini_change = pct_change(old_income.gini(), new_income.gini())
    return dict(
        net_cost=gbp(net_cost),
        poverty_change=float(poverty_change),
        winner_share=float(winner_share),
        loser_share=float(loser_share),
        gini_change=float(gini_change)
    )