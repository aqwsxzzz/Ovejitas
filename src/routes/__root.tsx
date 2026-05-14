import { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { authQueryKeys } from "@/features/auth/api/auth-queries";
import { getUserProfile } from "@/features/auth/api/auth-api";
import type { IMeResponse } from "@/features/auth/types/auth-types";
import {
	clearTokenPair,
	hasStoredAccessToken,
} from "@/features/auth/utils/auth-session";

const PUBLIC_AUTH_PATHS = new Set([
	"/login",
	"/signup",
	"/v2/login",
	"/v2/signup",
]);
const LANDING_PATHS = new Set(["/", "/v2", "/v2/"]);

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async ({ context, location }) => {
		const pathname = location.pathname;
		const hasToken = hasStoredAccessToken();

		if (!hasToken) {
			if (PUBLIC_AUTH_PATHS.has(pathname) || LANDING_PATHS.has(pathname)) {
				return;
			}

			return redirect({ to: "/v2/login" });
		}

		try {
			await context.queryClient.ensureQueryData<IMeResponse>({
				queryKey: authQueryKeys.all,
				queryFn: getUserProfile,
			});
		} catch {
			clearTokenPair();
			return redirect({ to: "/v2/login" });
		}

		if (PUBLIC_AUTH_PATHS.has(pathname) || LANDING_PATHS.has(pathname)) {
			return redirect({ to: "/v2/dashboard" });
		}
	},
	component: () => (
		<>
			<Outlet />
		</>
	),
});
