import { getUserProfile } from "@/features/auth/api/auth-api";
import { authQueryKeys } from "@/features/auth/api/auth-queries";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_private/_privatelayout")({
    loader: async ({ context }) => {
        const { queryClient } = context;
        try {
            await queryClient.ensureQueryData({
                queryKey: authQueryKeys.all,
                queryFn: getUserProfile,
            });
            return;
        } catch (error) {
            console.log(error);
            toast.error("You must be logged in to keep going.");
            return redirect({ to: "/login" });
        }
    },

    component: PrivateLayout,
});

function PrivateLayout() {
    return (
        <div className="bg-destructive h-screen w-screen">
            <div>Hello "/_private/_layout"!</div>
            <Outlet />
        </div>
    );
}
