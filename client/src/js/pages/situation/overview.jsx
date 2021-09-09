import { Steps, Divider, Empty, Button } from "antd";
import { Link } from "react-router-dom";
import { SimulateButton } from "../policy/overview";
import { SharePolicyLinks } from "../policy/overview";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Step } = Steps;

function SituationOverview(props) {
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
			? <Step key={key} status="finish" title={props.policy[key].title} description={props.policy[key].summary.replace("@", props.policy[key].value)} />
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
						<SimulateButton text={<><ArrowLeftOutlined /> Change the policy reform</>} target="/" policy={props.policy} onClick={props.onSubmit} />
						<SimulateButton text={<><ArrowLeftOutlined /> Simulate on the population</>} target="/population-results" policy={props.policy} onClick={props.onSubmit}/>
						<SimulateButton hidden text="Skip to your household" target="/situation" policy={props.policy} onClick={props.onSubmit} />
						<SimulateButton primary text="See your results" target="/situation-results" policy={props.policy} onClick={props.onSubmit} />
					</Empty> :
					<></>
			}
			<SharePolicyLinks policy={props.policy}/>
			
		</>
	);
}


export default SituationOverview;