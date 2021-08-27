import { Divider, Empty, Spin, Card, Statistic, Collapse } from "antd";
import Plot from "react-plotly.js";
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined, ExclamationCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";

const { Panel } = Collapse;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

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

function Center(props) {
	return <div className="d-flex justify-content-center align-items-center">{props.children}</div>;
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

function TakeAway(props) {
	return <Col>
		<div style={{padding: 10}} className="d-flex justify-content-center align-items-center">
			<p style={{fontSize: 20, color: "gray"}}>{props.children}</p>
		</div>
	</Col>;
}

export function PopulationResultsPane(props) {
	const isSurplus = props.results.net_cost[0] == "-";
	const cost = isSurplus ? props.results.net_cost.slice(1) : props.results.net_cost;
	const costColor = isSurplus ? "green" : "darkred";
	const isPovRise = props.results.poverty_change[0] == "-";
	let pov = isPovRise ? props.results.poverty_change.slice(1) : props.results.poverty_change;
	pov = +Math.round(pov * 100);
	const povColor = isPovRise ? "darkred" : "green";
	const winnerSharePos = props.results.winner_share[0] !== "-";
	const winners = Math.round(+props.results.winner_share * 100);
	const winnerColor = winners > 0 ? "green" : (winners == 0 ? "grey" : "darkred");
	const loserSharePos = props.results.loser_share[0] !== "-";
	const losers = Math.round(+props.results.loser_share * 100);
	const loserColor = losers > 0 ? "darkred" : (losers == 0 ? "grey" : "green");
	return (
		<>
			<Divider>Population results</Divider>
			<PopulationResultsCaveats />
			<Row style={{padding: 30}}>
				<TakeAway><p style={{textAlign: "center"}}>Reform produces <span style={{color: costColor}}>{cost}</span> net {isSurplus ? "surplus" : "cost"}</p></TakeAway>
				<TakeAway><p style={{textAlign: "center"}}>Poverty {isPovRise ? "rises" : "falls"} <span style={{color: povColor}}>{pov}%</span></p></TakeAway>
				<TakeAway><p style={{textAlign: "center"}}><span style={{color: winnerColor}}>{winners}%</span> of people come out ahead</p></TakeAway>
				<TakeAway><p style={{textAlign: "center"}}><span style={{color: loserColor}}>{losers}%</span> of people come out behind</p></TakeAway>
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