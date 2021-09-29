import React from "react";
import PolicyControls from "./policy/controls";
import PolicyMenu from "./policy/menu";
import PolicyOverview from "./policy/overview";
import {Row, Col} from "react-bootstrap";


class Policy extends React.Component {
	constructor(props) {
		super(props);
		this.state = {policy: props.policy, selected: "main_rates", invalid: false};
		this.updatePolicy = this.updatePolicy.bind(this);
		this.selectPolicyMenuItem = this.selectPolicyMenuItem.bind(this);
	}

	selectPolicyMenuItem(name) {
		this.setState({selected: name});
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
    
	render() {
		return (
			<Row>
				<Col xl={3}>
					<PolicyMenu onClick={this.selectPolicyMenuItem}/>
				</Col>
				<Col xl={6}>
					<PolicyControls policy={this.state.policy} selected={this.state.selected} onChange={this.updatePolicy}/>
				</Col>
				<Col xl={3}>
					<PolicyOverview policy={this.state.policy} onSubmit={() => {this.props.onSubmit(this.state.policy, this.state.invalid);}} invalid={this.state.invalid}/>
				</Col>
			</Row>
		);
	}
}

export default Policy;