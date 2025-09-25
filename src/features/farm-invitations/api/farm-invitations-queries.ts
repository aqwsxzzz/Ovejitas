import {
	getFarmInvitationList,
	sendFarmInvitation,
} from "@/features/farm-invitations/api/farm-invitations-api";
import type {
	IFarmInvitationPayload,
	IFarmInvitationResponse,
} from "@/features/farm-invitations/types/farm-invitations-types";
import type { IResponse } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const farmInvitationsQueryKeys = {
	all: ["farm-invitations"] as const,
	invitationsList: (farmId: string) =>
		[...farmInvitationsQueryKeys.all, "list", farmId] as const,
};

export const useSendFarmInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ payload }: { payload: IFarmInvitationPayload }) =>
			sendFarmInvitation({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { payload }) => {
			toast.success("Invitation sent successfully");
			queryClient.setQueryData<IResponse<IFarmInvitationResponse[]>>(
				farmInvitationsQueryKeys.invitationsList(payload.farmId),

				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: [...oldData.data, response.data],
					};
				},
			);
		},
	});
};

export const useGetFarmInvitationsList = ({ farmId }: { farmId: string }) =>
	useQuery({
		queryKey: farmInvitationsQueryKeys.invitationsList(farmId),
		queryFn: () => getFarmInvitationList({ farmId }),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: 10000, // 10 seconds
	});
