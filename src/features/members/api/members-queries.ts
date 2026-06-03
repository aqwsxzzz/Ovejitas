import { getFarmMembers, removeFarmMember, updateMemberRole } from "@/features/members/api/members-api";
import type { IMemberRoleUpdate } from "@/features/members/types/members-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const membersQueryKeys = {
	all: ["members"] as const,
	list: (farmId: string) => [...membersQueryKeys.all, "list", farmId] as const,
};

export const useGetFarmMembers = ({ farmId }: { farmId: string }) =>
	useQuery({
		queryKey: membersQueryKeys.list(farmId),
		queryFn: () => getFarmMembers({ farmId }),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: 30_000,
	});

export const useUpdateMemberRole = ({ farmId }: { farmId: string }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ memberId, payload }: { memberId: number; payload: IMemberRoleUpdate }) =>
			updateMemberRole({ farmId, memberId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			toast.success("Rol actualizado");
			void queryClient.invalidateQueries({ queryKey: membersQueryKeys.list(farmId) });
		},
	});
};

export const useRemoveFarmMember = ({ farmId }: { farmId: string }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (memberId: number) => removeFarmMember({ farmId, memberId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			toast.success("Miembro eliminado");
			void queryClient.invalidateQueries({ queryKey: membersQueryKeys.list(farmId) });
		},
	});
};
