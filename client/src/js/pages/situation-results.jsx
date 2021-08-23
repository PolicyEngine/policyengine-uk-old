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
		let i = 1;
		for(let person in this.state.situation.people) {
			for(let variableName in this.state.situation.people[person]) {
				let variable = this.state.situation.people[person][variableName];
				submission[variableName + "_" + (i)] = variable.value;
			}
			submission["family_" + i] = 1;
			i++;
		}
		i = 1;
		for(let family in this.state.situation.families) {
			for(let variableName in this.state.situation.families[family]) {
				let variable = this.state.situation.families[family][variableName];
				submission[variableName + "_" + i] = variable.value;
			}
			i++;
		}
		for (const key in this.props.policy) {
			if(this.props.policy[key].value !== this.props.policy[key].default) {
				submission["policy_" + key] = this.props.policy[key].value;
			}
		}
		/*for(let variableName in this.state.situation.household) {
			let variable = this.state.situation.household[variableName];
			if(variable.default != variable.value) {
				submission[variableName] = variable.value;
			}
		}*/
		let url = new URL("http://localhost:5000/api/situation-reform");
		url.search = new URLSearchParams(submission).toString();
		this.setState({ waiting: true }, () => {
			fetch(url)
				.then((res) => {
					if (res.ok) {
						return res.json();
					} else {
						throw res;
					}
				}).then((json) => {
					this.setState({ results: json, waiting: false, error: false });
				}).catch(e => {
					this.setState({waiting: false, error: true});
				});
		});
		return;
	}

	render() {
		return (
			<Row>
				<Col xl={9}>
					{
						(this.state.waiting || (!this.state.results && !this.state.error)) ?
							<div className="d-flex justify-content-center align-items-center" style={{minHeight: 400}}>
								<LoadingResultsPane message="Simulating the reform on your situation (this usually takes about 40 seconds)"/>
							</div> :
							this.state.error ?
								<div className="d-flex justify-content-center align-items-center" style={{minHeight: 400}}>
									<LoadingResultsPane noSpin message="Something went wrong (try navigating back and returning to this page)"/>
								</div> :
								<SituationResultsPane results={this.state.results} />
					}
				</Col>
				<Col xl={3} style={{paddingLeft: 50}}>
					<PolicySituationOverview policy={this.props.policy} situation={this.props.situation} noButton/>
				</Col>
			</Row>
		);
	}
}

export default SituationResults;