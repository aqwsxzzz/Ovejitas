export type Breed = {
	id: string;
	speciesId: string;
	name: string;
	createdAt?: string;
	updatedAt?: string;
};

export type BreedOrderField = "name" | "id" | "createdAt";
export type BreedOrderDirection = "asc" | "desc";
export type BreedOrder = `${BreedOrderField}:${BreedOrderDirection}`;
