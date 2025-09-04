import login from "./en/login.json";
import signup from "./en/signup.json";
import animalProfileHealthCard from "./en/animal-profile-health-card.json";
import healthCardIndividualInfo from "./en/health-card-individual-info.json";
import animalProfileBasicCard from "./en/animal-profile-basic-card.json";
import dropdownMenuHeader from "./en/dropdown-menu-header.json";
import deleteAnimalModal from "./en/delete-animal-modal.json";
import editAnimalForm from "./en/edit-animal-form.json";
import editAnimalModal from "./en/edit-animal-modal.json";

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
} as const;

export default resources;
