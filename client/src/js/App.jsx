// JS imports

import React from "react";

import Header from "./ui/header";
import Policy from "./pages/policy";
import Situation from "./pages/situation";
import PopulationResults from "./pages/population-results";
import SituationResults from "./pages/situation-results";
import {
	HashRouter as Router,
	Switch,
	Route,
	Link,
} from "react-router-dom";
import { Container } from "react-bootstrap";

// JSON imports

import DEFAULT_POLICY from "./pages/policy/default_policy";
import DEFAULT_SITUATION from "./pages/situation/default_situation";

// CSS imports

import "../css/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";

function getPolicyFromURL() {
	let plan = DEFAULT_POLICY;
	const searchParams = new URLSearchParams(document.location.hash.toString().slice(document.location.hash.indexOf("?")));
	for (const key of searchParams.keys()) {
		plan[key].value = +searchParams.get(key);
	}
	return plan;
}



class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {policy: getPolicyFromURL(), situation: {household: DEFAULT_SITUATION}};
	}
	render() {
		return (
			<Router basename="/">
				<Container fluid style={{paddingBottom: 50}}>
					<Switch>
						<Route path="/" exact>
							<Header step={0}/>
							<Policy policy={this.state.policy} onSubmit={policy => {this.setState({policy: policy});}}/>
						</Route>
						<Route path="/situation">
							<Header step={1}/>
							<Situation policy={this.state.policy} onSubmit={situation =>{this.setState({situation: situation});}} situation={this.state.situation} />
						</Route>
						<Route path="/population-results">
							<Header step={2}/>
							<PopulationResults policy={this.state.policy} situation={this.state.situation}/>
						</Route>
						<Route path="/situation-results">
							<Header step={3}/>
							<SituationResults policy={this.state.policy} situation={this.state.situation}/>
						</Route>
					</Switch>
				</Container>
			</Router>
		);
	}
}

export default App;
