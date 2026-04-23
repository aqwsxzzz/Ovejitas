import { createFileRoute } from "@tanstack/react-router";

import { LivestockPage } from "@/features/livestock/pages/livestock-page";

export const Route = createFileRoute("/v2/production-units/")({
	component: LivestockPage,
});
