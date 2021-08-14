import React from "react";
import { PopulationResultsPane, LoadingResultsPane } from "./population-results/results";
import PolicySituationOverview from "./population-results/overview";
import { Row, Col } from "react-bootstrap";

class PopulationResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {plan: this.props.policy, results: null, waiting: false};
		this.simulate = this.simulate.bind(this);
	}

	componentDidMount() {
		this.simulate();
	}

	simulate() {
		const submission = {};
		for (const key in this.state.plan) {
			submission[key] = this.state.plan[key].value;
		}
		this.setState({ waiting: true }, () => {
			fetch("https://uk-policy-engine.uw.r.appspot.com/reform", {
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
								<LoadingResultsPane message="Simulating your results on the UK population"/>
							</div> :
							<PopulationResultsPane results={this.state.results} />
					}
				</Col>
				<Col xl={3} style={{paddingLeft: 50}}>
					<PolicySituationOverview policy={this.props.policy} household={this.props.situation.household}/>
				</Col>
			</Row>
		);
	}
}

export default PopulationResults;