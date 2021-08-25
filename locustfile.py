from locust import HttpUser, task, between
from random import randint

POLICIES = {
	"adult_UBI": (1, 100),
	"child_UBI": (1, 100),
	"basic_rate": (0, 100),
	"personal_allowance": (0, 12500),
	"higher_rate": (0, 100),
	"add_rate": (0, 100),
}

PROPERTIES = {
	"employment_income_1": (0, 50000),
	"age_1": (18, 50),
}

PROPERTY_NAMES = list(PROPERTIES.keys())

POLICY_NAMES = list(POLICIES.keys())

SPEED_FACTOR = 4

class Simulator(HttpUser):
	wait_time = between(20 / SPEED_FACTOR, 60 * 2 / SPEED_FACTOR)

	@task
	def visitPolicy(self):
		self.client.get("/")
	
	@task
	def visitHouseholdPage(self):
		self.client.get("/situation")
	
	@task
	def populationSim(self):
		num_policies = randint(0, 4)
		url = "/population-results?"
		options = []
		for policy in range(num_policies):
			name = POLICY_NAMES[randint(0, len(POLICY_NAMES) - 1)]
			value = randint(POLICIES[name][0], POLICIES[name][1])
			options += [f"{name}={value}"]
		final_url = url + "&".join(options)
		self.client.get(final_url)
	
	@task
	def householdSim(self):
		num_policies = randint(0, 4)
		options = []
		used_policies = []
		for _ in range(num_policies):
			name = POLICY_NAMES[randint(0, len(POLICY_NAMES) - 1)]
			if name not in used_policies:
				value = randint(POLICIES[name][0], POLICIES[name][1])
				options += [f"policy_{name}={value}"]
				used_policies += [name]
		num_properties = randint(1, 4)
		used_properties = []
		url = "/api/situation-reform?"
		for _ in range(num_properties):
			name = PROPERTY_NAMES[randint(0, len(PROPERTY_NAMES) - 1)]
			if name not in used_properties:
				value = randint(PROPERTIES[name][0], PROPERTIES[name][1])
				options += [f"{name}={value}"]
				used_properties += [name]
		final_url = url + "&".join(options)
		self.client.get(final_url)