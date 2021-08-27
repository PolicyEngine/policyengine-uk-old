import ReactMarkdown from "react-markdown";
import { Row, Col } from "react-bootstrap";
import { Typography } from "antd";
import React from "react";

function Title(props) {
	return <h1>{props.children}</h1>;
}

function Subtitle(props) {
	return <h3>{props.children}</h3>;
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
		const components = {h1: Title, h2: Subtitle};
		return <Row style={{paddingTop: 30}}>
			<Col md={1}>
			</Col>
			<Col>
				<ReactMarkdown components={components}>{this.state.text}</ReactMarkdown>
			</Col>
			<Col md={1}>
			</Col>
		</Row>;
	}
}

export default FAQ;