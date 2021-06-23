import { Row, Col, Container } from "react-bootstrap";
import React from "react";
import { Steps, PageHeader } from "antd";
import { Link } from "react-router-dom";

import "../../css/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";

const { Step } = Steps;

function getURLParamsFromPolicy(target, policy) {
	let searchParams = new URLSearchParams(window.location.search);
	for (const key in policy) {
		if (policy[key].value !== policy[key].default) {
			searchParams.set(key, +policy[key].value);
		} else {
			searchParams.delete(key);
		}
	}
	const url = `${target || "/situation"}?${searchParams.toString()}`;
	return url;
}

function TopHeader() {
	return (
		<>
			<div className="d-none d-md-block">
				<PageHeader
					title="openfisca-uk"
					subTitle="reform explorer"
				/>
			</div>
			<div className="d-md-none d-flex justify-content-center">
				<PageHeader
					title="openfisca-uk"
					subTitle="reform explorer"
				/>
			</div>
		</>
	);
}

function Header(props) {
	const INTRO = (
		<p style={{fontSize: 16}}>
      Welcome to the OpenFisca-UK Reform Explorer. Powered by the open-source
      microsimulation model OpenFisca-UK, this site allows you to experiment
      with different changes to how taxes and benefits are set in the United
      Kingdom, and simulate the results on people, families and households in
      the country.
		</p>
	);
	const TITLES = ["Policy", "About you", "UK-wide effects", "Your results"];
	const DESCRIPTIONS = [
		"Specify changes to the current taxes and benefit programmes",
		"Describe your household to calculate the effects on you and your family",
		"Simulate the changes on people, families and households in the UK",
		"Simulate the reform, showing your finances before and after"
	];
	let steps = [];
	for(let i = 0; i < TITLES.length; i++) {
		steps.push(<Step key={i} title={TITLES[i]} description={DESCRIPTIONS[i]} style={{minWidth: 200}}/>);
	}
	return (
		<>
			<TopHeader />
			<Container style={{minWidth: 400}} fluid>
				<Row style={{ padding: 50 }} className="d-none d-xl-flex">
					<Col md={4} style={{minWidth: 300}}>{INTRO}</Col>
					<Col md={8}>
						<div className="d-flex justify-content-center">
							<div>
								<Steps current={props.step}>
									{steps}
								</Steps>
							</div>
						</div>
					</Col>
				</Row>
				<Row style={{ padding: 50, paddingTop: 20 }} className="d-xl-none">
					<Col md={4} style={{ paddingBottom: 20 }}>
						{INTRO}
					</Col>
					<Col md={8}>
						<Steps current={props.step} direction="vertical">
							{steps}
						</Steps>
					</Col>
				</Row>
			</Container>
		</>
	);
}

export default Header;
