import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={adjustment.openHeadcountAdjustment}
						>
							Ajustar
						</Button>
					</div>
				) : null}
			</div>

			{adjustment.isAdjustingHeadcount ? (
				<div className="mt-2 rounded-xl border border-(--v2-border) bg-white p-2">
					<div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
						<div className="space-y-1 text-xs">
							<Label className="text-xs">Actual</Label>
							<p className="rounded-lg border bg-muted px-2 py-1.5">
								{adjustment.aggregatedActiveCount}
							</p>
						</div>
						<div className="space-y-1 text-xs">
							<Label
								htmlFor="headcount-new"
								className="text-xs"
							>
								Nuevo
							</Label>
							<Input
								id="headcount-new"
								type="number"
								min="0"
								step="1"
								value={adjustment.headcountDraft}
								onChange={(event) =>
									adjustment.setHeadcountDraft(event.target.value)
								}
							/>
						</div>
					</div>

					{adjustment.headcountDeltaPreview != null &&
					adjustment.headcountDeltaPreview > 0 ? (
						<div className="mt-2 grid gap-2 md:grid-cols-2">
							<div className="space-y-1 text-xs">
								<Label
									htmlFor="headcount-cost"
									className="text-xs"
								>
									Costo (opcional)
								</Label>
								<Input
									id="headcount-cost"
									type="number"
									min="0"
									step="0.01"
									value={adjustment.headcountAmountDraft}
									onChange={(event) =>
										adjustment.setHeadcountAmountDraft(event.target.value)
									}
									placeholder="Ej: 125.50"
								/>
							</div>
						</div>
					) : null}

					{adjustment.headcountDeltaPreview != null &&
					adjustment.headcountDeltaPreview < 0 ? (
						<div className="mt-2 grid gap-2 md:grid-cols-2">
							<div className="space-y-1 text-xs">
								<Label className="text-xs">Tipo de salida</Label>
								<Select
									value={adjustment.headcountDecreaseMode}
									onValueChange={(value) =>
										adjustment.setHeadcountDecreaseMode(
											value as "mortality" | "sale",
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="mortality">Mortalidad</SelectItem>
										<SelectItem value="sale">Venta</SelectItem>
									</SelectContent>
								</Select>
							</div>
							{adjustment.headcountDecreaseMode === "sale" ? (
								<div className="space-y-1 text-xs">
									<Label
										htmlFor="headcount-income"
										className="text-xs"
									>
										Ingreso (requerido)
									</Label>
									<Input
										id="headcount-income"
										type="number"
										min="0"
										step="0.01"
										value={adjustment.headcountAmountDraft}
										onChange={(event) =>
											adjustment.setHeadcountAmountDraft(event.target.value)
										}
										placeholder="Ej: 250.00"
									/>
								</div>
							) : null}
						</div>
					) : null}

					{adjustment.headcountError ? (
						<p className="mt-2 text-xs text-destructive">
							{adjustment.headcountError}
						</p>
					) : null}
					<div className="mt-3 flex items-center gap-2 md:justify-end">
						<Button
							type="button"
							variant="default"
							size="sm"
							onClick={() => void adjustment.handleApplyHeadcountAdjustment()}
							disabled={adjustment.isApplying}
						>
							{adjustment.isApplying ? "Aplicando..." : "Aplicar"}
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={adjustment.closeHeadcountAdjustment}
						>
							Cancelar
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
