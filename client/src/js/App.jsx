// JS imports

import React from "react";

import Header from "./ui/header";
import { TopHeader } from "./ui/header";
import Policy from "./pages/policy";
import Situation from "./pages/situation";
import PopulationResults from "./pages/population-results";
import SituationResults from "./pages/situation-results";
import FAQ from "./pages/faq";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
} from "react-router-dom";
import { Container } from "react-bootstrap";
import Analytics from "react-router-ga";
import { Divider, BackTop } from "antd";
// JSON imports

import DEFAULT_POLICY from "./pages/policy/default_policy";
import DEFAULT_SITUATION from "./pages/situation/default_situation";

// CSS imports

import "../css/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";


function getPolicyFromURL(policy) {
	let plan = policy || DEFAULT_POLICY;
	const { searchParams } = new URL(document.location);
	for (const key of searchParams.keys()) {
		plan[key].value = +searchParams.get(key);
	}
	return plan;
}



class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {policy: DEFAULT_POLICY, situation: DEFAULT_SITUATION, situationEntered: false, invalid: false};
		this.updatePolicy = this.updatePolicy.bind(this);
	}

	updatePolicy(name, value) {
		let policy = this.state.policy;
		let invalid = false;
		policy[name].value = value;

		// Validation

		if(policy.higher_threshold.value === policy.add_threshold.value) {
			policy.add_threshold.error = "Higher and additional rates must be different.";
			invalid = true;
		} else {
			policy.add_threshold.error = null;
		}
		this.setState({policy: policy, invalid: invalid});
	}

	componentDidMount() {
		fetch("http://localhost:5000/api/parameters").then(res => res.json()).then(data => {this.setState({policy: data});});
	}

	render() {
		return (
			<Container fluid style={{paddingBottom: 15, minWidth: 300}}>
				<BackTop />
				<Switch>
					<Route path="/" exact>
						<Header step={0} situationEntered={this.state.situationEntered}/>
						<Policy policy={this.state.policy} updatePolicy={this.updatePolicy} onSubmit={(policy, invalid) => {this.setState({policy: policy, invalid: invalid});}}/>
					</Route>
					<Route path="/population-results">
						<Header step={1} situationEntered={this.state.situationEntered}/>
						<PopulationResults policy={this.state.policy} situation={this.state.situation}/>
					</Route>
					<Route path="/situation">
						<Header step={2} situationEntered={this.state.situationEntered}/>
						<Situation policy={this.state.policy} onSubmit={situation =>{this.setState({situationEntered: true, situation: situation});}} situation={this.state.situation} />
					</Route>
					<Route path="/situation-results">
						<Header step={3} situationEntered={this.state.situationEntered}/>
						<SituationResults policy={this.state.policy} situation={this.state.situation}/>
					</Route>
					<Route path="/faq">
						<TopHeader />
						<FAQ />
					</Route>
				</Switch>
				<Divider style={{marginTop: 50}} />
				<div className="d-none d-lg-block">
					<div className="d-flex justify-content-center">
						<p style={{textAlign: "center"}}><a href="https://policyengine.org">PolicyEngine © 2021</a> | <a href="/faq">FAQ</a> | <a href="https://zej8fnylwn9.typeform.com/to/XFFu15Xq">Share your feedback</a> | <a href="https://opencollective.com/psl">Donate</a></p>
					</div>
				</div>
				<div className="d-block d-lg-none">
					<p style={{textAlign: "center"}}><a href="https://policyengine.org">PolicyEngine © 2021</a> | <a href="/faq">FAQ</a></p>
					<p style={{textAlign: "center"}}><a href="https://zej8fnylwn9.typeform.com/to/XFFu15Xq">Share your feedback</a> | <a href="https://opencollective.com/psl">Donate</a></p>
				</div>
			</Container>
		);
	}
}

export default App;
