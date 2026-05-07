import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/_layout/login")({
	beforeLoad: () => redirect({ to: "/v2/login" }),
});
