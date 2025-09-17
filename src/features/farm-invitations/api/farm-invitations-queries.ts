import { sendFarmInvitation } from "@/features/farm-invitations/api/farm-invitations-api";
import type { IFarmInvitationPayload } from "@/features/farm-invitations/types/farm-invitations-types";
import { useMutation } from "@tanstack/react-query";
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
