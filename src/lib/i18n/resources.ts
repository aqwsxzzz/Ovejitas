import login from "./en/login.json";
import signup from "./en/signup.json";
import animalProfileHealthCard from "./en/animal-profile-health-card.json";
import healthCardIndividualInfo from "./en/health-card-individual-info.json";
import animalProfileBasicCard from "./en/animal-profile-basic-card.json";
import dropdownMenuHeader from "./en/dropdown-menu-header.json";
import deleteAnimalModal from "./en/delete-animal-modal.json";
import editAnimalForm from "./en/edit-animal-form.json";
import editAnimalModal from "./en/edit-animal-modal.json";
import newAnimalBulkForm from "./en/new-animal-bulk-form.json";
import newAnimalForm from "./en/new-animal-form.json";
import newAnimalModal from "./en/new-animal-modal.json";
import animalCard from "./en/animal-card.json";
import breedSelect from "./en/breed-select.json";
import addNewMeasurementForm from "./en/add-new-measurement-form.json";
import addNewMeasurementModal from "./en/add-new-measurement-modal.json";
import deleteMeasurementModal from "./en/delete-measurement-modal.json";
import measurementTypeSelect from "./en/measurement-type-select.json";
import measurementRecordModal from "./en/measurement-record-modal.json";
import specieSelect from "./en/specie-select.json";
import sheetMenu from "./en/sheet-menu.json";
import speciesIndex from "./en/species-index.json";
import farmMembers from "./en/farm-members.json";
import parentsByGenderSelect from "./en/parents-by-gender-select.json";
import animalsCountBySpeciesCard from "./en/animals-count-by-species-card.json";
import animals from "./en/animals.json";
import dashboard from "./en/dashboard.json";
import tasks from "./en/tasks-tab.json";

//Only bring one of the json files as structure reference.
const resources = {
	login,
	signup,
	animalProfileHealthCard,
	healthCardIndividualInfo,
	animalProfileBasicCard,
	dropdownMenuHeader,
	deleteAnimalModal,
	editAnimalForm,
	editAnimalModal,
	newAnimalBulkForm,
	newAnimalForm,
	newAnimalModal,
	animalCard,
	breedSelect,
	addNewMeasurementForm,
	addNewMeasurementModal,
	deleteMeasurementModal,
	measurementTypeSelect,
	measurementRecordModal,
	specieSelect,
	sheetMenu,
	speciesIndex,
	farmMembers,
	parentsByGenderSelect,
	animalsCountBySpeciesCard,
	animals,
	dashboard,
	tasks,
} as const;

export default resources;
