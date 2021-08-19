import { Divider, Empty, Spin, Card, Statistic, Collapse } from "antd";
import Plot from "react-plotly.js";
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";

const { Panel } = Collapse;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function HeadlineFigure(props) {
	return (
		<Col style={{ padding: 10, margin: 10 }}>
			<Card style={{ minWidth: 150 }}>
				<Statistic
					title={props.title}
					value={props.value}
					precision={props.precision}
					prefix={(!props.noArrow && !props.nonNumeric) ? (props.value >= 0 ? <><ArrowUpOutlined /></> : <><ArrowDownOutlined /></>) : <></>}
					suffix={props.suffix}
				/>
			</Card>
		</Col>
	);
}

function Chart(props) {
	return (
		<Col md={props.md ? props.md : 6}>
			<Plot
				data={props.plot.data}
				layout={props.plot.layout}
				config={{ displayModeBar: false }}
				style={{ width: "100%" }} 
			/>
		</Col>
	);
}

function PopulationResultsCaveats() {
	return (
		<Collapse defaultActiveKey={["1"]} ghost>
			<Panel header={<><ExclamationCircleOutlined />  Disclaimer</>} key="1">
				<p>Results are calculated using the OpenFisca-UK tax-benefit microsimulation model, and assume no behavioural or macroeconomic effects. See the <a href="https://github.com/PSLmodels/openfisca-uk">repository</a> for more information.</p>
			</Panel>
		</Collapse>
	);
}

export function PopulationResultsPane(props) {
	return (
		<>
			<Divider>Population results</Divider>
			<PopulationResultsCaveats />
			<Row>
				<HeadlineFigure 
					title="Net cost" 
					value={props.results.net_cost} 
					nonNumeric
				/>
				<HeadlineFigure 
					title="Poverty rate change" 
					value={props.results.poverty_change * 100} 
					precision={1}
					suffix="%"
				/>
				<HeadlineFigure 
					title="Winner share" 
					value={props.results.winner_share * 100} 
					precision={1}
					suffix="%"
					noArrow
				/>
				<HeadlineFigure 
					title="Loser share" 
					value={props.results.loser_share * 100} 
					precision={1}
					suffix="%"
					noArrow
				/>
				<HeadlineFigure 
					title="Inequality" 
					value={props.results.gini_change * 100} 
					precision={1}
					suffix="%"
				/>
			</Row>
			<Row>
				<Chart plot={props.results.waterfall_chart} md={12} />
			</Row>
			<Row>
				<Chart plot={props.results.decile_chart} />
				<Chart plot={props.results.poverty_chart} />
			</Row>
			<Row>
				<Chart plot={props.results.age_chart} md={12}/>
			</Row>
			<Row>
				<Chart plot={props.results.intra_decile_chart} md={12}/>
			</Row>
		</>
	);
}

export function LoadingResultsPane(props) {
	return (
		<Empty description={props.message}>
			{!props.noSpin ? <Spin indicator={antIcon} /> : <></>}
		</Empty>
	);
}