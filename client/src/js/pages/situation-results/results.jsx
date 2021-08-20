import { Divider, Switch, Card, Statistic, Collapse, Tree } from "antd";
import Plot from "react-plotly.js";
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined, ExclamationCircleOutlined, QuestionCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";
import React from "react";
import VARIABLES from "./variables";

const { Panel } = Collapse;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


function Explainer(props) {
	return (
		<Tree 
			defaultExpandAll
			treeData={!props.explainers ? [] : props.explainers.map(name => {return {
				title: `${VARIABLES[name].name}: ${props.formatter(props.results[name].old)} ➔ ${props.formatter(props.results[name].new)}`,
				key: name
			};})}
		/>
	);
}


function ChangedHeadlineFigure(props) {
	console.log(props);
	const data = props.results[props.name];
	const variable = VARIABLES[props.name];
	const formatNumber = num => (props.gbp ? "£" : "") + num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
	const oldV = formatNumber(data.old);
	const newV = formatNumber(data.new);
	let prefix = null;
	const gain = data.new > data.old;
	const loss = data.new < data.old;
	let changeColor = "black";
	if((gain && !variable.inverted) || (loss && variable.inverted)) {
		changeColor = "green";
	} else if((loss && !variable.inverted) || (gain && variable.inverted)) {
		changeColor = "red";
	}
	if(gain) {
		prefix = <ArrowUpOutlined style={{color: changeColor}} />;
	} else {
		prefix = <ArrowDownOutlined style={{color: changeColor}}/>;
	}

	return (
		<Col style={{ padding: 10, margin: 10 }}>
			<Card style={{ minWidth: 300 }}>
				<Statistic
					style={{paddingLeft: 40}}
					title={variable.name}
					value={[oldV, newV, data.old, data.new]}
					formatter={x => x[0] !== x[1] ? <><s style={{color: "grey"}}>{x[0]}</s><br /><div style={{color: changeColor}}>{x[1]}<br />({prefix}{formatNumber(x[3] - x[2])})</div></> : x[0]}
					suffix={props.suffix}
				/>
				<Collapse ghost>
					<Panel header={<><QuestionCircleOutlined/>  Explanation</>} key="1">
						<Explainer formatter={formatNumber} name={props.name} results={props.results} explainers={VARIABLES[props.name].explainers}/>
					</Panel>
				</Collapse>
			</Card>
		</Col>
	);
}

function Chart(props) {
	return (
		<>
			<Col>
				<Plot
					data={props.plot.data}
					layout={props.plot.layout}
					config={{ displayModeBar: false }}
					frames={props.plot.frames}
					style={{ width: "100%" }}
				/>
			</Col>
		</>
	);
}

function SituationResultsCaveats() {
	return (
		<Collapse defaultActiveKey={["1"]} ghost>
			<Panel header={<><ExclamationCircleOutlined />  Disclaimer</>} key="1">
				<p>These results may not match exact benefit entitlement, due to other factors in your specific situation. To find out exactly which benefits and taxes are applicable, visit <a href="https://gov.uk/">gov.uk</a> or benefits calculators such as <a href="https://www.entitledto.co.uk/">entitledto.co.uk</a>.</p>
			</Panel>
		</Collapse>
	);
}


export function SituationResultsPane(props) {
	const KEYS = ["tax", "income_tax", "national_insurance", "universal_credit", "benefits", "household_net_income"];
	let headlineFigures = [];
	for(let i = 0; i < KEYS.length; i++) {
		headlineFigures.push(
			<ChangedHeadlineFigure 
				key={i}
				name={KEYS[i]}
				results={props.results}
				gbp
			/>
		);
	}
	const netIncome = props.results["household_net_income"];
	const isGain = netIncome.new > netIncome.old;
	const isLoss = netIncome.new < netIncome.old;
	const formatNumber = num => "£" + num.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
	const difference = formatNumber(Math.abs(netIncome.new - netIncome.old));
	const percentageChange = Math.round(Math.abs((netIncome.new - netIncome.old) / netIncome.old) * 100) + "%";
	return (
		<>
			<SituationResultsCaveats />
			<Divider>Your situation results</Divider>
			<Row>
				<Col>
					<div className="d-flex justify-content-center align-items-center">
						<p style={{fontSize: 30}}> Your annual net income would {isGain ? <span style={{color: "green"}}>rise</span>: !isLoss ? <span>not change</span> : <span style={{color: "darkred"}}>fall</span>}{(isGain || isLoss) ? ` by ${difference} (${percentageChange})`: ""}</p>
					</div>
				</Col>
			</Row>
			<Row>
				<Chart plot={props.results.waterfall_chart} />
			</Row>
			<Row>
				<Chart plot={props.results.budget_chart} />
			</Row>
			<Row>
				<Chart plot={props.results.mtr_chart} />
			</Row>
		</>
	);
}