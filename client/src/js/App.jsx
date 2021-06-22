// JS imports

import React from "react";

import Header from "./ui/header";

// JSON imports

//import DEFAULT_PLAN from "./parameters/default_plan";

// CSS imports

import "../css/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";

class App extends React.Component {
	render() {
		return (
			<Header />
		);
	}
}

export default App;
