import { Steps, Divider, Empty, Button } from "antd";
import { Link } from "react-router-dom";
import { SimulateButton } from "../policy/overview";
import { SharePolicyLinks } from "../policy/overview";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getFormatter } from "../policy/controls";

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
	let plan = Object.keys(props.policy).map((key, i) => (
		props.policy[key].value !== props.policy[key].default
			? <Step key={key} status="finish" title={props.policy[key].title} description={props.policy[key].summary.replace("@", getFormatter(props.policy[key])(props.policy[key].value))} />
			: null
	));
	let isEmpty = plan.every(element => element === null);
	return (
		<>
			<Divider>Your plan</Divider>
			{!isEmpty ?
				<Steps progressDot direction="vertical">
					{plan}
				</Steps> :
				<Empty description="No plan provided" />
			}
			{
				!props.noButton ?
					<Empty description="" image={null}>
						<SimulateButton disabled={props.invalid} text={<><ArrowLeftOutlined /> Change the policy reform</>} target="/" policy={props.policy} onClick={props.onSubmit} />
						<SimulateButton disabled={props.invalid} hidden text="🠔 Simulate on the population" target="/population-results" policy={props.policy} onClick={props.onSubmit}/>
						<SimulateButton disabled={props.invalid} primary text="Describe your household" target="/situation" policy={props.policy} onClick={props.onSubmit} />
						<SimulateButton disabled text="See your results" target="/situation-results" policy={props.policy} onClick={props.onSubmit} />
					</Empty> :
					null
			}
			<SharePolicyLinks policy={props.policy}/>
			
		</>
	);
}



export default PolicySituationOverview;