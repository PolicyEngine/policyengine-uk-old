import { Divider, Empty, Spin, Card, Statistic } from "antd";
import Plot from "react-plotly.js";
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function ChangedHeadlineFigure(props) {
	const formatNumber = num => (props.gbp ? "£" : "") + num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
	const oldV = formatNumber(props.oldValue);
	const newV = formatNumber(props.newValue);
	let prefix = null;
	const gain = props.newValue > props.oldValue;
	const loss = props.newValue < props.oldValue;
	let changeColor = "black";
	if(gain) {
		changeColor = "green";
		prefix = <ArrowUpOutlined style={{color: changeColor}} />;
	} else if(loss) {
		changeColor = "red";
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

export function SituationResultsPane(props) {
	const NAMES = ["Tax", "Income Tax", "National Insurance", "Universal Credit", "Benefits", "Household disposable income"];
	const KEYS = ["tax", "income_tax", "national_insurance", "universal_credit", "benefits", "household_net_income"];
	let headlineFigures = [];
	for(let i = 0; i < KEYS.length; i++) {
		headlineFigures.push(
			<ChangedHeadlineFigure 
				key={i}
				title={NAMES[i]}
				oldValue={props.results[KEYS[i]].old}
				newValue={props.results[KEYS[i]].new}
				gbp
			/>
		);
	}
	return (
		<>
			<Divider>Your situation results</Divider>
			<Row>
				{headlineFigures}
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