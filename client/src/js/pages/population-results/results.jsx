import { Divider, Empty, Spin, Card, Statistic } from "antd";
import Plot from "react-plotly.js";
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";

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
		<Col md={6}>
			<Plot
				data={props.plot.data}
				layout={props.plot.layout}
				config={{ displayModeBar: false }}
				style={{ width: "100%" }} 
			/>
		</Col>
	);
}

export function PopulationResultsPane(props) {
	return (
		<>
			<Divider>Population results</Divider>
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
					value={props.results.inequality_change * 100} 
					precision={1}
					suffix="%"
				/>
			</Row>
			<Row>
				<Chart plot={props.results.decile_plot} />
				<Chart plot={props.results.poverty_plot} />
				<Chart plot={props.results.age} />
				<Chart plot={props.results.mtr_plot} />
			</Row>
		</>
	);
}

export function LoadingResultsPane(props) {
	return (
		<Empty description={props.message}>
			<Spin indicator={antIcon} />
		</Empty>
	);
}