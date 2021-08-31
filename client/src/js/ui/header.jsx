import { Row, Col, Container } from "react-bootstrap";
import React from "react";
import { Steps, PageHeader, Button, Tag } from "antd";

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

function NavEntry(props) {
	return (
		<a style={{paddingRight: 20}} href={props.to}>{props.text}</a>
	);
}

export function TopHeader() {
	return (
		<>
			<div className="d-none d-md-block">
				<PageHeader
					title={<>PolicyEngine<sub style={{fontSize: "50%"}}>UK</sub></>}
					subTitle="by the UBI Center"
					style={{minHeight: 40}}
					tags={[<Tag key="beta" color="processing">BETA</Tag>]}
				/>
			</div>
			<div className="d-md-none">
				<div className="d-flex justify-content-center">
					<PageHeader
						title={<>PolicyEngine<sub style={{fontSize: "50%"}}>UK</sub></>}
						style={{paddingBottom: 8}}
						tags={[<Tag key="beta" color="processing">BETA</Tag>]}
					/>
				</div>
				<div className="d-flex justify-content-center">
					<div className="ant-page-header-heading-sub-title">
						By the UBI Center
					</div>
				</div>
			</div>
		</>
	);
}

function Header(props) {
	const INTRO = (
		<p style={{fontSize: 16}}>
      Welcome to the UBI Center's UK Policy Engine. Powered by the open-source
      microsimulation model OpenFisca-UK, this site allows you to experiment
      with different changes to how taxes and benefits are set in the United
      Kingdom, and simulate the results on people, families and households in
      the country.
		</p>
	);
	const TITLES = ["Policy", "UK impact", "Your household", "Household impact"];
	const DESCRIPTIONS = [
		"Specify changes to tax and benefit policy",
		"Simulate the changes on the UK government and households",
		"Describe the members and properties of your household",
		"Simulate the changes on your household"
	];
	let steps = [];
	for(let i = 0; i < TITLES.length; i++) {
		steps.push(<Step key={i} title={TITLES[i]} description={DESCRIPTIONS[i]} style={{minWidth: 200}}/>);
	}
	return (
		<>
			<TopHeader />
			<Container fluid>
				<Row style={{ padding: 50 }} className="d-none d-lg-flex">
					<Col md={12}>
						<Steps className="d-flex justify-content-center" current={props.step}>
							{steps}
						</Steps>
					</Col>
				</Row>
				<Row style={{ padding: 10 }} className="d-lg-none">
					<Col md={12}>
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
