import React from "react";
import { PopulationResultsPane, LoadingResultsPane } from "./population-results/results";
import PolicySituationOverview from "./population-results/overview";
import { Row, Col } from "react-bootstrap";

class PopulationResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {plan: this.props.policy};
	}

	componentDidMount() {
		const submission = {};
		for (const key in this.state.plan) {
			submission[key] = this.state.plan[key].value;
		}
		fetch("http://127.0.0.1:5000/reform", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(submission),
		});
	}

	render() {
		const submission = {};
		for (const key in this.state.plan) {
			submission[key] = this.state.plan[key].value;
		}
		return (
			<Row>
				<Col xl={9}>
					<PopulationResultsPane results={this.state.results} submission={submission}/>
				</Col>
				<Col xl={3} style={{paddingLeft: 50}}>
					<PolicySituationOverview policy={this.props.policy} household={this.props.situation.household}/>
				</Col>
			</Row>
		);
	}
}

export default PopulationResults;