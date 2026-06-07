import { LogActionLink } from "@/features/quick-actions/components/log-action-link";

const DASHBOARD_ACTIONS = [
	{ actionId: "registrar-produccion", label: "Registrar produccion" },
	{ actionId: "registrar-alimentacion", label: "Registrar alimentacion" },
	{ actionId: "nuevo-gasto", label: "Nuevo gasto" },
	{ actionId: "nuevo-ingreso", label: "Nuevo ingreso" },
	{ actionId: "nuevo-lote", label: "Nuevo lote" },
] as const;

export function DashboardQuickActions({ sourcePath }: { sourcePath: string }) {
	return (
		<article className="v2-card p-4">
			<p className="v2-kicker mb-3">Registrar</p>
			<div className="flex flex-wrap gap-2">
				{DASHBOARD_ACTIONS.map((action) => (
					<LogActionLink
						key={action.actionId}
						actionId={action.actionId}
						label={action.label}
						sourcePath={sourcePath}
						variant="secondary"
					/>
				))}
			</div>
		</article>
	);
}
