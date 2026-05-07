import { createFileRoute } from "@tanstack/react-router";

import { V2EventCategoriesPage } from "@/features/livestock/pages/v2-event-categories-page";

export const Route = createFileRoute("/v2/more/event-categories")({
	component: V2EventCategoriesPage,
});
