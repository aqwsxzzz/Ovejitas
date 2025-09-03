import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import loginEN from "./en/login.json";
import loginES from "./es/login.json";
import signupEN from "./en/signup.json";
import signupES from "./es/signup.json";
import animalProfileHealthCardEN from "./en/animal-profile-health-card.json";
import animalProfileHealthCardES from "./es/animal-profile-health-card.json";
import healthCardIndividualInfoEN from "./en/health-card-individual-info.json";
import healthCardIndividualInfoES from "./es/health-card-individual-info.json";
import animalProfileBasicCardEN from "./en/animal-profile-basic-card.json";
import animalProfileBasicCardES from "./es/animal-profile-basic-card.json";

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
				animalProfileHealthCard: animalProfileHealthCardEN,
				healthCardIndividualInfo: healthCardIndividualInfoEN,
				animalProfileBasicCard: animalProfileBasicCardEN,
			},
			es: {
				login: loginES,
				signup: signupES,
				animalProfileHealthCard: animalProfileHealthCardES,
				healthCardIndividualInfo: healthCardIndividualInfoES,
				animalProfileBasicCard: animalProfileBasicCardES,
			},
		},
		defaultNS,
	});
