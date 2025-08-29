import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import redBarn from "@/routes/_public/assets/redBarn.svg";
import { useTranslation } from "react-i18next";
import { authQueryKeys } from "@/features/auth/api/auth-queries";
import { getUserProfile } from "@/features/auth/api/auth-api";
import type { IUser } from "@/features/auth/types/auth-types";
import type { IResponse } from "@/lib/axios";
import { Route as FarmDashboardRoute } from "@/routes/_private/_privatelayout/farm/$farmId/dashboard";

export const Route = createFileRoute("/_public/_layout")({
	beforeLoad: async ({ context }) => {
		try {
			const response = await context.queryClient.ensureQueryData<
				IResponse<IUser>
			>({
				queryKey: authQueryKeys.all,
				queryFn: getUserProfile,
			});

			return redirect({
				to: FarmDashboardRoute.to,
				params: { farmId: response.data.lastVisitedFarmId },
			});
		} catch (error) {
			void error;
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const login = location.pathname.includes("login") ? "login" : "signup";
	const { t } = useTranslation(login);

	return (
		<div className="h-screen w-screen flex justify-center items-center md:p-4 p-2 flex-col">
			<div>
				<img
					src={redBarn}
					className="w-[300px] md:w-[400px] lg:w-[500px] drop-shadow-lg"
					alt="A big red barn"
				/>
			</div>
			<h1>{t("headerTitle")}</h1>
			<h2>{t("headerDescription")}</h2>
			<Outlet />
		</div>
	);
}
