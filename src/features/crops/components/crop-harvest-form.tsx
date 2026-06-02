import { useState } from "react";
import type { FormEvent } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { EVENT_UNITS } from "@/shared/types/unit-types";
import type { LivestockEventUnit } from "@/features/livestock/types/livestock-types";
import type { IHarvestCreatePayload } from "@/features/livestock/api/livestock-api";

interface CropHarvestFormProps {
	isSubmitting: boolean;
	errorMessage: string | null;
	disabled?: boolean;
	disabledReason?: string;
	onSubmit: (payload: IHarvestCreatePayload) => Promise<void>;
}

export function CropHarvestForm({
	isSubmitting,
	errorMessage,
	disabled,
	disabledReason,
	onSubmit,
}: CropHarvestFormProps) {
	const [occurredAt, setOccurredAt] = useState(
		new Date().toISOString().slice(0, 16),
	);
	const [quantity, setQuantity] = useState("");
	const [unit, setUnit] = useState<LivestockEventUnit>("kg");
	const [notes, setNotes] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const parsedQuantity = Number(quantity);

		if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
			setLocalError("La cantidad debe ser mayor a 0.");
			return;
		}
		if (!occurredAt) {
			setLocalError("La fecha y hora son obligatorias.");
			return;
		}

		setLocalError(null);
		await onSubmit({
			occurred_at: new Date(occurredAt).toISOString(),
			quantity: parsedQuantity,
			unit,
			notes: notes.trim() || null,
		});
	};

	if (disabled && disabledReason) {
		return (
			<p className="text-sm text-(--v2-ink-soft)">{disabledReason}</p>
		);
	}

	return (
		<form
			className="space-y-3"
			onSubmit={(event) => void handleSubmit(event)}
		>
			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="harvest-occurred-at">Fecha y hora</Label>
					<Input
						id="harvest-occurred-at"
						type="datetime-local"
						value={occurredAt}
						onChange={(event) => setOccurredAt(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="harvest-unit">Unidad</Label>
					<Select
						value={unit}
						onValueChange={(value) => setUnit(value as LivestockEventUnit)}
					>
						<SelectTrigger
							id="harvest-unit"
							className="w-full"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{EVENT_UNITS.map((eventUnit) => (
								<SelectItem
									key={eventUnit}
									value={eventUnit}
								>
									{eventUnit}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1.5 md:col-span-2">
					<Label htmlFor="harvest-quantity">Cantidad</Label>
					<Input
						id="harvest-quantity"
						type="number"
						min="0"
						step="0.01"
						value={quantity}
						onChange={(event) => setQuantity(event.target.value)}
						placeholder="100"
					/>
				</div>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="harvest-notes">Notas (opcional)</Label>
				<Textarea
					id="harvest-notes"
					rows={2}
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
				/>
			</div>

			{localError ? <p className="text-sm text-red-700">{localError}</p> : null}
			{errorMessage ? (
				<p className="text-sm text-red-700">{errorMessage}</p>
			) : null}

			<div className="flex justify-end">
				<Button
					type="submit"
					disabled={isSubmitting || disabled}
				>
					{isSubmitting ? "Registrando..." : "Registrar cosecha"}
				</Button>
			</div>
		</form>
	);
}
