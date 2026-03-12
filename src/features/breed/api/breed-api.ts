import { axiosHelper } from "@/lib/axios/axios-helper";
import type {
	Breed,
	BreedOrder,
	BreedOrderField,
} from "@/features/breed/types/breed";
import type { IBreed } from "@/features/breed/types/breed-types";

const BREEDS_API_PATH = "/breeds";
const ALLOWED_ORDER_FIELDS: BreedOrderField[] = ["name", "id", "createdAt"];

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
				"Invalid order value. Use name/id/createdAt with asc or desc.",
			);
		}
	}

	return order as BreedOrder;
};

export const getBreedsBySpecies = async (
	speciesId: string,
	order?: string,
): Promise<Breed[]> => {
	if (!speciesId.trim()) {
		throw new Error("Species is required to load breeds.");
	}

	const response = await axiosHelper<
		unknown,
		{ speciesId: string; order?: string }
	>({
		method: "get",
		url: BREEDS_API_PATH,
		urlParams: {
			speciesId,
			...(order ? { order: validateBreedOrder(order) } : {}),
		},
	});

	return extractDataFromEnvelope<Breed[]>(response);
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
