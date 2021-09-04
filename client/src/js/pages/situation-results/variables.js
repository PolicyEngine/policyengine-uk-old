const VARIABLES = {
	tax: {
		name: "Tax",
		inverted: true,
		explainers: ["income_tax", "national_insurance"]
	},
	income_tax: {
		name: "Income Tax",
		inverted: true,
		explainers: ["basic_rate_earned_income_tax", "higher_rate_earned_income_tax", "add_rate_earned_income_tax"]
	},
	basic_rate_earned_income_tax: {
		name: "Basic rate (labour)",
		inverted: true
	},
	higher_rate_earned_income_tax: {
		name: "Higher rate (labour)",
		inverted: true
	},
	add_rate_earned_income_tax: {
		name: "Additional rate (labour)",
		inverted: true
	},
	national_insurance: {
		name: "National Insurance",
		inverted: true,
		explainers: ["employee_NI_class_1", "employer_NI_class_1", "NI_class_2", "NI_class_4"]
	},
	universal_credit: {
		name: "Universal Credit",
		explainers: ["UC_maximum_amount", "UC_income_reduction"]
	},
	employee_NI_class_1: {
		name: "Class 1 (employee-side)",
		inverted: true
	},
	employer_NI_class_1: {
		name: "Class 1 (employer-side, not included)",
		inverted: true
	},
	NI_class_2: {
		name: "Class 2",
		inverted: true
	},
	NI_class_4: {
		name: "Class 4",
		inverted: true
	},
	benefits: {
		name: "Benefits",
		explainers: ["universal_credit", "child_benefit"]
	},
	child_benefit: {
		name: "Child Benefit"
	},
	household_net_income: {
		name: "Disposable income",
		explainers: ["total_income", "gross_income", "net_income"]
	},
	total_income: {
		name: "Total income"
	},
	gross_income: {
		name: "Gross income"
	},
	net_income: {
		name: "Net income"
	},
	UC_maximum_amount: {
		name: "Applicable amount",
	},
	UC_income_reduction: {
		name: "Reduction"
	}
};

export default VARIABLES;
