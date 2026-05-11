import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthLandingPath } from "@/features/auth/utils/auth-session";

export const Route = createFileRoute("/v2/")({
	beforeLoad: () => redirect({ to: getAuthLandingPath() }),
});
