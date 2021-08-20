import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import "antd/dist/antd.css";
import {
	InputNumber, Divider, Switch, Slider, Select
} from "antd";

const { Option } = Select;

function Parameter(props) {
	let formatter = null;
	let parser = null;
	if (props.param.type === "rate") {
		formatter = (value) => `${value}%`;
		parser = (value) => value.replace("%", "");
	} else if (props.param.type === "weekly") {
		formatter = (value) => `£${value}/week`;
		parser = (value) => value.replace("£", "").replace("/week", "");
	} else if (props.param.type === "yearly") {
		formatter = (value) => `£${value}/year`;
		parser = (value) => value.replace("£", "").replace("/year", "");
	} else if (props.param.type === "monthly") {
		formatter = (value) => `£${value}/month`;
		parser = (value) => value.replace("£", "").replace("/month", "");
	}
	let component;
	if(props.param.type == "bool") {
		component = (
			<Switch
				onChange={(value) => {
					props.onChange(props.name, value);
				}}
				checked={props.param.value}
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
			/>
		);
	} else if(props.param.type == "category") {
		component = (
			<Select placeholder={props.param.default}>
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
				/>
			</>
		);
	}
	return (
		<>
			<Divider>{props.param.title}</Divider>
			<p>{props.param.description}</p>
			{component}
		</>
	);
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
			"basic_threshold",
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
		employee_side: [
			"NI_main_rate",
			"NI_PT",
			"NI_add_rate",
			"NI_UEL",
		],
		ni_alt: [
			"abolish_NI"
		],
		allowances: [
			"personal_allowance",
		],
		basic_income: [
			"child_UBI",
			"adult_UBI",
			"senior_UBI",
		],
		universal_credit: ["abolish_UC", "UC_phaseout_rate"],
		cb: ["abolish_CB"],
		ctc: ["abolish_CTC", "TC_phaseout_rate"],
		wtc: ["abolish_WTC", "TC_phaseout_rate"]
	};
	const names = controlSet[props.selected];
	if (!(props.selected in controlSet)) {
		return <NothingControls key={props.selected} policy={props.policy} />;
	}
	return <ParameterGroup key={props.selected} onChange={props.onChange} policy={props.policy} names={names} />;
}

export default PolicyControls;