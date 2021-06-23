import { Menu } from "antd";

const { SubMenu } = Menu;

function SituationMenu(props) {
	let familyMenuItems = [];
	for(let i = 0; i < props.household.families.length; i++) {
		const familyName = `family-${i}`;
		let peopleMenuItems = [];
		let numChildren = 0;
		for(let j = 0; j < props.household.families[i].people.length; j++) {
			const name = `family-${i}-person-${j}`;
			const isAdult = props.household.families[i].people[j].age.value >= 18;
			const title = isAdult ? "Adult" : "Child";
			if(!isAdult) {
				numChildren++;
			}
			const index = isAdult ? j - numChildren + 1 : numChildren;
			peopleMenuItems.push(
				<Menu.Item key={name}>{title} {index}</Menu.Item>
			);
		}
		familyMenuItems.push(
			<SubMenu key={familyName} title={props.household.families.length == 1 ? "Family" : `Family ${i + 1}`}>
				<Menu.Item key={`family-${i}-overview`}>Overview</Menu.Item>
				{peopleMenuItems}
			</SubMenu>
		);
	};
	return (
		<Menu
			mode="inline"
			onClick={e => props.onSelect(e.key)}
			defaultOpenKeys={["family-0"]}
			defaultSelectedKeys={["household"]}
		>
			<Menu.Item key="household">Your household</Menu.Item>
			{familyMenuItems}
		</Menu>
	);
}

export default SituationMenu;