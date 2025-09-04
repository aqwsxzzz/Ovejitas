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
import dropdownMenuHeaderEN from "./en/dropdown-menu-header.json";
import dropdownMenuHeaderES from "./es/dropdown-menu-header.json";
import deleteAnimalModalEN from "./en/delete-animal-modal.json";
import deleteAnimalModalES from "./es/delete-animal-modal.json";
import editAnimalFormEN from "./en/edit-animal-form.json";
import editAnimalFormES from "./es/edit-animal-form.json";
import editAnimalModalEN from "./en/edit-animal-modal.json";
import editAnimalModalES from "./es/edit-animal-modal.json";

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
				dropdownMenuHeader: dropdownMenuHeaderEN,
				deleteAnimalModal: deleteAnimalModalEN,
				editAnimalForm: editAnimalFormEN,
				editAnimalModal: editAnimalModalEN,
			},
			es: {
				login: loginES,
				signup: signupES,
				animalProfileHealthCard: animalProfileHealthCardES,
				healthCardIndividualInfo: healthCardIndividualInfoES,
				animalProfileBasicCard: animalProfileBasicCardES,
				dropdownMenuHeader: dropdownMenuHeaderES,
				deleteAnimalModal: deleteAnimalModalES,
				editAnimalForm: editAnimalFormES,
				editAnimalModal: editAnimalModalES,
			},
		},
		defaultNS,
	});
