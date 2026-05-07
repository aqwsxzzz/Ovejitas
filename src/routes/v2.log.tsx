import { V2LogPage } from "@/features/quick-actions/pages/v2-log-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/log")({
	validateSearch: (search: Record<string, unknown>) => ({
		actionId: typeof search.actionId === "string" ? search.actionId : undefined,
		actionLabel:
			typeof search.actionLabel === "string" ? search.actionLabel : undefined,
		contextLabel:
			typeof search.contextLabel === "string" ? search.contextLabel : undefined,
		sourcePath:
			typeof search.sourcePath === "string" ? search.sourcePath : undefined,
	}),
	component: V2LogPage,
});
