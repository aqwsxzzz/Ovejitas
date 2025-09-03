import login from "./en/login.json";
import signup from "./en/signup.json";
import animalProfileHealthCard from "./en/animal-profile-health-card.json";
import healthCardIndividualInfo from "./en/health-card-individual-info.json";
import animalProfileBasicCard from "./en/animal-profile-basic-card.json";

const resources = {
	login,
	signup,
	animalProfileHealthCard,
	healthCardIndividualInfo,
	animalProfileBasicCard,
} as const;

export default resources;
