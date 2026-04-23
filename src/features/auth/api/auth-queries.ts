import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	IMeResponse,
	ILoginPayload,
	IUser,
	ITokenPair,
	ISignUpPayload,
} from "@/features/auth/types/auth-types";
import {
	getUserProfile,
	login,
	refreshTokenPair,
	signup,
} from "@/features/auth/api/auth-api";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
	clearTokenPair,
	loadTokenPair,
	resolveAndPersistActiveFarmId,
	saveTokenPair,
} from "@/features/auth/utils/auth-session";

const mapMeResponseToUser = (data: IMeResponse): IUser => {
	const selectedFarmId = resolveAndPersistActiveFarmId(data.memberships);
	const selectedMembership = data.memberships.find(
		(membership) => String(membership.farm_id) === selectedFarmId,
	);

	return {
		id: String(data.user.id),
		displayName: data.user.name,
		email: data.user.email,
		role: selectedMembership?.role ?? "member",
		createdAt: data.user.created_at,
		lastVisitedFarmId: selectedFarmId,
	};
};

export const authQueryKeys = {
	all: ["auth"] as const,
};
export const useSignUp = () => {
	const navigate = useNavigate();
	return useMutation({
		mutationFn: ({ payload }: { payload: ISignUpPayload }) =>
			signup({ payload }),
		onSuccess: () => {
			toast.success("Account created successfully");
			navigate({
				to: "/v2/login",
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

export const useLogin = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ payload }: { payload: ILoginPayload }) => login({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (response) => {
			saveTokenPair(response);

			const meResponse = await queryClient.fetchQuery({
				queryKey: authQueryKeys.all,
				queryFn: getUserProfile,
			});

			queryClient.setQueryData(authQueryKeys.all, meResponse);
			navigate({
				to: "/v2/dashboard",
			});
		},
	});
};

export const useRefreshTokenPair = () =>
	useMutation({
		mutationFn: ({ payload }: { payload: { refresh_token: string } }) =>
			refreshTokenPair({ payload }),
		onSuccess: (tokenPair: ITokenPair) => {
			saveTokenPair(tokenPair);
		},
		onError: () => {
			clearTokenPair();
		},
	});

export const useGetUserProfile = () =>
	useQuery({
		queryKey: authQueryKeys.all,
		queryFn: () => getUserProfile(),
		select: (data) => mapMeResponseToUser(data),
		enabled: !!loadTokenPair()?.access_token,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

export const useLogout = () => {
	const navigation = useNavigate();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			clearTokenPair();
			return Promise.resolve();
		},
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: authQueryKeys.all });
			navigation({
				to: "/v2/login",
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};
