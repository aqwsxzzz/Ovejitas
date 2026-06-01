import { Loader2 } from "lucide-react";

import { useFlockHeadcountAdjustment } from "./use-flock-headcount-adjustment";

interface FlockHeadcountAdjustmentCardProps {
	farmId: string;
	unitId: string;
}

export function FlockHeadcountAdjustmentCard({
	farmId,
	unitId,
}: FlockHeadcountAdjustmentCardProps) {
	const adjustment = useFlockHeadcountAdjustment({ farmId, unitId });

	return (
		<div className="v2-card flex-1 p-3">
			<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
				<div className="min-w-0">
					<p className="text-[10px] uppercase tracking-[0.08em] text-(--v2-ink-soft)">
						Existencia actual
					</p>
					<p className="mt-0.5 text-2xl font-semibold leading-none">
						{adjustment.isAggregatedHeadcountPending ? (
							<Loader2 className="h-6 w-6 animate-spin" />
						) : (
							String(adjustment.aggregatedActiveCount)
						)}
					</p>
				</div>
				{!adjustment.isAdjustingHeadcount ? (
					<div className="flex h-full items-center border-l border-(--v2-border) pl-3">
						<button
							type="button"
							onClick={adjustment.openHeadcountAdjustment}
							className="h-fit whitespace-nowrap rounded-full border border-(--v2-ink) px-3 py-1 text-xs font-semibold"
						>
							Ajustar
						</button>
					</div>
				) : null}
			</div>

			{adjustment.isAdjustingHeadcount ? (
				<div className="mt-2 rounded-xl border border-(--v2-border) bg-white p-2">
					<div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
						<label className="space-y-1 text-xs">
							<span className="font-medium">Actual</span>
							<p className="rounded-lg border border-(--v2-border) bg-gray-50 px-2 py-1.5">
								{adjustment.aggregatedActiveCount}
							</p>
						</label>
						<label className="space-y-1 text-xs">
							<span className="font-medium">Nuevo</span>
							<input
								type="number"
								min="0"
								step="1"
								value={adjustment.headcountDraft}
								onChange={(event) =>
									adjustment.setHeadcountDraft(event.target.value)
								}
								className="w-full rounded-lg border border-(--v2-border) px-2 py-1.5"
							/>
						</label>
					</div>

					{adjustment.headcountDeltaPreview != null &&
					adjustment.headcountDeltaPreview > 0 ? (
						<div className="mt-2 grid gap-2 md:grid-cols-2">
							<label className="space-y-1 text-xs">
								<span className="font-medium">Costo (opcional)</span>
								<input
									type="number"
									min="0"
									step="0.01"
									value={adjustment.headcountAmountDraft}
									onChange={(event) =>
										adjustment.setHeadcountAmountDraft(event.target.value)
									}
									placeholder="Ej: 125.50"
									className="w-full rounded-lg border border-(--v2-border) px-2 py-1.5"
								/>
							</label>
						</div>
					) : null}

					{adjustment.headcountDeltaPreview != null &&
					adjustment.headcountDeltaPreview < 0 ? (
						<div className="mt-2 grid gap-2 md:grid-cols-2">
							<label className="space-y-1 text-xs">
								<span className="font-medium">Tipo de salida</span>
								<select
									value={adjustment.headcountDecreaseMode}
									onChange={(event) =>
										adjustment.setHeadcountDecreaseMode(
											event.target.value as "mortality" | "sale",
										)
									}
									className="w-full rounded-lg border border-(--v2-border) px-2 py-1.5"
								>
									<option value="mortality">Mortalidad</option>
									<option value="sale">Venta</option>
								</select>
							</label>
							{adjustment.headcountDecreaseMode === "sale" ? (
								<label className="space-y-1 text-xs">
									<span className="font-medium">Ingreso (requerido)</span>
									<input
										type="number"
										min="0"
										step="0.01"
										value={adjustment.headcountAmountDraft}
										onChange={(event) =>
											adjustment.setHeadcountAmountDraft(event.target.value)
										}
										placeholder="Ej: 250.00"
										className="w-full rounded-lg border border-(--v2-border) px-2 py-1.5"
									/>
								</label>
							) : null}
						</div>
					) : null}

					{adjustment.headcountError ? (
						<p className="mt-2 text-xs text-red-600">
							{adjustment.headcountError}
						</p>
					) : null}
					<div className="mt-3 flex items-center gap-2 md:justify-end">
						<button
							type="button"
							onClick={() => void adjustment.handleApplyHeadcountAdjustment()}
							disabled={adjustment.isApplying}
							className="rounded-full bg-(--v2-ink) px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
						>
							{adjustment.isApplying ? "Aplicando..." : "Aplicar"}
						</button>
						<button
							type="button"
							onClick={adjustment.closeHeadcountAdjustment}
							className="rounded-full border border-(--v2-border) px-3 py-1.5 text-xs font-semibold"
						>
							Cancelar
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}
