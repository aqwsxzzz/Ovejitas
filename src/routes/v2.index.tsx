import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/")({
	beforeLoad: () => {
		return redirect({ to: "/v2/dashboard" });
	},
});
