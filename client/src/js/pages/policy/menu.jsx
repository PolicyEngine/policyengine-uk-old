import { Menu } from "antd";
import React from "react";

const { SubMenu } = Menu;

class PolicyMenu extends React.Component {
	render() {
		return (
			<Menu
				onClick={(e) => {this.props.onClick(e.key);}}
				mode="inline"
				defaultOpenKeys={["tax", "income_tax"]}
				defaultSelectedKeys={["main_rates"]}
			>
				<SubMenu key="tax" title="Tax">
					<SubMenu key="income_tax" title="Income Tax">
						<Menu.Item key="main_rates">Labour income</Menu.Item>
						<Menu.Item key="sav_div">Savings and dividends</Menu.Item>
						<Menu.Item key="allowances">Allowances</Menu.Item>
						<Menu.Item key="it_alt">Structural</Menu.Item>
					</SubMenu>
					<SubMenu key="national_insurance" title="National Insurance">
						<Menu.Item key="employee_side">Employees</Menu.Item>
						<Menu.Item key="employer_side">Employers</Menu.Item>
						<Menu.Item key="ni_alt">Structural</Menu.Item>
					</SubMenu>
				</SubMenu>
				<SubMenu key="benefit" title="Benefit">
					<SubMenu key="means" title="Means-tested benefits">
						<Menu.Item key="universal_credit">Universal Credit</Menu.Item>
						<Menu.Item key="jsa">JSA</Menu.Item>
						<Menu.Item key="cb">Child Benefit</Menu.Item>
						<Menu.Item key="wtc">Working Tax Credit</Menu.Item>
						<Menu.Item key="ctc">Child Tax Credit</Menu.Item>
						<Menu.Item key="hb">Housing Benefit</Menu.Item>
						<Menu.Item key="is">Income Support</Menu.Item>
					</SubMenu>
				</SubMenu>
				<Menu.Item key="basic_income">Basic income</Menu.Item>
			</Menu>
		);
	}
}

export default PolicyMenu;