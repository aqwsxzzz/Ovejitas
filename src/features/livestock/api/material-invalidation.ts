import type { useQueryClient } from "@tanstack/react-query";

import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import { reportsQueryKeys } from "@/features/reports/api/reports-queries";


export const invalidateMaterialDetailQueries = async ({
	queryClient,
	farmId,
	assetId,
}: {
	queryClient: ReturnType<typeof useQueryClient>;
	farmId: string;
	assetId: string;
}) => {
	await Promise.all([
		queryClient.invalidateQueries({
			queryKey: livestockQueryKeys.inventoryBalanceByAsset(farmId, assetId),
		}),
		queryClient.invalidateQueries({
			queryKey: [...livestockQueryKeys.all, "profitabilityReport", farmId],
		}),
		queryClient.invalidateQueries({
			queryKey: [
				...livestockQueryKeys.all,
				"eventsByAssetInfinite",
				farmId,
				assetId,
			],
		}),
		queryClient.invalidateQueries({
			queryKey: [...livestockQueryKeys.all, "eventsByAsset", farmId, assetId],
		}),
		queryClient.invalidateQueries({
			queryKey: [
				...livestockQueryKeys.all,
				"materialPurchases",
				farmId,
				Number(assetId),
			],
		}),
		queryClient.invalidateQueries({
			queryKey: [...livestockQueryKeys.all, "materialConsumptions", farmId],
		}),
		queryClient.invalidateQueries({
			queryKey: reportsQueryKeys.farm(farmId),
		}),
		queryClient.invalidateQueries({
			queryKey: ["v2", "finance", "snapshot", farmId],
		}),
	]);
};

