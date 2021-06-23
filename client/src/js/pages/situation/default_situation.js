export const DEFAULT_HOUSEHOLD = {
	num_families: {
		title: "Number of families",
		description: "The number of nuclear families (benefit units) in the household. A family is at most two adults and any number of children. If you have more than two adults in the household, increase this beyond one",
		default: 1,
		value: 1,
		max: 3,
	}
};

export const DEFAULT_FAMILY = {
	num_people: {
		title: "Number of people",
		description: "The number of people in the family",
		default: 1,
		value: 1,
		max: 10,
	}
};

export const DEFAULT_PERSON = {
	age: {
		title: "Age",
		description: "The age of the person",
		default: 18,
		value: 18,
		max: 80
	},
	employment_income: {
		title: "Employment income",
		description: "Income from employment (gross)",
		default: 0,
		value: 0,
		max: 150000
	}
};

const DEFAULT_SITUATION = {
	...DEFAULT_HOUSEHOLD,
	families: [
		{
			...DEFAULT_FAMILY,
			people: [
				DEFAULT_PERSON
			]
		}
	]
};

export default DEFAULT_SITUATION;