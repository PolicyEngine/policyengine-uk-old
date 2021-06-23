import React from "react";
import PolicyControls from "./policy/controls";
import PolicyMenu from "./policy/menu";
import PolicyOverview from "./policy/overview";
import {Row, Col} from "react-bootstrap";


class Policy extends React.Component {
	constructor(props) {
		super(props);
		this.state = {policy: props.policy, selected: "main_rates"};
		this.updatePolicy = this.updatePolicy.bind(this);
		this.selectPolicyMenuItem = this.selectPolicyMenuItem.bind(this);
	}

	selectPolicyMenuItem(name) {
		this.setState({selected: name});
	}

	updatePolicy(name, value) {
		let policy = this.state.policy;
		policy[name].value = value;
		this.setState({policy: policy});
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
					<PolicyOverview policy={this.state.policy} onSubmit={() => {this.props.onSubmit(this.state.policy);}}/>
				</Col>
			</Row>
		);
	}
}

export default Policy;