import { getFarmMembers } from "@/features/farm-members/api/farm-members-api";
import { useQuery } from "@tanstack/react-query";

export const farmMembersQueryKeys = {
	all: ["farm-members"] as const,
	farmMembersList: (farmId: string) =>
		[...farmMembersQueryKeys.all, "farmMembers", farmId] as const,
};

export const useGetFarmMembers = ({ farmId }: { farmId: string }) =>
	useQuery({
		queryKey: farmMembersQueryKeys.farmMembersList(farmId),
		queryFn: () => getFarmMembers({ farmId }),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: 10000, // 10 seconds
	});
