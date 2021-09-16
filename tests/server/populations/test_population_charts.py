from policy_engine.populations.charts import (
    decile_chart,
    poverty_chart,
    population_waterfall_chart,
)
from openfisca_uk import Microsimulation, reforms
import pytest

baseline = Microsimulation()

reform_examples = (
    (),
    reforms.structural.abolish("personal_allowance"),
    reforms.parametric.set_parameter("tax.income_tax.rates.uk[0].rate", 0.21),
)

# Test charts for each reform


@pytest.mark.parametrize("reform", reform_examples)
def test_decile_chart(reform):
    decile_chart(baseline, Microsimulation(reform))


@pytest.mark.parametrize("reform", reform_examples)
def test_poverty_chart(reform):
    poverty_chart(baseline, Microsimulation(reform))


@pytest.mark.parametrize("reform", reform_examples)
def test_population_waterfall_chart(reform):
    population_waterfall_chart(
        (reform,), ["Reform"], baseline, Microsimulation(reform)
    )
