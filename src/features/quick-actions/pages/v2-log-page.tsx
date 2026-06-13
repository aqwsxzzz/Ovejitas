import { useNavigate, useSearch } from "@tanstack/react-router";

import { LogActionCard } from "@/features/quick-actions/log/log-action-card";
import { LogCreateAssetAction } from "@/features/quick-actions/log/log-create-asset-action";
import { LogCreateIndividualAction } from "@/features/quick-actions/log/log-create-individual-action";
import { LogCreateLotAction } from "@/features/quick-actions/log/log-create-lot-action";
import { LogEventAction } from "@/features/quick-actions/log/log-event-action";
import { LogFeedingAction } from "@/features/quick-actions/log/log-feeding-action";
import { LogMortalityAction } from "@/features/quick-actions/log/log-mortality-action";
import { resolveLogAction } from "@/features/quick-actions/log/log-action-config";
import type { LogAction } from "@/features/quick-actions/log/log-action-config";
import { useLogTargetAsset } from "@/features/quick-actions/log/use-log-target-asset";

function resolveReturnPath(sourcePath?: string): string {
	if (!sourcePath || sourcePath.startsWith("/v2/log")) {
		return "/v2/dashboard";
	}
	return sourcePath;
}

interface LogActionRendererProps {
	action: LogAction;
	farmId: string;
	contextAssetId: string | null;
	onDone: () => void;
}

function LogActionRenderer({
	action,
	farmId,
	contextAssetId,
	onDone,
}: LogActionRendererProps) {
	switch (action.kind) {
		case "lot-create":
			return (
				<LogCreateLotAction
					farmId={farmId}
					onDone={onDone}
				/>
			);
		case "individual-create":
			return (
				<LogCreateIndividualAction
					farmId={farmId}
					unitId={contextAssetId}
					onDone={onDone}
				/>
			);
		case "asset-create":
			return (
				<LogCreateAssetAction
					farmId={farmId}
					assetKind={action.assetKind}
					title={action.title}
					submitLabel={action.submitLabel}
					onDone={onDone}
				/>
			);
		case "event":
			return (
				<LogEventAction
					farmId={farmId}
					contextAssetId={contextAssetId}
					eventType={action.eventType}
					title={action.title}
					subtitle={action.subtitle}
					assetKinds={action.assetKinds}
					onDone={onDone}
				/>
			);
		case "feeding":
			return (
				<LogFeedingAction
					farmId={farmId}
					contextAssetId={contextAssetId}
					title={action.title}
					subtitle={action.subtitle}
					onDone={onDone}
				/>
			);
		case "mortality":
			return (
				<LogMortalityAction
					farmId={farmId}
					contextAssetId={contextAssetId}
					title={action.title}
					subtitle={action.subtitle}
					onDone={onDone}
				/>
			);
	}
}

export function V2LogPage() {
	const search = useSearch({ from: "/v2/log" });
	const navigate = useNavigate();
	const { farmId, contextAssetId } = useLogTargetAsset(search.sourcePath);
	const action = resolveLogAction(search.actionId);

	const goBack = () =>
		navigate({ to: resolveReturnPath(search.sourcePath), replace: true });

	return (
		<section className="space-y-4">
			<div className="v2-card p-5 md:p-6">
				<p className="v2-kicker">Accion rapida</p>
				<h2 className="mt-2 text-xl font-semibold">
					{search.actionLabel ?? "Selecciona una accion"}
				</h2>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					{search.contextLabel
						? `Contexto actual: ${search.contextLabel}`
						: "Sin contexto especifico"}
				</p>
			</div>

			{!farmId ? (
				<LogActionCard
					title="Granja"
					subtitle="Necesitas una granja activa para crear datos."
				>
					<p className="text-sm text-(--v2-ink-soft)">
						Selecciona una granja y vuelve a intentarlo.
					</p>
				</LogActionCard>
			) : !action ? (
				<LogActionCard
					title="Pendiente"
					subtitle="Esta accion todavia no tiene formulario."
				>
					<p className="text-sm text-(--v2-ink-soft)">
						Accion: {search.actionId ?? "sin accion"}
					</p>
				</LogActionCard>
			) : (
				<LogActionRenderer
					action={action}
					farmId={farmId}
					contextAssetId={contextAssetId}
					onDone={goBack}
				/>
			)}
		</section>
	);
}
