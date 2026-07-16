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

import { FlockHeadcountAmountField } from "./flock-headcount-amount-field";
import {
	FlockBackdatedCountFields,
	FlockTargetCountFields,
} from "./flock-headcount-count-fields";
import type { FlockDecreaseKind } from "./flock-headcount-movement";
import type { UseFlockHeadcountAdjustmentResult } from "./use-flock-headcount-adjustment";

interface FlockHeadcountAdjustmentFormProps {
	adjustment: UseFlockHeadcountAdjustmentResult;
}

export function FlockHeadcountAdjustmentForm({
	adjustment,
}: FlockHeadcountAdjustmentFormProps) {
	const { drafts, patchDrafts, isBackdated } = adjustment;
	const showDecreaseMode =
		!isBackdated &&
		adjustment.headcountDeltaPreview != null &&
		adjustment.headcountDeltaPreview < 0;

	return (
		<div className="mt-2 rounded-xl border border-(--v2-border) bg-(--v2-surface) p-2">
			<div className="grid gap-2 md:grid-cols-2">
				<div className="space-y-1 text-xs">
					<Label
						htmlFor="headcount-occurred-on"
						className="text-xs"
					>
						Fecha
					</Label>
					<Input
						id="headcount-occurred-on"
						type="date"
						max={adjustment.todayValue}
						value={drafts.occurredOn}
						onChange={(event) =>
							patchDrafts({ occurredOn: event.target.value })
						}
					/>
				</div>
				{showDecreaseMode ? (
					<div className="space-y-1 text-xs">
						<Label className="text-xs">Tipo de salida</Label>
						<Select
							value={drafts.decreaseMode}
							onValueChange={(value) =>
								patchDrafts({ decreaseMode: value as FlockDecreaseKind })
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
				) : null}
			</div>

			{isBackdated ? (
				<>
					<p className="mt-2 text-xs text-(--v2-ink-soft)">
						Movimiento pasado: ingresa la cantidad del movimiento, no el total
						del lote.
					</p>
					<FlockBackdatedCountFields
						quantity={drafts.quantity}
						movementType={drafts.movementType}
						onQuantityChange={(quantity) => patchDrafts({ quantity })}
						onMovementTypeChange={(movementType) =>
							patchDrafts({ movementType })
						}
					/>
				</>
			) : (
				<FlockTargetCountFields
					currentCount={adjustment.aggregatedActiveCount}
					target={drafts.target}
					onTargetChange={(target) => patchDrafts({ target })}
				/>
			)}

			<FlockHeadcountAmountField
				pendingKind={adjustment.pendingKind}
				amount={drafts.amount}
				onAmountChange={(amount) => patchDrafts({ amount })}
			/>

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
	);
}
