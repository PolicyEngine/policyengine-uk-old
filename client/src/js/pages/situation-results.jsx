import React from "react";
import PolicySituationOverview from "./population-results/overview";
import { SituationResultsPane } from "./situation-results/results";
import { LoadingResultsPane } from "./population-results/results";
import { Row, Col } from "react-bootstrap";

class SituationResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {plan: this.props.policy, situation: this.props.situation};
	}

	componentDidMount() {
		const submission = {};
		for (const key in this.state.plan) {
			submission[key] = this.state.plan[key].value;
		}
		submission["situation"] = this.state.situation;
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
		submission["situation"] = this.state.situation;
		return (
			<Row>
				<Col xl={9}>
					<SituationResultsPane results={this.state.results} />
				</Col>
				<Col xl={3} style={{paddingLeft: 50}}>
					<PolicySituationOverview policy={this.props.policy} household={this.props.situation.household} noButton/>
				</Col>
			</Row>
		);
	}
}

export default SituationResults;