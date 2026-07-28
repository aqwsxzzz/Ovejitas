import { useState, type FormEvent } from "react";

import { toDateTimeLocalValue } from "@/lib/datetime";

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
import {
	EventCategorySelectField,
	type CreateEventCategoryInput,
} from "@/features/livestock/components/event-category-select-field";
import type {
	ILivestockEventCategory,
	LivestockEventUnit,
} from "@/features/livestock/types/livestock-types";
import type { IHarvestCreatePayload } from "@/features/livestock/api/livestock-api";
import { findCategoryIdByPool } from "@/features/livestock/utils/product-utils";
import { EVENT_UNITS } from "@/shared/types/unit-types";

interface HarvestFormProps {
	/** Production categories — a category IS the product, and owns its pool. */
	categories: ILivestockEventCategory[];
	/**
	 * The producer's usual product, stored on the asset as a *pool* id. Resolved
	 * back to the product that owns that pool to pre-select the picker.
	 */
	defaultProduceAssetId?: number | null;
	defaultUnit?: LivestockEventUnit;
	isSubmitting: boolean;
	errorMessage: string | null;
	/** Returns whether the harvest was recorded, so the form can reset on success. */
	onSubmit: (payload: IHarvestCreatePayload) => Promise<boolean>;
	onCreateCategory?: (input: CreateEventCategoryInput) => Promise<number>;
	/** Notified after a successful submit (e.g. to collapse the panel). */
	onSuccess?: () => void;
}

export function HarvestForm({
	categories,
	defaultProduceAssetId,
	defaultUnit = "unit",
	isSubmitting,
	errorMessage,
	onSubmit,
	onCreateCategory,
	onSuccess,
}: HarvestFormProps) {
	const [categoryId, setCategoryId] = useState(() =>
		findCategoryIdByPool(categories, defaultProduceAssetId),
	);
	const [quantity, setQuantity] = useState("");
	const [unit, setUnit] = useState<LivestockEventUnit>(defaultUnit);
	const [occurredAt, setOccurredAt] = useState(toDateTimeLocalValue());
	const [notes, setNotes] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const parsedQuantity = Number(quantity);
		if (!categoryId) return setLocalError("Selecciona un producto.");
		if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
			return setLocalError("La cantidad debe ser mayor a 0.");
		}
		setLocalError(null);
		const ok = await onSubmit({
			occurred_at: new Date(occurredAt).toISOString(),
			quantity: parsedQuantity,
			category_id: Number(categoryId),
			unit,
			notes: notes.trim() || null,
		});
		if (ok) {
			// Keep product/unit for fast repeat entries; clear the rest.
			setQuantity("");
			setNotes("");
			setOccurredAt(toDateTimeLocalValue());
			onSuccess?.();
		}
	};

	return (
		<form
			className="space-y-3"
			onSubmit={(event) => void handleSubmit(event)}
		>
			<EventCategorySelectField
				type="production"
				categories={categories}
				value={categoryId}
				onChange={setCategoryId}
				label="Producto"
				newOptionLabel="Nuevo producto"
				onCreateEventCategory={onCreateCategory}
				helperText="El stock se acumula en la canasta de este producto, y desde ahí se vende."
			/>

			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1.5">
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
			</div>

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
				<Label htmlFor="harvest-notes">Notas (opcional)</Label>
				<Textarea
					id="harvest-notes"
					rows={2}
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
				/>
			</div>

			{localError ? (
				<p className="text-sm text-destructive">{localError}</p>
			) : null}
			{errorMessage ? (
				<p className="text-sm text-destructive">{errorMessage}</p>
			) : null}

			<div className="flex justify-end">
				<Button
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Registrando..." : "Registrar recoleccion"}
				</Button>
			</div>
		</form>
	);
}
