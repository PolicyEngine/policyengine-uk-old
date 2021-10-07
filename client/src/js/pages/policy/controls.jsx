import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import "antd/dist/antd.css";
import { LoadingOutlined, CloseCircleFilled } from "@ant-design/icons";

import {
	InputNumber, Divider, Switch, Slider, Select, Alert, Spin
} from "antd";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const { Option } = Select;

function Parameter(props) {
	let formatter = null;
	let parser = null;
	if (props.param.type === "rate") {
		formatter = (value) => `${value}%`;
		parser = (value) => +value.replace("%", "");
	} else if (props.param.type === "weekly") {
		formatter = (value) => `£${value}/week`;
		parser = (value) => +value.replace("£", "").replace("/week", "");
	} else if (props.param.type === "yearly") {
		formatter = (value) => `£${value}/year`;
		parser = (value) => +value.replace("£", "").replace("/year", "");
	} else if (props.param.type === "monthly") {
		formatter = (value) => `£${value}/month`;
		parser = (value) => +value.replace("£", "").replace("/month", "");
	} else if (props.param.type === "gbp") {
		formatter = (value) => `£${value}`;
		parser = (value) => +value.replace("£", "");
	}
	let component;
	if(props.param.type == "bool") {
		component = (
			<Switch
				onChange={(value) => {
					props.onChange(props.name, value);
				}}
				checked={props.param.value}
				disabled={props.disabled}
			/>
		);
	} else if(props.param.type == "abolish") {
		component = (
			<Switch
				onChange={(value) => {
					props.onChange(props.name, value);
				}}
				checked={props.param.value}
				className="switch-red"
				disabled={props.disabled}
			/>
		);
	} else if(props.param.type == "category") {
		component = (
			<Select placeholder={props.param.default} disabled={props.disabled}>
				{props.param.options.map(value => <Option key={value} value={value}>{value}</Option>)}
			</Select>
		);
	} else {
		component = (
			<>
				<Slider
					value={props.param.value}
					min={props.param.min || 0}
					max={props.param.max || 100}
					onChange={(value) => {
						props.onChange(props.name, value);
					}}
					tooltipVisible={false}
					disabled={props.disabled}
				/>
				<InputNumber
					value={props.param.value}
					min={props.param.min ? props.min : null}
					max={props.param.max ? props.max : null}
					formatter={formatter}
					parser={parser}
					onChange={(value) => {
						props.onChange(props.name, value);
					}}
					style={{ width: 175 }}
					disabled={props.disabled}
				/>
			</>
		);
	}
	return (
		<>
			<Divider>{props.param.title}</Divider>
			{props.param.error ? <Alert type="error" message={props.param.error} style={{marginBottom: 10}} showIcon icon={<CloseCircleFilled style={{marginTop: 5}} color="red" />}/> : null}
			<p>{props.param.description}</p>
			{component}
		</>
	);
}

export class UBIParameterGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {addUBI: false, waiting: false, UBI_amount: 0, error: false};
		this.updateUBI = this.updateUBI.bind(this);
	}

	updateUBI(checked) {
		this.setState({addUBI: checked});
		if(!checked) {
			return;
		}
		const submission = {};
		for (const key in this.props.policy) {
			if(this.props.policy[key].value !== this.props.policy[key].default) {
				submission["policy_" + key] = this.props.policy[key].value;
			}
		}
		let url = new URL("https://uk.policyengine.org/api/ubi");
		url.search = new URLSearchParams(submission).toString();
		this.setState({ waiting: true }, () => {
			fetch(url)
				.then((res) => {
					if (res.ok) {
						return res.json();
					} else {
						throw res;
					}
				}).then((json) => {
					this.setState({ UBI_amount: json.UBI, waiting: false, error: false });
					this.props.onChange("child_UBI", this.props.policy["child_UBI"].value + Math.round(json.UBI / 52, 2));
					this.props.onChange("adult_UBI", this.props.policy["adult_UBI"].value + Math.round(json.UBI / 52, 2));
					this.props.onChange("senior_UBI", this.props.policy["senior_UBI"].value + Math.round(json.UBI / 52, 2));
				}).catch(e => {
					console.log(e);
					this.setState({waiting: false, error: true});
				});
		});
	}

	render() {
		const message = !this.state.addUBI ?
			"Fund UBI from plan revenue" :
			this.state.waiting ? 
				<>Other elements of this reform would fund a UBI of <Spin indicator={antIcon}/> per week for all people</> : 
				this.state.error ? 
					"Something went wrong." : 
					`Other elements of this reform would fund a UBI of £${Math.round(this.state.UBI_amount / 52)} per week for all people`;
		return (
			<>
				<Parameter name="child_UBI" disabled={this.state.addUBI} onChange={this.props.onChange} param={this.props.policy["child_UBI"]} />
				<Parameter name="adult_UBI" disabled={this.state.addUBI} onChange={this.props.onChange} param={this.props.policy["adult_UBI"]} />
				<Parameter name="senior_UBI" disabled={this.state.addUBI} onChange={this.props.onChange} param={this.props.policy["senior_UBI"]} />
				<Parameter name="WA_adult_UBI_age" disabled={this.state.addUBI} onChange={this.props.onChange} param={this.props.policy["WA_adult_UBI_age"]} />
				<Divider>AutoUBI</Divider>
				<p>{message}</p>
				<Switch onChange={this.updateUBI}/>
			</>
		);
	}
}

export function ParameterGroup(props) {
	return (
		<>
			{props.names.map((name) => <Parameter key={name} name={name} param={props.policy[name]} onChange={props.onChange} rate />)}
		</>
	);
}

export function NothingControls(props) {
	return (
		<>
			<Divider>No parameters available</Divider>
			<p>No parameters are currently available for this category.</p>
		</>
	);
}

function PolicyControls(props) {
	const controlSet = {
		main_rates: [
			"basic_rate",
			"higher_rate",
			"higher_threshold",
			"add_rate",
			"add_threshold",
		],
		sav_div: [
			"abolish_savings_allowance",
			"abolish_dividend_allowance",
		],
		it_alt: [
			"abolish_income_tax"
		],
		lvt: [
			"LVT"
		],
		employee_side: [
			"NI_main_rate",
			"NI_PT",
			"NI_add_rate",
			"NI_UEL",
		],
		self_emp: [
			"NI_LPL",
			"NI_class_4_main_rate",
			"NI_UPL",
			"NI_class_4_add_rate"
		],
		ni_alt: [
			"abolish_NI"
		],
		allowances: [
			"personal_allowance",
		],
		UBI: [
			"child_UBI",
			"adult_UBI",
			"senior_UBI",
		],
		legacy_benefits: [
			"abolish_CTC",
			"abolish_WTC",
			"abolish_HB",
			"abolish_IS",
			"abolish_JSA_income",
		],
		child_benefit: [
			"abolish_CB",
			"CB_eldest",
			"CB_additional",
		],
		state_pension: [
			"abolish_SP",
			"abolish_PC",
		],
		universal_credit: [
			"abolish_UC",
			"UC_single_young",
			"UC_single_old",
			"UC_couple_young",
			"UC_couple_old",
			"UC_reduction_rate",
		]
	};
	const names = controlSet[props.selected];
	if (!(props.selected in controlSet)) {
		return <NothingControls key={props.selected} policy={props.policy} />;
	}
	if(props.selected == "UBI") {
		return <UBIParameterGroup onChange={props.onChange} policy={props.policy} />;
	}
	return <ParameterGroup name={props.selected} key={props.selected} onChange={props.onChange} policy={props.policy} names={names} />;
}

export default PolicyControls;