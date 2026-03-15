export type BreedTranslation = {
	id: string;
	breedId: string;
	language: string;
	name: string;
	createdAt?: string;
	updatedAt?: string;
};

export type Breed = {
	id: string;
	speciesId: string;
	name?: string;
	translations?: BreedTranslation[];
	createdAt?: string;
	updatedAt?: string;
};

export type BreedOrderField = "id" | "createdAt";
export type BreedOrderDirection = "asc" | "desc";
export type BreedOrder = `${BreedOrderField}:${BreedOrderDirection}`;

export type CreateBreedPayload = {
	speciesId: string;
	name: string;
	language: string;
};

export type CreateBreedTranslationPayload = {
	breedId: string;
	language: string;
	name: string;
};

export const getBreedDisplayName = (
	breed: Breed,
	language?: string,
): string => {
	const normalizedLanguage = language?.trim().toLowerCase();
	const translations = breed.translations ?? [];

	if (normalizedLanguage) {
		const localizedTranslation = translations.find(
			(translation) =>
				translation.language.trim().toLowerCase() === normalizedLanguage,
		);

		if (localizedTranslation?.name) {
			return localizedTranslation.name;
		}
	}

	if (translations[0]?.name) {
		return translations[0].name;
	}

	return breed.name ?? "";
};
