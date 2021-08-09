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
	return (
		<div>
			<Link to={url}><Button onClick={props.onClick}>{props.text || "Simulate"}</Button></Link>
		</div>
	);
}

function PolicyOverview(props) {
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
			<Empty description="" image={null}>
				<SimulateButton text="Simulate on the population" target="/population-results" policy={props.policy} onClick={props.onSubmit}/>
				<div style={{paddingTop: 30}} />
				<SimulateButton policy={props.policy} onClick={props.onSubmit} text="Describe your situation"/>
			</Empty>
		</>
	);
}



export default PolicyOverview;