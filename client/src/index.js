import React from "react";
import ReactDOM from "react-dom";
import App from "./js/App";
import GA4React from "ga-4-react";
import { BrowserRouter as Router } from "react-router-dom";


const ga4react = new GA4React("G-QL2XFHB7B4");
(
	async _ => {
		await ga4react.initialize()
			.then(res => console.log("Analytics Success"))
			.catch(err => console.log("Analytics Failure"))
			.finally(() => {
				ReactDOM.render(
					<Router basename="/"><App /></Router>,
					document.getElementById("root"),
				);
			});
	}
)();