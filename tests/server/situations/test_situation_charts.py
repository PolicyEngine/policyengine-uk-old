from openfisca_uk import IndividualSim, reforms
from policy_engine_uk.situations.charts import (
    household_waterfall_chart,
    budget_chart,
    mtr_chart,
)
import pytest
import itertools

TEST_YEAR = 2021


def single_adult(sim):
    sim.add_person(age=18, name="p")
    sim.add_benunit(adults=["p"])
    sim.add_household(adults=["p"])
    return sim


situation_examples = (single_adult,)

empty_reform = ()
abolish_personal_allowance = reforms.structural.abolish("personal_allowance")
raise_basic_rate = reforms.parametric.set_parameter(
    "tax.income_tax.rates.uk[0].rate", 0.21
)

reform_examples = (
    empty_reform,
    abolish_personal_allowance,
    raise_basic_rate,
)


def individual_sim(reform=()):
    if reform == ():
        return IndividualSim(year=TEST_YEAR)
    return IndividualSim(reform, year=TEST_YEAR)


# Test charts for each possible (reform, situation) pair


@pytest.mark.parametrize(
    "situation,reform", itertools.product(situation_examples, reform_examples)
)
def test_household_waterfall_chart(situation, reform):
    baseline = situation(individual_sim())
    reformed = situation(individual_sim(reform))
    baseline.vary("employment_income")
    reformed.vary("employment_income")
    household_waterfall_chart(baseline, reformed)


@pytest.mark.parametrize(
    "situation,reform", itertools.product(situation_examples, reform_examples)
)
def test_budget_chart(situation, reform):
    baseline = situation(individual_sim())
    reformed = situation(individual_sim(reform))
    baseline.vary("employment_income")
    reformed.vary("employment_income")
    budget_chart(baseline, reformed)


@pytest.mark.parametrize(
    "situation,reform", itertools.product(situation_examples, reform_examples)
)
def test_mtr_chart(situation, reform):
    baseline = situation(individual_sim())
    reformed = situation(individual_sim(reform))
    baseline.vary("employment_income")
    reformed.vary("employment_income")
    mtr_chart(baseline, reformed)
