import { BottomTabNav } from "@/components/layout/bottom-tab-nav";
import { getUserProfile } from "@/features/auth/api/auth-api";
import {
	authQueryKeys,
	useGetUserProfile,
} from "@/features/auth/api/auth-queries";
import type { IUser } from "@/features/auth/types/auth-types";
import type { IResponse } from "@/lib/axios";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/_privatelayout")({
	loader: async ({ context }) => {
		const { queryClient } = context;
		try {
			await queryClient.ensureQueryData<IResponse<IUser>>({
				queryKey: authQueryKeys.all,
				queryFn: getUserProfile,
			});
		} catch (error) {
			void error;
			toast.error(i18next.t("privateLayout:notLoggedErrorMsg"));
			return redirect({ to: "/login" });
		}
	},

	component: PrivateLayout,
});

function PrivateLayout() {
	const { data: userData, isLoading } = useGetUserProfile();
	const { t } = useTranslation("privateLayout");

	if (isLoading) {
		return <div>{t("isLoadingMsg")}</div>;
	}
	if (!userData) {
		return <div>{t("noUserDataErrorMsg")}</div>;
	}

	return (
		<div className="bg-background h-screen w-screen flex flex-col">
			<div className="flex-1 overflow-auto pb-20">
				<div className="p-4 flex flex-col gap-4">
					<Outlet />
				</div>
			</div>
			<BottomTabNav />
		</div>
	);
}
