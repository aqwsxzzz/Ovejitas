import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import loginEN from "./en/login.json";
import loginES from "./es/login.json";
import signupEN from "./en/signup.json";
import signupES from "./es/signup.json";
import dropdownMenuHeaderEN from "./en/dropdown-menu-header.json";
import dropdownMenuHeaderES from "./es/dropdown-menu-header.json";
import sheetMenuEN from "./en/sheet-menu.json";
import sheetMenuES from "./es/sheet-menu.json";
import farmMembersEN from "./en/farm-members.json";
import farmMembersES from "./es/farm-members.json";
import animalsEN from "./en/animals.json";
import animalsES from "./es/animals.json";
import dashboardEN from "./en/dashboard.json";
import dashboardES from "./es/dashboard.json";
import tasksEN from "./en/tasks-tab.json";
import tasksES from "./es/tasks-tab.json";
import privateLayoutEN from "./en/private-layout.json";
import privateLayoutES from "./es/private-layout.json";
import bottomTabNavEN from "./en/bottom-tab-nav.json";
import bottomTabNavES from "./es/bottom-tab-nav.json";
import expensesEN from "./en/expenses.json";
import expensesES from "./es/expenses.json";
import flocksEN from "./en/flocks.json";
import flocksES from "./es/flocks.json";
import inventoryEN from "./en/inventory.json";
import inventoryES from "./es/inventory.json";

export const defaultNS = "login";

i18next
	.use(LanguageDetector) // <-- Agrega el detector aquí
	.use(initReactI18next)
	.init({
		debug: import.meta.env.DEV,
		resources: {
			en: {
				login: loginEN,
				signup: signupEN,
				dropdownMenuHeader: dropdownMenuHeaderEN,
				sheetMenu: sheetMenuEN,
				farmMembers: farmMembersEN,
				animals: animalsEN,
				dashboard: dashboardEN,
				tasks: tasksEN,
				privateLayout: privateLayoutEN,
				bottomTabNav: bottomTabNavEN,
				expenses: expensesEN,
				flocks: flocksEN,
				inventory: inventoryEN,
			},
			es: {
				login: loginES,
				signup: signupES,
				dropdownMenuHeader: dropdownMenuHeaderES,
				sheetMenu: sheetMenuES,
				farmMembers: farmMembersES,
				animals: animalsES,
				dashboard: dashboardES,
				tasks: tasksES,
				privateLayout: privateLayoutES,
				bottomTabNav: bottomTabNavES,
				expenses: expensesES,
				flocks: flocksES,
				inventory: inventoryES,
			},
		},
		defaultNS,
	});
