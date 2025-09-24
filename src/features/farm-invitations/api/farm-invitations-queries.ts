import {
	getFarmInvitationList,
	sendFarmInvitation,
} from "@/features/farm-invitations/api/farm-invitations-api";
import type { IFarmInvitationPayload } from "@/features/farm-invitations/types/farm-invitations-types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const farmInvitationsQueryKeys = {
	all: ["farm-invitations"] as const,
	invitationsList: (farmId: string) =>
		[...farmInvitationsQueryKeys.all, "list", farmId] as const,
};

export const useSendFarmInvitation = () => {
	//const queryClient =  useQueryClient();

	return useMutation({
		mutationFn: ({ payload }: { payload: IFarmInvitationPayload }) =>
			sendFarmInvitation({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			toast.success("Invitation sent successfully");
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
