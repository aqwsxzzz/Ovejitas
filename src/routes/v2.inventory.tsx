import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/features/inventory/pages/inventory-page";

export const Route = createFileRoute("/v2/inventory")({
	component: InventoryPage,
});
