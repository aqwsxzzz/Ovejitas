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
import newAnimalBulkFormEN from "./en/new-animal-bulk-form.json";
import newAnimalBulkFormES from "./es/new-animal-bulk-form.json";
import newAnimalFormEN from "./en/new-animal-form.json";
import newAnimalFormES from "./es/new-animal-form.json";
import newAnimalModalEN from "./en/new-animal-modal.json";
import newAnimalModalES from "./es/new-animal-modal.json";
import animalCardEN from "./en/animal-card.json";
import animalCardES from "./es/animal-card.json";
import breedSelectEN from "./en/breed-select.json";
import breedSelectES from "./es/breed-select.json";
import addNewMeasurementFormEN from "./en/add-new-measurement-form.json";
import addNewMeasurementFormES from "./es/add-new-measurement-form.json";
import addNewMeasurementModalEN from "./en/add-new-measurement-modal.json";
import addNewMeasurementModalES from "./es/add-new-measurement-modal.json";
import deleteMeasurementModalEN from "./en/delete-measurement-modal.json";
import deleteMeasurementModalES from "./es/delete-measurement-modal.json";
import measurementTypeSelectEN from "./en/measurement-type-select.json";
import measurementTypeSelectES from "./es/measurement-type-select.json";
import measurementRecordModalEN from "./en/measurement-record-modal.json";
import measurementRecordModalES from "./es/measurement-record-modal.json";

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
				newAnimalBulkForm: newAnimalBulkFormEN,
				newAnimalForm: newAnimalFormEN,
				newAnimalModal: newAnimalModalEN,
				animalCard: animalCardEN,
				breedSelect: breedSelectEN,
				addNewMeasurementForm: addNewMeasurementFormEN,
				addNewMeasurementModal: addNewMeasurementModalEN,
				deleteMeasurementModal: deleteMeasurementModalEN,
				measurementTypeSelect: measurementTypeSelectEN,
				measurementRecordModal: measurementRecordModalEN,
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
				newAnimalBulkForm: newAnimalBulkFormES,
				newAnimalForm: newAnimalFormES,
				newAnimalModal: newAnimalModalES,
				animalCard: animalCardES,
				breedSelect: breedSelectES,
				addNewMeasurementForm: addNewMeasurementFormES,
				addNewMeasurementModal: addNewMeasurementModalES,
				deleteMeasurementModal: deleteMeasurementModalES,
				measurementTypeSelect: measurementTypeSelectES,
				measurementRecordModal: measurementRecordModalES,
			},
		},
		defaultNS,
	});
