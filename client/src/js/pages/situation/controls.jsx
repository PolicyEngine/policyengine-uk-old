import { ParameterGroup } from "../policy/controls";
import { DEFAULT_HOUSEHOLD, DEFAULT_FAMILY, DEFAULT_PERSON } from "./default_situation";

function SituationControls(props) {
	const returnFunction = (key, value) => {props.onEnter(key, value, props.selected);};
	if(props.selected.includes("person")) {
		const family_number = +props.selected.split("-")[1];
		const person_number = +props.selected.split("-")[3];
		return <ParameterGroup onChange={returnFunction} policy={props.household.families[family_number].people[person_number]} names={Object.keys(DEFAULT_PERSON)} />;
	} else if(props.selected.includes("family")) {
		const family_number = +props.selected.split("-")[1];
		return <ParameterGroup onChange={returnFunction} policy={props.household.families[family_number]} names={Object.keys(DEFAULT_FAMILY)} />;
	} else {
		return <ParameterGroup onChange={returnFunction} policy={props.household} names={Object.keys(DEFAULT_HOUSEHOLD)} />;
	}
}

export default SituationControls;