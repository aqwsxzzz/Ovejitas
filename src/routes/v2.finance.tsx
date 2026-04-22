import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/finance")({
	component: FinancePage,
});

function FinancePage() {
	return (
		<section className="v2-card p-5 md:p-6">
			<p className="v2-kicker">Phase D</p>
			<h2 className="mt-2 text-xl font-semibold">Finance</h2>
			<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
				Macro cash flow and micro profitability entry points land in this
				module.
			</p>
		</section>
	);
}
