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
	component: LogPage,
});

function LogPage() {
	const search = Route.useSearch();
	const actionLabel = search.actionLabel ?? "Selecciona una accion";
	const contextLabel = search.contextLabel;
	const helperText = contextLabel
		? `Contexto actual: ${contextLabel}`
		: "Sin contexto especifico";

	return (
		<section className="space-y-4">
			<div className="v2-card p-5 md:p-6">
				<p className="v2-kicker">Accion rapida</p>
				<h2 className="mt-2 text-xl font-semibold">{actionLabel}</h2>
				<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
					{helperText}
				</p>
			</div>

			<div className="v2-card p-5">
				<p className="v2-kicker">Primer paso</p>
				<p className="mt-2 text-sm text-[color:var(--v2-ink-soft)]">
					Este flujo ya reconoce desde que vista vienes y que accion quieres
					registrar. El siguiente paso sera reemplazar esta pantalla por el
					formulario especifico de cada accion.
				</p>
				{search.actionId ? (
					<div className="mt-4 rounded-xl border border-[color:var(--v2-border)] bg-white p-4">
						<p className="text-xs uppercase tracking-[0.08em] text-[color:var(--v2-ink-soft)]">
							Accion seleccionada
						</p>
						<p className="mt-1 font-semibold">{search.actionId}</p>
					</div>
				) : null}
			</div>
		</section>
	);
}
