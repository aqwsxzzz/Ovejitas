import { axiosHelper } from "@/lib/axios/axios-helper";
import { ApiRequestError } from "@/lib/axios/axios-helper";
import type {
	Breed,
	CreateBreedPayload,
	CreateBreedTranslationPayload,
	BreedOrder,
	BreedOrderField,
	BreedTranslation,
} from "@/features/breed/types/breed";
import { getBreedDisplayName } from "@/features/breed/types/breed";
import type { IBreed } from "@/features/breed/types/breed-types";
import i18next from "i18next";

const BREEDS_API_PATH = "/breeds";
const BREED_TRANSLATIONS_API_PATH = "/breed-translations";
const ALLOWED_ORDER_FIELDS: BreedOrderField[] = ["id", "createdAt"];

type ApiEnvelope<T> = {
	status: "success" | "error";
	message: string;
	data: T;
};

const extractDataFromEnvelope = <T>(payload: unknown): T => {
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Invalid API response format.");
	}

	const response = payload as Partial<ApiEnvelope<T>>;

	if (response.status === "error") {
		throw new Error(response.message || "API responded with an error.");
	}

	if (typeof response.status !== "string" || !("data" in response)) {
		throw new Error("Invalid API response format.");
	}

	return response.data as T;
};

const validateBreedOrder = (order: string): BreedOrder => {
	const parts = order
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	if (parts.length === 0) {
		throw new Error("Invalid order format.");
	}

	for (const segment of parts) {
		const [field, direction] = segment.split(":");
		if (
			!field ||
			!direction ||
			!ALLOWED_ORDER_FIELDS.includes(field as BreedOrderField) ||
			(direction !== "asc" && direction !== "desc")
		) {
			throw new Error(
				"Invalid order value. Use id/createdAt with asc or desc.",
			);
		}
	}

	return order as BreedOrder;
};

const normalizeBreed = (breed: Breed, language: string): Breed => ({
	...breed,
	name: getBreedDisplayName(breed, language),
});

type GetBreedsBySpeciesOptions = {
	order?: string;
	includeTranslations?: boolean;
	withLanguage?: boolean;
	language?: string;
	page?: number;
	limit?: number;
};

type GetBreedsBySpeciesParams = {
	speciesId: string;
	order?: string;
	include?: "translations";
	language?: string;
	page?: number;
	limit?: number;
};

const fetchBreeds = async (params: GetBreedsBySpeciesParams) =>
	axiosHelper<unknown, GetBreedsBySpeciesParams>({
		method: "get",
		url: BREEDS_API_PATH,
		urlParams: params,
	});

const shouldFallbackToLegacyBreedQuery = (error: unknown): boolean => {
	if (!(error instanceof ApiRequestError)) {
		return false;
	}

	if (error.statusCode !== 500) {
		return false;
	}

	const normalizedMessage = error.message.trim().toLowerCase();
	return (
		normalizedMessage.includes("database") ||
		normalizedMessage.includes("error")
	);
};

export const getBreedsBySpecies = async (
	speciesId: string,
	options?: GetBreedsBySpeciesOptions,
): Promise<Breed[]> => {
	if (!speciesId.trim()) {
		throw new Error("Species is required to load breeds.");
	}

	const {
		order,
		includeTranslations = true,
		withLanguage = true,
		language,
		page = 1,
		limit = 100,
	} = options ?? {};
	const selectedLanguage = (language ?? i18next.language).slice(0, 2);
	const orderParam = order ? validateBreedOrder(order) : undefined;

	const queryParams: GetBreedsBySpeciesParams = {
		speciesId,
		...(orderParam ? { order: orderParam } : {}),
		...(includeTranslations ? { include: "translations" as const } : {}),
		...(includeTranslations && withLanguage
			? { language: selectedLanguage }
			: {}),
		page,
		limit,
	};

	let response: unknown;

	try {
		response = await fetchBreeds(queryParams);
	} catch (error) {
		if (!includeTranslations || !shouldFallbackToLegacyBreedQuery(error)) {
			throw error;
		}

		response = await fetchBreeds({
			speciesId,
			...(orderParam ? { order: orderParam } : {}),
			page,
			limit,
		});
	}

	return extractDataFromEnvelope<Breed[]>(response).map((breed) =>
		normalizeBreed(breed, selectedLanguage),
	);
};

export const createBreed = async (
	payload: CreateBreedPayload,
): Promise<Breed> => {
	if (!payload.speciesId.trim()) {
		throw new Error("Species is required to create a breed.");
	}

	if (!payload.name.trim()) {
		throw new Error("Breed name is required.");
	}

	if (!payload.language.trim()) {
		throw new Error("Language is required to create a breed.");
	}

	const response = await axiosHelper<unknown, unknown, CreateBreedPayload>({
		method: "post",
		url: BREEDS_API_PATH,
		data: payload,
	});

	return normalizeBreed(
		extractDataFromEnvelope<Breed>(response),
		payload.language.slice(0, 2),
	);
};

export const createBreedTranslation = async (
	payload: CreateBreedTranslationPayload,
): Promise<BreedTranslation> => {
	if (!payload.breedId.trim()) {
		throw new Error("Breed is required to create a translation.");
	}

	if (!payload.name.trim()) {
		throw new Error("Translation name is required.");
	}

	if (!payload.language.trim()) {
		throw new Error("Language is required to create a translation.");
	}

	const response = await axiosHelper<
		unknown,
		unknown,
		CreateBreedTranslationPayload
	>({
		method: "post",
		url: BREED_TRANSLATIONS_API_PATH,
		data: payload,
	});

	return extractDataFromEnvelope<BreedTranslation>(response);
};

export const getBreedsBySpecieId = async ({
	speciesId,
}: {
	speciesId: string;
}) => {
	const breeds = await getBreedsBySpecies(speciesId);

	return {
		status: "success" as const,
		message: "Breeds fetched successfully",
		data: breeds as IBreed[],
	};
};
