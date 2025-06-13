import { useMutation, useQuery } from "@tanstack/react-query";
import type { ILoginPayload, ISignUpPayload } from "@/features/auth/types/auth-types";
import { getUserProfile, login, signup } from "@/features/auth/api/auth-api";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const authQueryKeys = {
    all: ["auth"] as const,
};
export const useSignUp = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: ({ payload }: { payload: ISignUpPayload }) => signup({ payload }),
        onSuccess: () => {
            toast.success("Account created successfully");
            navigate({
                to: "/login",
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};

export const useLogin = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: ({ payload }: { payload: ILoginPayload }) => login({ payload }),
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            navigate({
                to: "/dashboard",
            });
        },
    });
};

export const useGetUserProfile = () =>
    useQuery({
        queryKey: authQueryKeys.all,
        queryFn: () => getUserProfile(),
    });
