import { Button, Menu } from "antd";

const { SubMenu } = Menu;

function SituationMenu(props) {
	let numAdults = 0;
	for(let name in props.situation.people) {
		if(props.situation.people[name].age.value >= 18) {
			numAdults++;
		}
	}
	let numChildren = Object.keys(props.situation.people).length - numAdults;
	return (
		<Menu
			mode="inline"
			onClick={e => props.onSelect(e.key)}
			defaultOpenKeys={["family"]}
			defaultSelectedKeys={["head"]}
			triggerSubMenuAction="hover"
		>
			<Menu.Item key="household">Your household</Menu.Item>
			<SubMenu key="family" title="Your immediate family">
				<Menu.Item key="family_1">Family</Menu.Item>
				<Menu.Item key="head">You</Menu.Item>
				<Menu.Item key="partner">{
					numAdults == 1 ?
						<Button onClick={props.addPartner}>Add partner</Button> :
						"Your partner"
				}</Menu.Item>
				{Array.from(Array(numChildren).keys()).map(i => <Menu.Item key={"child_" + (i + 1)}>Child {i + 1}</Menu.Item>)}
				<Menu.Item key={"child_" + (numChildren + 1)}><Button onClick={props.addChild}>Add child</Button></Menu.Item>
			</SubMenu>
		</Menu>
	);
}

export default SituationMenu;