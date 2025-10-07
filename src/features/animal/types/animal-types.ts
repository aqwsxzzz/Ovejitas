export interface IAnimal {
	id: string;
	farmId: string;
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
	species: {
		id: string;
		translations: [
			{
				id: string;
				language: string;
				name: string;
				speciesId: string;
			},
		];
	};
}
export type IAnimalWithIncludes<T = Record<string, unknown>> = IAnimal & T;
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
	groupName: string | null;
	language: string;
}

export interface ICreateAnimalBulkPayload {
	speciesId: string;
	breedId: string;
	groupName: string | null;
	tagPrefix: string | null;
	count?: number | null;
	tagStartNumber?: number | null;
	tags?: string[] | null;
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
	data: null;
}

export interface IAnimalsCountBySpeciesResponse {
	count: number;
	species: {
		id: string;
		name: string;
	};
}
