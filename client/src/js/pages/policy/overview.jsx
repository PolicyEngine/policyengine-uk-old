import { Steps, Divider, Empty, Button } from "antd";
import { Link } from "react-router-dom";

const { Step } = Steps;

export function SimulateButton(props) {
	const { policy } = props;
	let searchParams = new URLSearchParams(window.location.search);
	for (const key in policy) {
		if (policy[key].value !== policy[key].default) {
			searchParams.set(key, +policy[key].value);
		} else {
			searchParams.delete(key);
		}
	}
	const url = `${props.target || "/situation"}?${searchParams.toString()}`;
	if(props.hidden) {return <></>;}
	return (
		<div style={{marginBottom: 20}}>
			<Link to={url}><Button disabled={props.disabled} type={props.primary ? "primary" : null} onClick={props.onClick}>{props.text || "Simulate"}</Button></Link>
		</div>
	);
}

function PolicyOverview(props) {
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
			<Empty description="" image={null}>
				<SimulateButton hidden text="Select your reform" target="/" policy={props.policy} onClick={props.onSubmit} />
				<SimulateButton primary text="Simulate on the population" target="/population-results" policy={props.policy} onClick={props.onSubmit}/>
				<SimulateButton text="Skip to your household" target="/situation" policy={props.policy} onClick={props.onSubmit} />
				<SimulateButton disabled text="See your results" target="/situation-results" policy={props.policy} onClick={props.onSubmit} />
			</Empty>
		</>
	);
}



export default PolicyOverview;