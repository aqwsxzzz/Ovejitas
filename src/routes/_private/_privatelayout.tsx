import { AppHeader } from "@/components/layout/app-header/app-header";
import { getUserProfile } from "@/features/auth/api/auth-api";
import { authQueryKeys, useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { IUser } from "@/features/auth/types/auth-types";
import type { IResponse } from "@/lib/axios";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_private/_privatelayout")({
    loader: async ({ context }) => {
        const { queryClient } = context;
        try {
            await queryClient.ensureQueryData<IResponse<IUser>>({
                queryKey: authQueryKeys.all,
                queryFn: getUserProfile,
            });
        } catch (error) {
            console.log(error);
            toast.error("You must be logged in to keep going.");
            return redirect({ to: "/login" });
        }
    },

    component: PrivateLayout,
});

function PrivateLayout() {
    const { data: userData } = useGetUserProfile();
    const { setUserData } = useAuthStore();

    useEffect(() => {
        if (userData) {
            setUserData(userData);
        }
    }, [userData]);
    return (
        <div className="bg-background h-screen w-screen flex flex-col">
            <AppHeader userData={userData!} />
            <Outlet />
        </div>
    );
}
