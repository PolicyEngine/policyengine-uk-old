import { ParameterGroup } from "../policy/controls";
import { DEFAULT_HOUSEHOLD, DEFAULT_FAMILY, DEFAULT_ADULT, DEFAULT_CHILD } from "./default_situation";

function SituationControls(props) {
	const returnFunction = (key, value) => {props.onEnter(key, value, props.selected);};
	if(props.selected.includes("child")) {
		if(props.selected in props.situation.people) {
			return <ParameterGroup onChange={returnFunction} policy={props.situation.people[props.selected]} names={Object.keys(DEFAULT_CHILD)} />;
		} else {
			return <></>;
		}
	} else if(props.selected == "head" || props.selected == "partner") {
		if(props.selected in props.situation.people) {
			return <ParameterGroup onChange={returnFunction} policy={props.situation.people[props.selected]} names={Object.keys(DEFAULT_ADULT)} />;
		} else {
			return <></>;
		}
		
	} else if(props.selected.includes("family")) {
		return <ParameterGroup onChange={returnFunction} policy={props.situation.families[props.selected]} names={Object.keys(DEFAULT_FAMILY)} />;
	} else {
		return <ParameterGroup onChange={returnFunction} policy={props.situation.household} names={Object.keys(DEFAULT_HOUSEHOLD)} />;
	}
}

export default SituationControls;