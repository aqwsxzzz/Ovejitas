import { getV1FarmById, updateV1FarmById } from "@/features/farm/api/farm-api";
import type { IV1FarmUpdatePayload } from "@/features/farm/types/farm-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const farmQueryKeys = {
	all: ["farm"] as const,
	v1FarmById: (farmId: string) =>
		[...farmQueryKeys.all, "v1ById", farmId] as const,
};

export const useGetV1FarmById = (farmId: string) =>
	useQuery({
		queryKey: farmQueryKeys.v1FarmById(farmId),
		queryFn: () => getV1FarmById({ farmId }),
		enabled: !!farmId,
	});

export const useUpdateV1FarmById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			payload,
		}: {
			farmId: string;
			payload: IV1FarmUpdatePayload;
		}) => updateV1FarmById({ farmId, payload }),
		onSuccess: async (_response, { farmId }) => {
			await queryClient.invalidateQueries({
				queryKey: farmQueryKeys.v1FarmById(farmId),
			});
		},
	});
};
