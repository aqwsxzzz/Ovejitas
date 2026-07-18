import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import type { FlockMovementKind } from "./flock-headcount-movement";

interface TargetCountFieldsProps {
	currentCount: number;
	target: string;
	onTargetChange: (value: string) => void;
}

/** Same-day reconciliation: the user states the new total, the delta is derived. */
export function FlockTargetCountFields({
	currentCount,
	target,
	onTargetChange,
}: TargetCountFieldsProps) {
	return (
		<div className="mt-2 grid gap-2 md:grid-cols-2">
			<div className="space-y-1 text-xs">
				<Label className="text-xs">Actual</Label>
				<p className="rounded-lg border bg-muted px-2 py-1.5">{currentCount}</p>
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
					value={target}
					onChange={(event) => onTargetChange(event.target.value)}
				/>
			</div>
		</div>
	);
}

interface BackdatedCountFieldsProps {
	quantity: string;
	movementType: FlockMovementKind;
	onQuantityChange: (value: string) => void;
	onMovementTypeChange: (value: FlockMovementKind) => void;
}

/** Backdated entry: the total as of a past date can't imply a delta, so the user states the movement. */
export function FlockBackdatedCountFields({
	quantity,
	movementType,
	onQuantityChange,
	onMovementTypeChange,
}: BackdatedCountFieldsProps) {
	return (
		<div className="mt-2 grid gap-2 md:grid-cols-2">
			<div className="space-y-1 text-xs">
				<Label className="text-xs">Tipo de movimiento</Label>
				<Select
					value={movementType}
					onValueChange={(value) =>
						onMovementTypeChange(value as FlockMovementKind)
					}
				>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="acquisition">Entrada</SelectItem>
						<SelectItem value="mortality">Mortalidad</SelectItem>
						<SelectItem value="sale">Venta</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-1 text-xs">
				<Label
					htmlFor="headcount-quantity"
					className="text-xs"
				>
					Cantidad
				</Label>
				<Input
					id="headcount-quantity"
					type="number"
					min="1"
					step="1"
					value={quantity}
					onChange={(event) => onQuantityChange(event.target.value)}
					placeholder="Ej: 5"
				/>
			</div>
		</div>
	);
}
