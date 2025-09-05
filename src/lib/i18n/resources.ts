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
} as const;

export default resources;
