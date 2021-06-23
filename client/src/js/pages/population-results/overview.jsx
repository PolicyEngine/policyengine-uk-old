import { Steps, Divider, Empty, Button } from "antd";
import { Link } from "react-router-dom";
import { SimulateButton } from "../policy/overview";

const { Step } = Steps;

function PolicySituationOverview(props) {
	console.log(props.household);
	const isSingleFamily = props.household.families.length < 2;
	let numPensioners = 0;
	let numWA = 0;
	let numChildren = 0;

	let age;
	for(let i = 0; i < props.household.families.length; i++) {
		for(let j = 0; j < props.household.families[i].people.length; j++) {
			age = props.household.families[i].people[j].age.value;
			if(age < 18) {
				numChildren++;
			} else if(age < 65) {
				numWA++;
			} else {
				numPensioners++;
			}
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
			<Divider>Your situation</Divider>
			<Steps progressDot direction="vertical">
				{
					<>
						<Step status="finish" title={isSingleFamily ? "Single-family household" : "Multi-family household"} description="This affects benefit entitlements" />
						<Step status="finish" title={(numWA == 0 ? "No " : numWA) + " working-age adult" + (numWA == 1 ? "" : "s")}/>
						<Step status="finish" title={(numChildren == 0 ? "No " : numChildren) + " child" + (numChildren == 1 ? "" : "ren")}/>
						<Step status="finish" title={(numPensioners == 0 ? "No " : numPensioners) + " pensioner" + (numPensioners == 1 ? "" : "s")}/>
					</>
				}
			</Steps>
			{
				!props.noButton ?
					<Empty description="" image={null}>
						<SimulateButton text="See your results" target="/situation-results" policy={props.policy} onClick={props.onSubmit}/>
					</Empty> :
					null
			}
			
		</>
	);
}



export default PolicySituationOverview;