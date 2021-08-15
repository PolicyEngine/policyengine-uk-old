import { Divider, Empty, Spin, Card, Statistic } from "antd";
import Plot from "react-plotly.js";
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";
import { LoadingResultsPane } from "../population-results/results";
import React from "react";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function ChangedHeadlineFigure(props) {
	const formatNumber = num => (props.gbp ? "£" : "") + num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
	const oldV = formatNumber(props.oldValue);
	const newV = formatNumber(props.newValue);
	let prefix = null;
	const gain = props.newValue > props.oldValue;
	const loss = props.newValue < props.oldValue;
	let changeColor = "black";
	if((gain & !props.inverted) || (loss & props.inverted)) {
		changeColor = "green";
	} else if((loss & !props.inverted) || (gain & props.inverted)) {
		changeColor = "red";
	}
	if (gain) {
		prefix = <ArrowUpOutlined style={{color: changeColor}} />;
	} else if (loss) {
		prefix = <ArrowDownOutlined style={{color: changeColor}}/>;
	}

	return (
		<Col style={{ padding: 10, margin: 10 }}>
			<Card style={{ minWidth: 300 }}>
				<Statistic
					title={props.title}
					value={[oldV, newV, props.oldValue, props.newValue]}
					formatter={x => x[0] !== x[1] ? <><s style={{color: "grey"}}>{x[0]}</s><br /><div style={{color: changeColor}}>{x[1]}<br />({prefix}{formatNumber(x[3] - x[2])})</div></> : x[0]}
					suffix={props.suffix}
				/>
			</Card>
		</Col>
	);
}


class HeadlineFigures extends React.Component {
	constructor(props) {
		super(props);
		this.state = {data: null};
	}

	componentDidMount() {
		this.refresh_task = setInterval(() => {
			fetch("http://127.0.0.1:5000/reform", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(Object.assign(this.props.submission, {target: this.props.target})),
			}).then((res) => res.json()).then((json) => {
				if(json.status == "complete") {
					this.setState({ data: json.data});
					clearInterval(this.refresh_task);
				}
			});
		}, 5000);
	}

	render() {
		const NAMES = ["Tax", "Income Tax", "National Insurance", "Universal Credit", "Benefits", "Household disposable income"];
		const KEYS = ["tax", "income_tax", "national_insurance", "universal_credit", "benefits", "household_net_income"];
		const INVERTED = [true, true, true, false, false, false];
		let headlineFigures = [];
		for(let i = 0; i < KEYS.length; i++) {
			if (!this.state.data) {
				headlineFigures.push(
					<Col style={{ padding: 10, margin: 10 }} key={i}>
						<Card style={{ minWidth: 300 }}>
							<LoadingResultsPane 
								key={i}
								message={NAMES[i]}
								noIcon
							/>
						</Card>
					</Col>
				);
			} else {
				headlineFigures.push(
					<ChangedHeadlineFigure 
						key={i}
						title={NAMES[i]}
						oldValue={this.state.data[KEYS[i]].old}
						newValue={this.state.data[KEYS[i]].new}
						inverted={INVERTED[i]}
						gbp
					/>
				);
			}
		}
		return <>{headlineFigures}</>;
	}
}


class Chart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {plot: null};
	}

	componentDidMount() {
		this.refresh_task = setInterval(() => {
			fetch("http://127.0.0.1:5000/reform", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(Object.assign(this.props.submission, {target: this.props.target})),
			}).then((res) => res.json()).then((json) => {
				if(json.status == "complete") {
					this.setState({ data: json.data});
					clearInterval(this.refresh_task);
				}
			});
		}, 5000);
	}

	render() {
		return (
			<Col md={this.props.md ? this.props.md : 6}>
				{this.state.data ? 
					<Plot
						data={this.state.data.data}
						layout={this.state.data.layout}
						frames={this.state.data.frames}
						config={{ displayModeBar: false }}
						style={{ width: "100%" }} 
					/> :
					<LoadingResultsPane message={this.props.title} noIcon/>
				}
			</Col>
		);
	}
}

export function SituationResultsPane(props) {
	return (
		<>
			<Divider>Your situation results</Divider>
			<Row>
				<HeadlineFigures submission={props.submission} target="headline_figures" />
			</Row>
			<Row>
				<Chart md={12} submission={props.submission} target="waterfall_chart" title="Waterfall chart" />
			</Row>
			<Row>
				<Chart submission={props.submission} target="budget_chart" title="Budget chart" />
				<Chart submission={props.submission} target="mtr_chart" title="MTR chart" />
			</Row>
		</>
	);
}