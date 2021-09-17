from policy_engine.simulation.reforms import create_reform
from openfisca_uk import Microsimulation
import pytest

REFORM_EXAMPLES = (
    dict(),
    dict(policy_basic_rate=25),
    dict(policy_basic_rate=25, policy_adult_UBI=20),
    dict(policy_LVT=4),
)


@pytest.mark.parametrize("reform", REFORM_EXAMPLES)
def test_reform(reform: dict):
    reform_obj = create_reform(reform)
    Microsimulation(reform_obj).calc("net_income")
