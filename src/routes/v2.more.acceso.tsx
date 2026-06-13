import { createFileRoute } from "@tanstack/react-router";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { FarmInvitationsPage } from "@/features/farm-invitations/pages/farm-invitations-page";

export const Route = createFileRoute("/v2/more/acceso")({
	component: AccesoRoute,
});

function AccesoRoute() {
	const { data: user } = useGetUserProfile();
	const farmId = user?.lastVisitedFarmId ?? "";

	return <FarmInvitationsPage farmId={farmId} />;
}
