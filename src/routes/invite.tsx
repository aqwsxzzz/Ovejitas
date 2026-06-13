import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { InviteAcceptPage } from "@/features/farm-invitations/pages/invite-accept-page";

export const Route = createFileRoute("/invite")({
	validateSearch: z.object({
		token: z.string().min(1),
	}),
	component: InviteRoute,
});

function InviteRoute() {
	const { token } = Route.useSearch();
	return <InviteAcceptPage token={token} />;
}
