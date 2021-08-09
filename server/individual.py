from openfisca_uk import IndividualSim
import numpy as np


def get_sims(reform_obj, params):
    baseline = IndividualSim(year=2021)
    reformed = IndividualSim(reform_obj, year=2021)
    household = params["situation"]["household"]
    for sim in (baseline, reformed):
        num_families = len(household["families"])
        hh_adults = []
        hh_children = []
        for i in range(num_families):
            family = household["families"][i]
            num_people = len(family["people"])
            bu_adults = []
            bu_children = []
            head_assigned = False
            for j in range(num_people):
                person = family["people"][j]
                name = f"family-{i}-person-{j}"
                age = person["age"]["value"]
                earnings = person["employment_income"]["value"]
                is_head = age >= 18 and not head_assigned
                if is_head:
                    head_assigned = True
                sim.add_person(
                    name=name,
                    age=age,
                    employment_income=earnings,
                    is_benunit_head=is_head,
                    is_household_head=is_head,
                )
                if person["age"]["value"] >= 18:
                    bu_adults += [name]
                else:
                    bu_children += [name]
            sim.add_benunit(adults=bu_adults, children=bu_children, claims_UC=True)
            hh_adults += bu_adults
            hh_children += bu_children
        sim.add_household(adults=hh_adults, children=hh_children)
    return baseline, reformed


def get_headline_figures(baseline, reformed):
    getValue = lambda sim, name: float(np.array(sim.calc(name)).sum())
    getValues = lambda name: {
        "old": getValue(baseline, name),
        "new": getValue(reformed, name),
    }
    return {
        name: getValues(name)
        for name in [
            "tax",
            "income_tax",
            "national_insurance",
            "universal_credit",
            "benefits",
            "household_net_income",
        ]
    }
