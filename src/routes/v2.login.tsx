import { getUserProfile } from "@/features/auth/api/auth-api";
import { authQueryKeys } from "@/features/auth/api/auth-queries";
import { V2LoginPage } from "@/features/auth/pages/v2-login-page";
import type { IMeResponse } from "@/features/auth/types/auth-types";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/login")({
	beforeLoad: async ({ context }) => {
		try {
			await context.queryClient.ensureQueryData<IMeResponse>({
				queryKey: authQueryKeys.all,
				queryFn: getUserProfile,
			});

			return redirect({ to: "/v2/dashboard" });
		} catch (error) {
			void error;
		}
	},
	component: V2LoginPage,
});
