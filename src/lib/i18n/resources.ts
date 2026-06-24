import login from "./en/login.json";
import signup from "./en/signup.json";
import dropdownMenuHeader from "./en/dropdown-menu-header.json";
import sheetMenu from "./en/sheet-menu.json";
import farmMembers from "./en/farm-members.json";
import animals from "./en/animals.json";
import dashboard from "./en/dashboard.json";
import tasks from "./en/tasks-tab.json";
import privateLayout from "./en/private-layout.json";
import bottomTabNav from "./en/bottom-tab-nav.json";
import expenses from "./en/expenses.json";
import flocks from "./en/flocks.json";
import inventory from "./en/inventory.json";

//Only bring one of the json files as structure reference.
const resources = {
	login,
	signup,
	dropdownMenuHeader,
	sheetMenu,
	farmMembers,
	animals,
	dashboard,
	tasks,
	privateLayout,
	bottomTabNav,
	expenses,
	flocks,
	inventory,
} as const;

export default resources;
