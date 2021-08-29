// JS imports

import React from "react";

import Header from "./ui/header";
import Policy from "./pages/policy";
import Situation from "./pages/situation";
import PopulationResults from "./pages/population-results";
import SituationResults from "./pages/situation-results";
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


function getPolicyFromURL() {
	let plan = DEFAULT_POLICY;
	const { searchParams } = new URL(document.location);
	for (const key of searchParams.keys()) {
		plan[key].value = +searchParams.get(key);
	}
	return plan;
}



class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {policy: getPolicyFromURL(), situation: DEFAULT_SITUATION, situationEntered: false};
	}

	render() {
		return (
			<Container fluid style={{paddingBottom: 15, minWidth: 300}}>
				<BackTop />
				<Switch>
					<Route path="/" exact>
						<Header step={0} situationEntered={this.state.situationEntered}/>
						<Policy policy={this.state.policy} onSubmit={policy => {this.setState({policy: policy});}}/>
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
				</Switch>
				<Divider style={{marginTop: 50}} />
				<div className="d-flex justify-content-center">
					<p>© 2021 <a href="https://ubicenter.org">The UBI Center</a>. Let us know what you think! <a href="mailto:policyengine@ubicenter.org">Email us</a> or <a href="https://github.com/ubicenter/uk-policy-engine/issues/new">file an issue on GitHub</a>.</p>
				</div>
			</Container>
		);
	}
}

export default App;
