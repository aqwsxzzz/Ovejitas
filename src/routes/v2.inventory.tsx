import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/inventory")({
	component: InventoryPage,
});

function InventoryPage() {
	return (
		<section className="v2-card p-5 md:p-6">
			<p className="v2-kicker">Phase C</p>
			<h2 className="mt-2 text-xl font-semibold">Inventory and Autonomy</h2>
			<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
				Stock autonomy calculations and adjustment flows will be connected here.
			</p>
		</section>
	);
}
