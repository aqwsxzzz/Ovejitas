import { AppHeader } from "@/components/layout/app-header";
import { getUserProfile } from "@/features/auth/api/auth-api";
import { authQueryKeys, useGetUserProfile } from "@/features/auth/api/auth-queries";
import type { IUser } from "@/features/auth/types/auth-types";
import type { IResponse } from "@/lib/axios";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_private/_privatelayout")({
    loader: async ({ context }) => {
        const { queryClient } = context;
        try {
            return await queryClient.ensureQueryData<IResponse<IUser>>({
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

    return (
        <div className="bg-destructive h-screen w-screen flex flex-col">
            <AppHeader userData={userData!} />
            <Outlet />
        </div>
    );
}
