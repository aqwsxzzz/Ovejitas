import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/production-units")({
	component: ProductionUnitsPage,
});

function ProductionUnitsPage() {
	return (
		<section className="v2-card p-5 md:p-6">
			<p className="v2-kicker">Phase B</p>
			<h2 className="mt-2 text-xl font-semibold">Production Units</h2>
			<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
				This module will host grouped and individual unit workflows.
			</p>
		</section>
	);
}
