import { Divider, Empty, Spin, Card, Statistic } from "antd";
import Plot from "react-plotly.js";
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";
import React from "react";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

class HeadlineFigure extends React.Component {
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
				console.log(json);
				if(json.status == "complete") {
					this.setState({ data: json.data});
					clearInterval(this.refresh_task);
				}
			});
		}, 5000);
	}

	render() {
		return (
			<Col style={{ padding: 10, margin: 10 }}>
				<Card style={{ minWidth: 150 }}>
					{this.state.data != null ? 
						<Statistic
							title={this.props.title}
							value={this.props.multiplier ? this.props.multiplier * this.state.data : this.state.data}
							precision={this.props.precision}
							prefix={(!this.props.noArrow && !this.props.nonNumeric) ? (this.props.value >= 0 ? <><ArrowUpOutlined /></> : <><ArrowDownOutlined /></>) : <></>}
							suffix={this.props.suffix}
						/> :
						<LoadingResultsPane message={this.props.title} noIcon/>
					}
				</Card>
			</Col>
		);
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
						config={{ displayModeBar: false }}
						style={{ width: "100%" }} 
					/> :
					<LoadingResultsPane message={this.props.title} noIcon/>
				}
			</Col>
		);
	}
}

export function PopulationResultsPane(props) {
	return (
		<>
			<Divider>Population results</Divider>
			<Row>
				<HeadlineFigure 
					title="Net cost" 
					target="net_cost"
					submission={props.submission}
					nonNumeric
				/>
				<HeadlineFigure 
					title="Poverty rate change" 
					target="poverty_change"
					submission={props.submission}
					multiplier={100}
					precision={1}
					suffix="%"
				/>
				<HeadlineFigure 
					title="Winner share" 
					target="winner_share"
					submission={props.submission}
					multiplier={100}
					precision={1}
					suffix="%"
					noArrow
				/>
				<HeadlineFigure 
					title="Loser share" 
					target="loser_share"
					submission={props.submission}
					precision={1}
					suffix="%"
					noArrow
				/>
				<HeadlineFigure 
					title="Inequality" 
					target="gini_change"
					multiplier={100}
					submission={props.submission}
					precision={1}
					suffix="%"
				/>
			</Row>
			<Row>
				<Chart title="Funding breakdown" target="waterfall_chart" submission={props.submission} md={12} />
			</Row>
			<Row>
				<Chart title="Decile chart" target="decile_chart" submission={props.submission} md={12}/>
				<Chart title="Poverty chart" target="poverty_chart" submission={props.submission} />
				<Chart title="Age chart" target="age_chart" submission={props.submission} />
			</Row>
		</>
	);
}

export function LoadingResultsPane(props) {
	return (
		<Empty description={props.message} image={null}>
			<Spin indicator={antIcon} />
		</Empty>
	);
}