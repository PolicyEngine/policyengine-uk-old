import { Steps, Divider, Empty, Button } from "antd";
import { Link } from "react-router-dom";
import { SimulateButton } from "../policy/overview";

const { Step } = Steps;

function PolicySituationOverview(props) {
	const isSingleFamily = true;
	let numPensioners = 0;
	let numWA = 0;
	let numChildren = 0;
	let age;
	for(let person in props.situation.people) {
		age = props.situation.people[person].age.value;
		if(age < 18) {
			numChildren++;
		} else if(age < 65) {
			numWA++;
		} else {
			numPensioners++;
		}
	}


	return (
		<>
			<Divider>Your plan</Divider>
			<Steps progressDot direction="vertical">
				{
					Object.keys(props.policy).map((key, i) => (
						props.policy[key].value !== props.policy[key].default
							? <Step key={key} status="finish" title={props.policy[key].title} description={props.policy[key].summary.replace("@", props.policy[key].value)} />
							: null
					))
				}
			</Steps>
			{
				!props.noButton ?
					<Empty description="" image={null}>
						<SimulateButton text="🠔 Change the policy reform" target="/" policy={props.policy} onClick={props.onSubmit} />
						<SimulateButton hidden text="🠔 Simulate on the population" target="/population-results" policy={props.policy} onClick={props.onSubmit}/>
						<SimulateButton primary text="Describe your household" target="/situation" policy={props.policy} onClick={props.onSubmit} />
						<SimulateButton disabled text="See your results" target="/situation-results" policy={props.policy} onClick={props.onSubmit} />
					</Empty> :
					null
			}
			
		</>
	);
}



export default PolicySituationOverview;