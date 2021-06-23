import React from "react";
import SituationMenu from "./situation/menu";
import { Row, Col } from "react-bootstrap";
import SituationControls from "./situation/controls";
import { DEFAULT_FAMILY, DEFAULT_PERSON } from "./situation/default_situation";
import SituationOverview from "./situation/overview";

class Situation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {household: this.props.situation.household, selected: "household"};
		this.updateSituation = this.updateSituation.bind(this);
	}

	updateSituation(key, value, selected) {
		let household = this.state.household;
		if(selected.includes("family")) {
			const family_number = +selected.split("-")[1];
			if(selected.includes("person")) {
				const person_number = +selected.split("-")[3];
				household.families[family_number].people[person_number][key].value = value;
			} else {
				household.families[family_number][key].value = value;
			}
		} else {
			household[key].value = value;
		}
		while(household.num_families.value > household.families.length) {
			household.families.push({ ...JSON.parse(JSON.stringify(DEFAULT_FAMILY)), people: []});
		}
		while(household.num_families.value < household.families.length) {
			household.families.pop();
		}
		for(let i = 0; i < household.families.length; i++) {
			while(household.families[i].num_people.value > household.families[i].people.length) {
				household.families[i].people.push({...JSON.parse(JSON.stringify(DEFAULT_PERSON))});
			}
			while(household.families[i].num_people.value < household.families[i].people.length) {
				household.families[i].people.pop();
			}
		}
		this.setState({household: household});
	}

	render() {
		return (
			<Row>
				<Col xl={3}>
					<SituationMenu household={this.state.household} onSelect={name => {this.setState({selected: name});}}/>
				</Col>
				<Col xl={6}>
					<SituationControls selected={this.state.selected} household={this.state.household} onEnter={this.updateSituation}/>
				</Col>
				<Col xl={3}>
					<SituationOverview policy={this.props.policy} household={this.state.household} onSubmit={() => {this.props.onSubmit({household: this.state.household});}}/>
				</Col>
			</Row>
		);
	}
}

export default Situation;