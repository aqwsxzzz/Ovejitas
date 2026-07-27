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
import { EVENT_UNITS } from "@/shared/types/unit-types";

interface HarvestFormProps {
	/** Destination pools — MUST be `kind=produce` assets. */
	produceAssets: Array<{ id: number; name: string }>;
	categories: ILivestockEventCategory[];
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
	produceAssets,
	categories,
	defaultProduceAssetId,
	defaultUnit = "unit",
	isSubmitting,
	errorMessage,
	onSubmit,
	onCreateCategory,
	onSuccess,
}: HarvestFormProps) {
	const [produceAssetId, setProduceAssetId] = useState(
		defaultProduceAssetId != null ? String(defaultProduceAssetId) : "",
	);
	const [categoryId, setCategoryId] = useState("");
	const [quantity, setQuantity] = useState("");
	const [unit, setUnit] = useState<LivestockEventUnit>(defaultUnit);
	const [occurredAt, setOccurredAt] = useState(toDateTimeLocalValue());
	const [notes, setNotes] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const parsedQuantity = Number(quantity);
		if (!produceAssetId) return setLocalError("Selecciona un producto destino.");
		if (!categoryId) return setLocalError("Selecciona un producto.");
		if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
			return setLocalError("La cantidad debe ser mayor a 0.");
		}
		setLocalError(null);
		const ok = await onSubmit({
			occurred_at: new Date(occurredAt).toISOString(),
			quantity: parsedQuantity,
			unit,
			produce_asset_id: Number(produceAssetId),
			category_id: Number(categoryId),
			notes: notes.trim() || null,
		});
		if (ok) {
			// Keep basket/category/unit for fast repeat entries; clear the rest.
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
			<div className="space-y-1.5">
				<Label htmlFor="harvest-basket">Producto destino</Label>
				<Select
					value={produceAssetId || undefined}
					onValueChange={setProduceAssetId}
				>
					<SelectTrigger
						id="harvest-basket"
						className="w-full"
					>
						<SelectValue placeholder="Selecciona un producto" />
					</SelectTrigger>
					<SelectContent>
						{produceAssets.map((produce) => (
							<SelectItem
								key={produce.id}
								value={String(produce.id)}
							>
								{produce.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<p className="text-xs text-(--v2-ink-soft)">
					La canasta donde se acumula el stock y desde donde se vende.
				</p>
			</div>

			<EventCategorySelectField
				type="production"
				categories={categories}
				value={categoryId}
				onChange={setCategoryId}
				label="Categoría de producción"
				newOptionLabel="Nueva categoría"
				onCreateEventCategory={onCreateCategory}
				helperText="Clasifica la producción para las estadísticas de productividad."
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
					{isSubmitting ? "Registrando..." : "Registrar cosecha"}
				</Button>
			</div>
		</form>
	);
}
