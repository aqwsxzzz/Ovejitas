import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthLandingPath } from "@/features/auth/utils/auth-session";

export const Route = createFileRoute("/")({
	beforeLoad: () => redirect({ to: getAuthLandingPath() }),
});
