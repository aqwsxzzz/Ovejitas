import {
	acceptInvitation,
	createFarmInvitation,
	getFarmInvitations,
	resolveInvitationToken,
	revokeFarmInvitation,
} from "@/features/farm-invitations/api/farm-invitations-api";
import type {
	IAcceptInvitationPayload,
	IInvitationCreatePayload,
	IInvitationCreateResponse,
	InvitationRole,
	InvitationStatus,
} from "@/features/farm-invitations/types/farm-invitations-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const farmInvitationsQueryKeys = {
	all: ["farm-invitations"] as const,
	list: (farmId: string, status?: InvitationStatus) =>
		[
			...farmInvitationsQueryKeys.all,
			"list",
			farmId,
			...(status ? [status] : []),
		] as const,
	resolve: (token: string) =>
		[...farmInvitationsQueryKeys.all, "resolve", token] as const,
};

export const useGetFarmInvitations = ({
	farmId,
	status,
}: {
	farmId: string;
	status?: InvitationStatus;
}) =>
	useQuery({
		queryKey: farmInvitationsQueryKeys.list(farmId, status),
		queryFn: () => getFarmInvitations({ farmId, status }),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: 10_000,
	});

export const useCreateFarmInvitation = ({ farmId }: { farmId: string }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: IInvitationCreatePayload) =>
			createFarmInvitation({ farmId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: farmInvitationsQueryKeys.list(farmId),
			});
		},
	});
};

export const useRevokeFarmInvitation = ({ farmId }: { farmId: string }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (invitationId: number) =>
			revokeFarmInvitation({ farmId, invitationId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			toast.success("Invitacion revocada");
			void queryClient.invalidateQueries({
				queryKey: farmInvitationsQueryKeys.list(farmId),
			});
		},
	});
};

export const useRegenerateInvitation = ({ farmId }: { farmId: string }) => {
	const queryClient = useQueryClient();

	return useMutation<
		IInvitationCreateResponse,
		Error,
		{ invitationId: number; email: string; role: InvitationRole }
	>({
		mutationFn: async ({ invitationId, email, role }) => {
			await revokeFarmInvitation({ farmId, invitationId });
			return createFarmInvitation({ farmId, payload: { email, role } });
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: farmInvitationsQueryKeys.list(farmId),
			});
		},
	});
};

export const useResolveInvitationToken = (token: string) =>
	useQuery({
		queryKey: farmInvitationsQueryKeys.resolve(token),
		queryFn: () => resolveInvitationToken({ token }),
		enabled: !!token,
		retry: false,
		staleTime: Infinity,
	});

export const useAcceptInvitation = (token: string) =>
	useMutation({
		mutationFn: (payload: IAcceptInvitationPayload) =>
			acceptInvitation({ token, payload }),
	});
