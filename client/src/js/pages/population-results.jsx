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
			if(this.state.plan[key].value !== this.state.plan[key].default) {
				submission["policy_" + key] = this.state.plan[key].value;
			}
		}
		let url = new URL("http://127.0.0.1:5000/api/population-reform");
		url.search = new URLSearchParams(submission).toString();
		this.setState({ waiting: true }, () => {
			fetch(url).then((res) => res.json()).then((json) => {
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