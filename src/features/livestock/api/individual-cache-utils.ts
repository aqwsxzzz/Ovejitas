import type {
	ILivestockIndividual,
	ILivestockIndividualListResponse,
} from "@/features/livestock/types/livestock-types";

export function appendIndividualToListCache(
	current: ILivestockIndividualListResponse | undefined,
	created: ILivestockIndividual,
): ILivestockIndividualListResponse | undefined {
	if (!current) return current;
	if (current.data.some((individual) => individual.id === created.id)) {
		return current;
	}

	return {
		...current,
		data: [created, ...current.data],
		meta: {
			...current.meta,
			total: current.meta.total + 1,
		},
	};
}

export function replaceIndividualInListCache(
	current: ILivestockIndividualListResponse | undefined,
	updated: ILivestockIndividual,
): ILivestockIndividualListResponse | undefined {
	if (!current) return current;

	return {
		...current,
		data: current.data.map((individual) =>
			individual.id === updated.id ? updated : individual,
		),
	};
}

export function removeIndividualFromListCache(
	current: ILivestockIndividualListResponse | undefined,
	individualId: string,
): ILivestockIndividualListResponse | undefined {
	if (!current) return current;

	const nextData = current.data.filter(
		(individual) => String(individual.id) !== individualId,
	);

	if (nextData.length === current.data.length) {
		return current;
	}

	return {
		...current,
		data: nextData,
		meta: {
			...current.meta,
			total: Math.max(0, current.meta.total - 1),
		},
	};
}
