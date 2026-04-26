import os

import pytest

if os.getenv("POLICYENGINE_SKIP_EXTERNAL_DATA") == "1":
    pytest.skip(
        "External FRS/WAS microdata is unavailable in CI.",
        allow_module_level=True,
    )

from policy_engine_uk.populations.charts import (
    decile_chart,
    poverty_chart,
    population_waterfall_chart,
)
from openfisca_uk import Microsimulation, reforms
from openfisca_uk_data import FRS_WAS_Imputation

baseline = Microsimulation(dataset=FRS_WAS_Imputation)

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
    population_waterfall_chart(baseline, Microsimulation(reform))
