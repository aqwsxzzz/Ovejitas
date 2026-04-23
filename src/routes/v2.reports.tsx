import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/reports")({
	component: ReportsPage,
});

function ReportsPage() {
	return (
		<section className="v2-card p-5 md:p-6">
			<p className="v2-kicker">Analisis</p>
			<h2 className="mt-2 text-xl font-semibold">Reportes</h2>
			<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
				Aqui se consolidaran los resumenes operativos y de rentabilidad.
			</p>
		</section>
	);
}
