import { createFileRoute } from "@tanstack/react-router";

import { V2FinancePage } from "@/features/finance/pages/v2-finance-page";

export const Route = createFileRoute("/v2/finance")({
	component: V2FinancePage,
});
