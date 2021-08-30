import ReactMarkdown from "react-markdown";
import { Row, Col } from "react-bootstrap";
import { Typography, Divider } from "antd";
import React from "react";

function Header(props) {
	return <><h1>{props.children}</h1></>;
}

function Subheader(props) {
	return <><Divider>{props.children}</Divider></>;
}

function Subsubheader(props) {
	return <><h5><i>{props.children}</i></h5></>;
}

class FAQ extends React.Component {
	constructor(props) {
		super(props);
		this.state = {text: ""};
	}

	componentDidMount() {
		fetch("/faq.md").then(res => res.text()).then(text => {this.setState({text: text});});
	}

	render() {
		const components = {h1: Header, h2: Subheader, h3: Subsubheader};
		return <Row style={{paddingTop: 30}}>
			<Col md={3}>
			</Col>
			<Col>
				<ReactMarkdown components={components}>{this.state.text}</ReactMarkdown>
			</Col>
			<Col md={3}>
			</Col>
		</Row>;
	}
}

export default FAQ;