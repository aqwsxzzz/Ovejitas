import { useMemo, useState } from "react";

import type {
	ILivestockIndividual,
	ILivestockEventCategory,
	LivestockAssetKind,
	LivestockAssetMode,
	LivestockEventStatus,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

export interface UnitEventFormData {
	type: LivestockEventType;
	categoryId?: number;
	individualId?: number;
	status: LivestockEventStatus;
	occurredAt: string;
	quantity?: number;
	unit?: string;
	amount?: number;
	currency?: string;
	inventoryQuantityDelta?: number;
	inventoryUnit?: string;
	notes?: string;
}

interface UnitEventFormProps {
	categories: ILivestockEventCategory[];
	individuals: ILivestockIndividual[];
	assetKind: LivestockAssetKind;
	assetMode: LivestockAssetMode;
	onSubmit: (data: UnitEventFormData) => Promise<void>;
	onCancel: () => void;
	isSubmitting: boolean;
	initialValues?: UnitEventFormData;
	submitLabel?: string;
}

function toDateTimeLocalValue(value: Date): string {
	const year = value.getFullYear();
	const month = String(value.getMonth() + 1).padStart(2, "0");
	const day = String(value.getDate()).padStart(2, "0");
	const hours = String(value.getHours()).padStart(2, "0");
	const minutes = String(value.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function UnitEventForm({
	categories,
	individuals,
	assetKind,
	assetMode,
	onSubmit,
	onCancel,
	isSubmitting,
	initialValues,
	submitLabel,
}: UnitEventFormProps) {
	const defaultType: LivestockEventType =
		initialValues?.type ?? categories[0]?.type ?? "production";
	const [type, setType] = useState<LivestockEventType>(defaultType);
	const [categoryId, setCategoryId] = useState<string>(
		initialValues?.categoryId != null ? String(initialValues.categoryId) : "",
	);
	const [individualId, setIndividualId] = useState<string>(
		initialValues?.individualId != null
			? String(initialValues.individualId)
			: "",
	);
	const [status, setStatus] = useState<LivestockEventStatus>(
		initialValues?.status ?? "logged",
	);
	const [occurredAt, setOccurredAt] = useState<string>(
		initialValues?.occurredAt
			? toDateTimeLocalValue(new Date(initialValues.occurredAt))
			: toDateTimeLocalValue(new Date()),
	);
	const [quantity, setQuantity] = useState<string>(
		initialValues?.quantity != null ? String(initialValues.quantity) : "",
	);
	const [unit, setUnit] = useState<string>(initialValues?.unit ?? "unit");
	const [amount, setAmount] = useState<string>(
		initialValues?.amount != null ? String(initialValues.amount) : "",
	);
	const [currency, setCurrency] = useState<string>(
		initialValues?.currency ?? "USD",
	);
	const [inventoryQuantityDelta, setInventoryQuantityDelta] =
		useState<string>("");
	const [inventoryUnit, setInventoryUnit] = useState<string>("unit");
	const [notes, setNotes] = useState<string>(initialValues?.notes ?? "");
	const [error, setError] = useState<string>("");
	const isEditMode = Boolean(initialValues);
	const canSelectIndividual = assetMode === "individual";
	const canUseReproductive = assetKind === "animal";
	const canCreateInventoryPair = !isEditMode && assetMode === "aggregated";

	const availableCategories = useMemo(
		() => categories.filter((category) => category.type === type),
		[categories, type],
	);

	const currentCategoryId = useMemo(() => {
		if (
			availableCategories.some((category) => category.id === Number(categoryId))
		) {
			return categoryId;
		}
		return "";
	}, [availableCategories, categoryId]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");

		if (
			(type === "production" ||
				type === "acquisition" ||
				type === "mortality") &&
			!quantity
		) {
			setError("Cantidad es requerida para eventos de produccion.");
			return;
		}

		if (type === "production" && !unit.trim()) {
			setError("Unidad es requerida para eventos de produccion.");
			return;
		}

		if ((type === "expense" || type === "income") && !amount) {
			setError("Monto es requerido para eventos de ingreso/gasto.");
			return;
		}

		if ((type === "expense" || type === "income") && !currency.trim()) {
			setError("Moneda es requerida para eventos de ingreso/gasto.");
			return;
		}

		if (type === "reproductive" && !canUseReproductive) {
			setError("Eventos reproductivos solo aplican a activos de tipo animal.");
			return;
		}

		if (type === "reproductive" && !canSelectIndividual) {
			setError(
				"Eventos reproductivos requieren un lote en modo individual y un individuo seleccionado.",
			);
			return;
		}

		if (type === "reproductive" && !individualId) {
			setError("Selecciona un individuo para el evento reproductivo.");
			return;
		}

		await onSubmit({
			type,
			categoryId: currentCategoryId ? Number(currentCategoryId) : undefined,
			individualId: individualId ? Number(individualId) : undefined,
			status,
			occurredAt: new Date(occurredAt).toISOString(),
			quantity: quantity ? Number(quantity) : undefined,
			unit: unit.trim() || undefined,
			amount: amount ? Number(amount) : undefined,
			currency: currency.trim().toUpperCase() || undefined,
			inventoryQuantityDelta: inventoryQuantityDelta
				? Number(inventoryQuantityDelta)
				: undefined,
			inventoryUnit: inventoryUnit.trim() || undefined,
			notes: notes.trim() || undefined,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-3"
		>
			<div className="grid gap-3 md:grid-cols-2">
				<label className="space-y-1 text-sm">
					<span className="font-medium">Tipo</span>
					<select
						value={type}
						onChange={(event) =>
							setType(event.target.value as LivestockEventType)
						}
						disabled={isEditMode}
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					>
						<option value="production">Produccion</option>
						<option value="income">Ingreso</option>
						<option value="expense">Gasto</option>
						<option value="observation">Observacion</option>
						<option value="acquisition">Adquisicion</option>
						<option value="mortality">Mortalidad</option>
						{canUseReproductive ? (
							<option value="reproductive">Reproductivo</option>
						) : null}
					</select>
				</label>

				<label className="space-y-1 text-sm">
					<span className="font-medium">Categoria</span>
					<select
						value={currentCategoryId}
						onChange={(event) => setCategoryId(event.target.value)}
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					>
						<option value="">Sin categoria</option>
						{availableCategories.map((category) => (
							<option
								key={category.id}
								value={category.id}
							>
								{category.name}
							</option>
						))}
					</select>
				</label>
			</div>

			{canSelectIndividual ? (
				<label className="space-y-1 text-sm">
					<span className="font-medium">
						Individuo
						{type === "reproductive" ? " (requerido)" : " (opcional)"}
					</span>
					<select
						value={individualId}
						onChange={(event) => setIndividualId(event.target.value)}
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					>
						<option value="">Sin individuo</option>
						{individuals.map((individual) => (
							<option
								key={individual.id}
								value={individual.id}
							>
								{individual.name || individual.tag || `#${individual.id}`}
							</option>
						))}
					</select>
				</label>
			) : null}

			<div className="grid gap-3 md:grid-cols-2">
				<label className="space-y-1 text-sm">
					<span className="font-medium">Fecha y hora</span>
					<input
						type="datetime-local"
						value={occurredAt}
						onChange={(event) => setOccurredAt(event.target.value)}
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					/>
				</label>

				{(type === "production" ||
					type === "observation" ||
					type === "acquisition" ||
					type === "mortality") && (
					<label className="space-y-1 text-sm">
						<span className="font-medium">
							Cantidad {type === "observation" ? "(opcional)" : "(requerida)"}
						</span>
						<input
							type="number"
							value={quantity}
							onChange={(event) => setQuantity(event.target.value)}
							className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
						/>
					</label>
				)}
			</div>

			{(type === "production" || type === "observation") && (
				<label className="space-y-1 text-sm">
					<span className="font-medium">
						Unidad {type === "production" ? "(requerida)" : "(opcional)"}
					</span>
					<input
						type="text"
						value={unit}
						onChange={(event) => setUnit(event.target.value)}
						placeholder="ej: unit, kg, L"
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					/>
				</label>
			)}

			{(type === "income" || type === "expense" || type === "acquisition") && (
				<div className="grid gap-3 md:grid-cols-2">
					<label className="space-y-1 text-sm">
						<span className="font-medium">
							Monto
							{type === "acquisition" ? " (opcional)" : " (requerido)"}
						</span>
						<input
							type="number"
							step="0.01"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
							className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
						/>
					</label>
					<label className="space-y-1 text-sm">
						<span className="font-medium">Moneda (requerida)</span>
						<input
							type="text"
							value={currency}
							onChange={(event) => setCurrency(event.target.value)}
							placeholder="USD"
							className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
						/>
					</label>
				</div>
			)}

			{canCreateInventoryPair && (type === "income" || type === "expense") ? (
				<div className="rounded-lg border border-(--v2-border) bg-white/60 p-3">
					<p className="text-sm font-medium">Impacto en conteo</p>
					<p className="mt-1 text-xs text-(--v2-ink-soft)">
						Opcional. Si esta accion tambien cambia el conteo del lote agrupado,
						se registrara un segundo evento de observacion con el mismo prefijo
						de idempotencia.
					</p>
					<div className="mt-3 grid gap-3 md:grid-cols-2">
						<label className="space-y-1 text-sm">
							<span className="font-medium">Delta de conteo</span>
							<input
								type="number"
								value={inventoryQuantityDelta}
								onChange={(event) =>
									setInventoryQuantityDelta(event.target.value)
								}
								placeholder={type === "expense" ? "ej: 200" : "ej: -20"}
								className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
							/>
						</label>
						<label className="space-y-1 text-sm">
							<span className="font-medium">Unidad del conteo</span>
							<input
								type="text"
								value={inventoryUnit}
								onChange={(event) => setInventoryUnit(event.target.value)}
								placeholder="unit"
								className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
							/>
						</label>
					</div>
				</div>
			) : null}

			<label className="space-y-1 text-sm">
				<span className="font-medium">Notas</span>
				<textarea
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
					rows={3}
					className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					placeholder="Opcional"
				/>
			</label>

			<label className="space-y-1 text-sm">
				<span className="font-medium">Estado</span>
				<select
					value={status}
					onChange={(event) =>
						setStatus(event.target.value as LivestockEventStatus)
					}
					className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
				>
					<option value="logged">Registrado</option>
					<option value="planned">Planificado</option>
				</select>
			</label>

			{error ? <p className="text-sm text-red-600">{error}</p> : null}

			<div className="flex items-center gap-2">
				<button
					type="submit"
					disabled={isSubmitting}
					className="rounded-full bg-(--v2-ink) px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
				>
					{isSubmitting
						? "Guardando..."
						: (submitLabel ??
							(isEditMode ? "Actualizar evento" : "Guardar evento"))}
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="rounded-full border border-(--v2-border) px-4 py-2 text-sm font-semibold"
				>
					Cancelar
				</button>
			</div>
		</form>
	);
}
