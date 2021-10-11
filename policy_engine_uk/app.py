from pathlib import Path
from typing import Tuple
from openfisca_core.parameters.parameter import Parameter
from openfisca_core.parameters.parameter_scale import ParameterScale
from openfisca_uk import Microsimulation, IndividualSim
from openfisca_uk_data.datasets.frs.frs_was_imputation import (
    FRS_WAS_Imputation,
)
from policy_engine_uk.simulation.situations import create_situation
from policy_engine_uk.simulation.reforms import (
    POLICYENGINE_PARAMETERS,
    create_reform,
    DEFAULT_REFORM,
)
from openfisca_uk.reforms.presets.current_date import use_current_parameters
from policy_engine_uk.populations.metrics import headline_metrics
from policy_engine_uk.populations.charts import (
    decile_chart,
    intra_decile_chart,
    poverty_chart,
    population_waterfall_chart,
)
from policy_engine_uk.situations.metrics import headline_figures
from policy_engine_uk.situations.charts import (
    household_waterfall_chart,
    mtr_chart,
    budget_chart,
)
from policyengine_core import PolicyEngine

import datetime

CURRENT_DATE = datetime.datetime.now().strftime("%Y-%m-%d")


class PolicyEngineUK(PolicyEngine):
    static_folder = Path(__file__).parent / "static"
    version: str = "0.1.11"
    cache_bucket_name: str = None  # "uk-policy-engine.appspot.com"
    Microsimulation: type = Microsimulation
    IndividualSim: type = IndividualSim
    default_reform: type = DEFAULT_REFORM
    default_dataset: type = FRS_WAS_Imputation
    client_endpoints: Tuple[str] = (
        "/",
        "/population-impact",
        "/household",
        "/situation",
        "/household-impact",
        "/faq",
    )
    api_endpoints: Tuple[str] = (
        "population_reform",
        "household_reform",
        "ubi",
        "parameters",
    )

    def population_reform(self, params: dict = None) -> dict:
        reform = create_reform(params)
        reformed = Microsimulation(
            (self.default_reform, reform), dataset=self.default_dataset
        )
        return dict(
            **headline_metrics(self.baseline, reformed),
            decile_chart=decile_chart(self.baseline, reformed),
            poverty_chart=poverty_chart(self.baseline, reformed),
            waterfall_chart=population_waterfall_chart(
                self.baseline, reformed
            ),
            intra_decile_chart=intra_decile_chart(self.baseline, reformed),
        )

    def household_reform(self, params: dict = None) -> dict:
        situation = create_situation(params)
        reform = create_reform(params)
        baseline_config = self.default_reform
        reform_config = self.default_reform, reform
        baseline = situation(IndividualSim(baseline_config, year=2021))
        reformed = situation(IndividualSim(reform_config, year=2021))
        headlines = headline_figures(baseline, reformed)
        waterfall = household_waterfall_chart(baseline, reformed)
        baseline.vary("employment_income", step=100)
        reformed.vary("employment_income", step=100)
        budget = budget_chart(baseline, reformed)
        mtr = mtr_chart(baseline, reformed)
        return dict(
            **headlines,
            waterfall_chart=waterfall,
            budget_chart=budget,
            mtr_chart=mtr,
        )

    def ubi(self, params: dict = None) -> dict:
        reform = create_reform(params)
        reformed = Microsimulation(
            (self.default_reform, reform), dataset=self.default_dataset
        )
        revenue = (
            self.baseline.calc("net_income").sum()
            - reformed.calc("net_income").sum()
        )
        UBI_amount = max(0, revenue / self.baseline.calc("people").sum())
        return {"UBI": float(UBI_amount)}

    def parameters(self, params: dict = None) -> dict:
        return POLICYENGINE_PARAMETERS


app = PolicyEngineUK().app
