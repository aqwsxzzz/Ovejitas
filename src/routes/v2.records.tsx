import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/records")({
	component: RecordsPage,
});

function RecordsPage() {
	return (
		<section className="v2-card p-5 md:p-6">
			<p className="v2-kicker">Flujo principal</p>
			<h2 className="mt-2 text-xl font-semibold">Registros</h2>
			<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
				En esta vista estaran los registros cronologicos y el historial de
				eventos.
			</p>
		</section>
	);
}
