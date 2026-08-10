import { useQuery } from "@tanstack/react-query";

import {
	getIndividualById,
	listIndividualsByAssetId,
} from "@/features/livestock/api/livestock-api";
import type { ListIndividualsFilters } from "@/features/livestock/api/livestock-query-filters";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import type {
	ILivestockIndividual,
} from "@/features/livestock/types/livestock-types";

export const useListIndividualsByAssetId = ({
	farmId,
	assetId,
	filters,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	filters?: ListIndividualsFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.individualsByAsset(farmId, assetId, filters),
		queryFn: () => listIndividualsByAssetId({ farmId, assetId, filters }),
		enabled: enabled && !!farmId && !!assetId,
	});

export const useGetIndividualById = ({
	farmId,
	assetId,
	individualId,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	individualId: string;
	enabled?: boolean;
}) =>
	useQuery<ILivestockIndividual>({
		queryKey: livestockQueryKeys.individualById(farmId, assetId, individualId),
		queryFn: () => getIndividualById({ farmId, assetId, individualId }),
		enabled: enabled && !!farmId && !!assetId && !!individualId,
	});

