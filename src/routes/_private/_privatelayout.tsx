import { AppHeader } from "@/components/layout/app-header/app-header";
import { getUserProfile } from "@/features/auth/api/auth-api";
import {
	authQueryKeys,
	useGetUserProfile,
} from "@/features/auth/api/auth-queries";
import type { IUser } from "@/features/auth/types/auth-types";
import type { IResponse } from "@/lib/axios";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
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
	const { data: userData, isLoading } = useGetUserProfile();

	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (!userData) {
		return <div>Something went wrong</div>;
	}

	return (
		<div className="bg-background h-screen w-screen flex flex-col">
			<AppHeader userData={userData} />
			<div className="p-2 flex flex-col gap-2">
				<Outlet />
			</div>
		</div>
	);
}
