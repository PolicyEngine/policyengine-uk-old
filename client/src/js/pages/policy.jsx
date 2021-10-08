import React from "react";
import PolicyControls from "./policy/controls";
import PolicyMenu from "./policy/menu";
import PolicyOverview from "./policy/overview";
import {Row, Col} from "react-bootstrap";


class Policy extends React.Component {
	constructor(props) {
		super(props);
		this.state = {policy: props.policy, selected: "main_rates", invalid: false};
		this.selectPolicyMenuItem = this.selectPolicyMenuItem.bind(this);
	}

	selectPolicyMenuItem(name) {
		this.setState({selected: name});
	}
    
	render() {
		return (
			<Row>
				<Col xl={3}>
					<PolicyMenu onClick={this.selectPolicyMenuItem}/>
				</Col>
				<Col xl={6}>
					<PolicyControls policy={this.props.policy} selected={this.state.selected} onChange={this.props.updatePolicy}/>
				</Col>
				<Col xl={3}>
					<PolicyOverview policy={this.props.policy} onSubmit={() => {this.props.onSubmit(this.props.policy, this.state.invalid);}} invalid={this.state.invalid}/>
				</Col>
			</Row>
		);
	}
}

export default Policy;