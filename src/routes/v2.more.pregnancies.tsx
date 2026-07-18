import { createFileRoute } from "@tanstack/react-router";

import { V2PregnancyRecordsPage } from "@/features/pregnancy/pages/v2-pregnancy-records-page";

export const Route = createFileRoute("/v2/more/pregnancies")({
	component: V2PregnancyRecordsPage,
});
