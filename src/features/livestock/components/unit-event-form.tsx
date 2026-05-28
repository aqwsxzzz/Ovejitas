import { useMemo, useState } from "react";

import type {
	ILivestockIndividual,
	ILivestockEventCategory,
	LivestockAssetKind,
	LivestockAssetMode,
	LivestockEventStatus,
	LivestockEventType,
	LivestockEventUnit,
} from "@/features/livestock/types/livestock-types";
import { EVENT_UNITS_BY_DIMENSION } from "@/shared/types/unit-types";

export interface UnitEventFormData {
	type: LivestockEventType;
	categoryId?: number;
	individualId?: number;
	status: LivestockEventStatus;
	occurredAt: string;
	quantity?: number;
	unit?: LivestockEventUnit;
	amount?: number;
	adjustment?: "increment" | "decrement" | "reset";
	notes?: string;
}

interface CreateEventCategoryInput {
	type: LivestockEventType;
	name: string;
	color?: string;
}

const NEW_CATEGORY_OPTION_VALUE = "__new__";

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
	onCreateEventCategory?: (input: CreateEventCategoryInput) => Promise<number>;
}

function toDateOnlyValue(value: Date): string {
	const year = value.getFullYear();
	const month = String(value.getMonth() + 1).padStart(2, "0");
	const day = String(value.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function toOccurredAtIso(value: string): string {
	return new Date(`${value}T00:00:00`).toISOString();
}

function supportsFinancialAmount(type: LivestockEventType): boolean {
	return type === "income" || type === "expense";
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
	onCreateEventCategory,
}: UnitEventFormProps) {
	const defaultType: LivestockEventType =
		initialValues?.type ??
		(assetKind === "material"
			? "inventory"
			: (categories[0]?.type ?? "production"));
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
			? toDateOnlyValue(new Date(initialValues.occurredAt))
			: toDateOnlyValue(new Date()),
	);
	const [quantity, setQuantity] = useState<string>(
		initialValues?.quantity != null ? String(initialValues.quantity) : "",
	);
	const [unit, setUnit] = useState<LivestockEventUnit>(
		initialValues?.unit ?? "unit",
	);
	const [amount, setAmount] = useState<string>(
		initialValues?.amount != null ? String(initialValues.amount) : "",
	);
	const [adjustment, setAdjustment] = useState<
		"increment" | "decrement" | "reset" | ""
	>(initialValues?.adjustment ?? "");
	const [notes, setNotes] = useState<string>(initialValues?.notes ?? "");
	const [error, setError] = useState<string>("");
	const [newCategoryName, setNewCategoryName] = useState<string>("");
	const [newCategoryColor, setNewCategoryColor] = useState<string>("#f2df77");
	const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
	const isEditMode = Boolean(initialValues);
	const canSelectIndividual = assetMode === "individual";
	const canUseReproductive = assetKind === "animal";
	const canUseInventory = assetKind === "material";
	const allowsFinancialAmount = supportsFinancialAmount(type);

	const availableCategories = useMemo(
		() => categories.filter((category) => category.type === type),
		[categories, type],
	);

	const currentCategoryId = useMemo(() => {
		if (categoryId === NEW_CATEGORY_OPTION_VALUE) {
			return NEW_CATEGORY_OPTION_VALUE;
		}
		if (
			availableCategories.some((category) => category.id === Number(categoryId))
		) {
			return categoryId;
		}
		return "";
	}, [availableCategories, categoryId]);

	const isCreatingNewCategory = currentCategoryId === NEW_CATEGORY_OPTION_VALUE;

	const handleCreateCategory = async () => {
		setError("");

		if (!onCreateEventCategory) {
			setError("No se pudo crear la categoria desde esta vista.");
			return;
		}

		if (!newCategoryName.trim()) {
			setError("Escribe un nombre para la nueva categoria.");
			return;
		}

		setIsCreatingCategory(true);
		try {
			const createdCategoryId = await onCreateEventCategory({
				type,
				name: newCategoryName.trim(),
				color: newCategoryColor,
			});
			setCategoryId(String(createdCategoryId));
			setNewCategoryName("");
		} finally {
			setIsCreatingCategory(false);
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");

		if (type === "inventory" && !canUseInventory) {
			setError(
				"Eventos de inventario solo aplican a activos de tipo material.",
			);
			return;
		}

		if ((type === "production" || type === "inventory") && !quantity) {
			setError("Cantidad es requerida para este tipo de evento.");
			return;
		}

		if (type === "inventory" && !unit) {
			setError("Unidad es requerida para eventos de inventario.");
			return;
		}

		if (type === "inventory" && !adjustment) {
			setError("Tipo de ajuste es requerido para eventos de inventario.");
			return;
		}

		if (type === "production" && !unit) {
			setError("Unidad es requerida para eventos de produccion.");
			return;
		}

		if (
			type === "production" &&
			(!currentCategoryId || currentCategoryId === NEW_CATEGORY_OPTION_VALUE)
		) {
			setError(
				"Categoria es requerida para eventos de produccion. Crea o selecciona una para nombrar el producto.",
			);
			return;
		}

		if (currentCategoryId === NEW_CATEGORY_OPTION_VALUE) {
			setError("Completa la creacion de la nueva categoria antes de guardar.");
			return;
		}

		if ((type === "expense" || type === "income") && !amount) {
			setError("Monto es requerido para eventos de ingreso/gasto.");
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
			occurredAt: toOccurredAtIso(occurredAt),
			quantity: quantity ? Number(quantity) : undefined,
			unit,
			amount: allowsFinancialAmount && amount ? Number(amount) : undefined,
			adjustment:
				type === "inventory" && adjustment
					? (adjustment as "increment" | "decrement" | "reset")
					: undefined,
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
						onChange={(event) => {
							const nextType = event.target.value as LivestockEventType;
							setType(nextType);
							setCategoryId("");
							if (!supportsFinancialAmount(nextType)) {
								setAmount("");
							}
						}}
						disabled={isEditMode}
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					>
						<option value="production">Produccion</option>
						<option value="income">Ingreso</option>
						<option value="expense">Gasto</option>
						<option value="observation">Observacion</option>
						{canUseReproductive ? (
							<option value="reproductive">Reproductivo</option>
						) : null}
						{canUseInventory ? (
							<option value="inventory">Inventario</option>
						) : null}
					</select>
					<span className="font-medium">
						Categoria {type === "production" ? "(requerida)" : "(opcional)"}
					</span>
					<select
						value={currentCategoryId}
						onChange={(event) => setCategoryId(event.target.value)}
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					>
						{type === "production" ? (
							<option
								value=""
								disabled
							>
								Selecciona categoria
							</option>
						) : (
							<option value="">Sin categoria</option>
						)}
						{availableCategories.map((category) => (
							<option
								key={category.id}
								value={category.id}
							>
								{category.name}
							</option>
						))}
						<option value={NEW_CATEGORY_OPTION_VALUE}>Nueva categoria</option>
					</select>
					{type === "production" ? (
						<p className="text-xs text-(--v2-ink-soft)">
							Usa la categoria como nombre del producto (ej: huevos, leche,
							lana).
						</p>
					) : null}
					{isCreatingNewCategory ? (
						<div className="mt-2 grid gap-2 rounded-lg border border-(--v2-border) bg-white/60 p-2">
							<label className="space-y-1 text-xs">
								<span className="font-medium">Nombre de categoria</span>
								<input
									type="text"
									value={newCategoryName}
									onChange={(event) => setNewCategoryName(event.target.value)}
									placeholder="Ej: Huevos"
									className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
								/>
							</label>
							<label className="space-y-1 text-xs">
								<span className="font-medium">Color</span>
								<input
									type="color"
									value={newCategoryColor}
									onChange={(event) => setNewCategoryColor(event.target.value)}
									className="h-10 w-full rounded-lg border border-(--v2-border) px-1 py-1"
								/>
							</label>
							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => void handleCreateCategory()}
									disabled={isCreatingCategory || isSubmitting}
									className="rounded-full border border-(--v2-ink) px-3 py-1 text-xs font-semibold disabled:opacity-60"
								>
									{isCreatingCategory ? "Creando..." : "Crear categoria"}
								</button>
							</div>
						</div>
					) : null}
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
								{individual.tag || individual.name || `#${individual.id}`}
							</option>
						))}
					</select>
				</label>
			) : null}

			<div className="grid gap-3 md:grid-cols-2">
				<label className="space-y-1 text-sm">
					<span className="font-medium">Fecha</span>
					<input
						type="date"
						value={occurredAt}
						onChange={(event) => setOccurredAt(event.target.value)}
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					/>
				</label>

				{(type === "production" ||
					type === "observation" ||
					type === "inventory") && (
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

			{(type === "production" ||
				type === "observation" ||
				type === "inventory") && (
				<label className="space-y-1 text-sm">
					<span className="font-medium">
						Unidad
						{type === "production" ? " (requerida)" : " (opcional)"}
					</span>
					<select
						value={unit}
						onChange={(event) =>
							setUnit(event.target.value as LivestockEventUnit)
						}
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					>
						{EVENT_UNITS_BY_DIMENSION.mass.map((unitValue) => (
							<option
								key={unitValue}
								value={unitValue}
							>
								Masa: {unitValue}
							</option>
						))}
						{EVENT_UNITS_BY_DIMENSION.volume.map((unitValue) => (
							<option
								key={unitValue}
								value={unitValue}
							>
								Volumen: {unitValue}
							</option>
						))}
						{EVENT_UNITS_BY_DIMENSION.count.map((unitValue) => (
							<option
								key={unitValue}
								value={unitValue}
							>
								Conteo: {unitValue}
							</option>
						))}
					</select>
				</label>
			)}

			{type === "inventory" && (
				<label className="space-y-1 text-sm">
					<span className="font-medium">Tipo de ajuste (requerido)</span>
					<select
						value={adjustment}
						onChange={(event) =>
							setAdjustment(
								event.target.value as "increment" | "decrement" | "reset" | "",
							)
						}
						className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
					>
						<option value="">Selecciona tipo de ajuste</option>
						<option value="increment">Incremento (agregar stock)</option>
						<option value="decrement">Decremento (restar stock)</option>
						<option value="reset">Resetear (establecer cantidad total)</option>
					</select>
				</label>
			)}

			{allowsFinancialAmount ? (
				<div className="grid gap-3 md:grid-cols-2">
					<label className="space-y-1 text-sm">
						<span className="font-medium">Monto (requerido)</span>
						<input
							type="number"
							step="0.01"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
							className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
						/>
					</label>
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
