import React from "react";
import PolicySituationOverview from "./population-results/overview";
import { SituationResultsPane } from "./situation-results/results";
import { LoadingResultsPane } from "./population-results/results";
import { Row, Col } from "react-bootstrap";

class SituationResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {plan: this.props.policy, situation: this.props.situation, results: null, waiting: false};
	}

	componentDidMount() {
		this.simulate();
	}

	simulate() {
		let submission = {};
		for (const key in this.state.plan) {
			submission[key] = this.state.plan[key].value;
		}
		submission["situation"] = this.state.situation;
		this.setState({ waiting: true }, () => {
			fetch("http://192.168.0.14:4000/situation-reform", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submission),
			}).then((res) => res.json()).then((json) => {
				this.setState({ results: json, waiting: false });
			});
		});
	}

	render() {
		return (
			<Row>
				<Col xl={9}>
					{
						!this.state.results ?
							<div className="d-flex justify-content-center align-items-center" style={{minHeight: 400}}>
								<LoadingResultsPane message="Simulating policy on your situation"/>
							</div> :
							<SituationResultsPane results={this.state.results} />
					}
				</Col>
				<Col xl={3} style={{paddingLeft: 50}}>
					<PolicySituationOverview policy={this.props.policy} household={this.props.situation.household} noButton/>
				</Col>
			</Row>
		);
	}
}

export default SituationResults;