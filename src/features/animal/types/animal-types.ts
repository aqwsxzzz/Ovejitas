export interface IAnimal {
	id: string;
	farmId: string;
	species: { id: string; name: string };
	breed: { id: string; name: string };
	name: string;
	tagNumber: string;
	sex: "female" | "male" | "unknown";
	birthDate: string;
	weight: number;
	status: "alive" | "deceased" | "sold";
	reproductiveStatus: "open" | "pregnant" | "lactating" | "other";
	fatherId: string | null;
	motherId: string | null;
	acquisitionType: "born" | "purchased" | "other";
	acquisitionDate: string;
}

export interface IAnimalPayload {
	farmId: string;
}

export interface ICreateAnimalPayload {
	speciesId: string;
	breedId: string;
	name: string;
	tagNumber: string;
	sex: "female" | "male" | "unknown";
	birthDate: string;
	weight: number;
	status: "alive" | "deceased" | "sold";
	reproductiveStatus: "open" | "pregnant" | "lactating" | "other";
	fatherId: string | null;
	motherId: string | null;
	acquisitionType: "born" | "purchased" | "other";
	acquisitionDate: string;
}

export interface IEditAnimalPayload {
	speciesId: string;
	breedId: string;
	name: string;
	tagNumber: string;
	sex: "female" | "male" | "unknown";
	birthDate: string;
	weight: number;
	status: "alive" | "deceased" | "sold";
	reproductiveStatus: "open" | "pregnant" | "lactating" | "other";
	fatherId: string | null;
	motherId: string | null;
	acquisitionType: "born" | "purchased" | "other";
	acquisitionDate: string;
}

export interface IDeleteAnimal {
	farmId: string;
	animalId: string;
}

export interface IDeleteResponse {
	message: string;
}
