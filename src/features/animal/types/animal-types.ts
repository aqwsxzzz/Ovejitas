export interface IAnimal {
	id: string;
	farmId: string;
	species: { id: string; name: string };
	breed: { id: string; name: string };
	name: string | null;
	tagNumber: string;
	sex: "female" | "male" | "unknown";
	birthDate: string | null;
	status: "alive" | "deceased" | "sold" | null;
	reproductiveStatus: "open" | "pregnant" | "lactating" | "other";
	fatherId: string | null;
	motherId: string | null;
	acquisitionType: "born" | "purchased" | "other";
	acquisitionDate: string | null;
	lastMeasurement: {
		id: string;
		animalId: string;
		measurementType: string;
		value: number;
		unit: string;
		measuredAt: string;
		measuredBy: string;
		notes: string | null;
	};
}

export interface IAnimalPayload {
	farmId: string;
}

export interface ICreateAnimalPayload {
	speciesId: string;
	breedId: string;
	name: string | null;
	tagNumber: string;
	sex: "female" | "male" | "unknown";
	birthDate: string | null;
	status: "alive" | "deceased" | "sold" | null;
	reproductiveStatus: "open" | "pregnant" | "lactating" | "other";
	fatherId: string | null;
	motherId: string | null;
	acquisitionType: "born" | "purchased" | "other";
	acquisitionDate: string | null;
}

export interface IEditAnimalPayload {
	speciesId: string;
	breedId: string;
	name: string | null;
	tagNumber: string;
	sex: "female" | "male" | "unknown";
	birthDate: string | null;
	status: "alive" | "deceased" | "sold" | null;
	reproductiveStatus: "open" | "pregnant" | "lactating" | "other";
	fatherId: string | null;
	motherId: string | null;
	acquisitionType: "born" | "purchased" | "other";
	acquisitionDate: string | null;
}

export interface IDeleteAnimal {
	farmId: string;
	animalId: string;
}

export interface IDeleteResponse {
	message: string;
}
