import React from "react";
import ReactDOM from "react-dom";
import App from "./js/App";
import GA4React from "ga-4-react";


const ga4react = new GA4React("G-QL2XFHB7B4");
(
	async _ => {
		await ga4react.initialize()
			.then(res => console.log("Analytics Success"))
			.catch(err => console.log("Analytics Failure"))
			.finally(() => {
				ReactDOM.render(
					<App />,
					document.getElementById("root"),
				);
			});
	}
)();