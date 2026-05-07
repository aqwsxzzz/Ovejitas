import { V2DashboardPage } from "@/features/dashboard/pages/v2-dashboard-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/dashboard")({
	component: V2DashboardPage,
});
