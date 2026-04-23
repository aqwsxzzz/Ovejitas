import { Link, createFileRoute } from "@tanstack/react-router";

const extraViews = [
	{
		to: "/v2/production-units",
		title: "Ganado / Unidades de Produccion",
		description: "Operaciones por lote y por individuo.",
	},
	{
		to: "/v2/finance",
		title: "Finanzas",
		description: "Herramientas de flujo de caja y rentabilidad.",
	},
	{
		to: "/v2/inventory",
		title: "Alimento e Inventario",
		description: "Riesgo de stock, dias de autonomia y reposicion.",
	},
	{
		to: "/v2/alerts",
		title: "Alertas",
		description: "Alertas operativas y de rentabilidad.",
	},
	{
		to: "/v2/settings",
		title: "Configuracion",
		description: "Preferencias de cuenta y de la aplicacion.",
	},
];

export const Route = createFileRoute("/v2/more")({
	component: MorePage,
});

function MorePage() {
	return (
		<section className="space-y-4">
			<div className="v2-card p-5 md:p-6">
				<p className="v2-kicker">Navegacion secundaria</p>
				<h2 className="mt-2 text-xl font-semibold">Mas</h2>
				<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
					Este menu agrupa funciones fuera del flujo diario principal.
				</p>
			</div>
			<div className="grid gap-3">
				{extraViews.map((view) => (
					<Link
						key={view.to}
						to={view.to}
						className="v2-card block p-4 transition hover:translate-y-[-1px]"
					>
						<p className="font-medium">{view.title}</p>
						<p className="text-sm text-[color:var(--v2-ink-soft)]">
							{view.description}
						</p>
					</Link>
				))}
			</div>
		</section>
	);
}
