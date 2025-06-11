import { useMutation, useQuery } from "@tanstack/react-query";
import type { ILoginPayload, ISignUpPayload } from "@/features/auth/types/auth-types";
import { getUserProfile, login, signup } from "@/features/auth/api/auth-api";

export const authQueryKeys = {
    all: ["auth"] as const,
};

export const useSignUp = () => useMutation({ mutationFn: ({ payload }: { payload: ISignUpPayload }) => signup({ payload }) });

export const useLogin = () => useMutation({ mutationFn: ({ payload }: { payload: ILoginPayload }) => login({ payload }) });

export const useGetUserProfile = () =>
    useQuery({
        queryKey: authQueryKeys.all,
        queryFn: () => getUserProfile(),
    });
