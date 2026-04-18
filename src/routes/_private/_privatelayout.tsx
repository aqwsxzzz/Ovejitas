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
import { useEffect } from "react";

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

	useEffect(() => {
		const previousHtmlOverflow = document.documentElement.style.overflow;
		const previousBodyOverflow = document.body.style.overflow;

		document.documentElement.style.overflow = "hidden";
		document.body.style.overflow = "hidden";

		return () => {
			document.documentElement.style.overflow = previousHtmlOverflow;
			document.body.style.overflow = previousBodyOverflow;
		};
	}, []);

	if (isLoading) {
		return <div>{t("isLoadingMsg")}</div>;
	}
	if (!userData) {
		return <div>{t("noUserDataErrorMsg")}</div>;
	}

	return (
		<div className="bg-background h-dvh w-full flex flex-col overflow-hidden">
			<div
				id="app-scroll-container"
				className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-20"
			>
				<Outlet />
			</div>
			<BottomTabNav />
		</div>
	);
}
