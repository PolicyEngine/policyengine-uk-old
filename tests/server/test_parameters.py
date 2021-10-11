from openfisca_uk.tests.microsimulation.test_parameters import generate_tests
from openfisca_uk import Microsimulation
from openfisca_uk_data.datasets.frs.frs import FRS
from policy_engine_uk.simulation.reforms import DEFAULT_REFORM
from openfisca_uk_data import FRS_WAS_Imputation

test_parameters = generate_tests(
    Microsimulation(DEFAULT_REFORM, dataset=FRS_WAS_Imputation, year=2019)
)
