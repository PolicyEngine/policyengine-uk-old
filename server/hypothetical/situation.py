from openfisca_uk import BASELINE_VARIABLES


def get_situation_func(params):
    def situation(sim):
        household = params["situation"]["household"]
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
                variable_values = {}
                for var in person.keys():
                    if var in BASELINE_VARIABLES:
                        variable_values[var] = person[var]["value"]
                is_head = age >= 18 and not head_assigned
                if is_head:
                    head_assigned = True
                sim.add_person(
                    name=name,
                    **variable_values,
                    is_benunit_head=is_head,
                    is_household_head=is_head,
                )
                if person["age"]["value"] >= 18:
                    bu_adults += [name]
                else:
                    bu_children += [name]
            sim.add_benunit(
                adults=bu_adults,
                children=bu_children,
                claims_UC=True,
                claims_child_benefit=True,
            )
            hh_adults += bu_adults
            hh_children += bu_children
        sim.add_household(adults=hh_adults, children=hh_children)
        return sim

    return situation
