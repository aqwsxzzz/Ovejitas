import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import loginEN from "./en/login.json";
import loginES from "./es/login.json";
import signupEN from "./en/signup.json";
import signupES from "./es/signup.json";
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
			},
			es: {
				login: loginES,
				signup: signupES,
			},
		},
		defaultNS,
	});
