import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

import {
	EventCategorySelectField,
	type CreateEventCategoryInput,
} from "./event-category-select-field";

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

/** Radix Select forbids empty-string item values; use a sentinel for "none". */
const NONE = "__none__";

interface UnitEventFormProps {
	categories: ILivestockEventCategory[];
	individuals: ILivestockIndividual[];
	assetKind: LivestockAssetKind;
	assetMode: LivestockAssetMode | null;
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

		if (type === "production" && !currentCategoryId) {
			setError(
				"Categoria es requerida para eventos de produccion. Crea o selecciona una para nombrar el producto.",
			);
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

	const showQuantity =
		type === "production" || type === "observation" || type === "inventory";

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-3"
		>
			<div className="space-y-1">
				<Label>Tipo</Label>
				<Select
					value={type}
					onValueChange={(value) => {
						const nextType = value as LivestockEventType;
						setType(nextType);
						setCategoryId("");
						if (!supportsFinancialAmount(nextType)) {
							setAmount("");
						}
					}}
					disabled={isEditMode}
				>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="production">Produccion</SelectItem>
						<SelectItem value="income">Ingreso</SelectItem>
						<SelectItem value="expense">Gasto</SelectItem>
						<SelectItem value="observation">Observacion</SelectItem>
						{canUseReproductive ? (
							<SelectItem value="reproductive">Reproductivo</SelectItem>
						) : null}
						{canUseInventory ? (
							<SelectItem value="inventory">Inventario</SelectItem>
						) : null}
					</SelectContent>
				</Select>
			</div>

			<EventCategorySelectField
				type={type}
				categories={categories}
				value={currentCategoryId}
				onChange={setCategoryId}
				label={`Categoria ${type === "production" ? "(requerida)" : "(opcional)"}`}
				placeholder={
					type === "production" ? "Selecciona categoria" : "Sin categoria"
				}
				allowNone={type !== "production"}
				newOptionLabel="Nueva categoria"
				onCreateEventCategory={onCreateEventCategory}
				helperText={
					type === "production"
						? "Usa la categoria como nombre del producto (ej: huevos, leche, lana)."
						: undefined
				}
			/>

			{canSelectIndividual ? (
				<div className="space-y-1">
					<Label>
						Individuo
						{type === "reproductive" ? " (requerido)" : " (opcional)"}
					</Label>
					<Select
						value={individualId || undefined}
						onValueChange={(value) =>
							setIndividualId(value === NONE ? "" : value)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Sin individuo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={NONE}>Sin individuo</SelectItem>
							{individuals.map((individual) => (
								<SelectItem
									key={individual.id}
									value={String(individual.id)}
								>
									{individual.tag || individual.name || `#${individual.id}`}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			) : null}

			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1">
					<Label htmlFor="event-date">Fecha</Label>
					<Input
						id="event-date"
						type="date"
						value={occurredAt}
						onChange={(event) => setOccurredAt(event.target.value)}
					/>
				</div>

				{showQuantity && (
					<div className="space-y-1">
						<Label htmlFor="event-quantity">
							Cantidad {type === "observation" ? "(opcional)" : "(requerida)"}
						</Label>
						<Input
							id="event-quantity"
							type="number"
							value={quantity}
							onChange={(event) => setQuantity(event.target.value)}
						/>
					</div>
				)}
			</div>

			{showQuantity && (
				<div className="space-y-1">
					<Label>
						Unidad
						{type === "production" ? " (requerida)" : " (opcional)"}
					</Label>
					<Select
						value={unit}
						onValueChange={(value) => setUnit(value as LivestockEventUnit)}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Masa</SelectLabel>
								{EVENT_UNITS_BY_DIMENSION.mass.map((unitValue) => (
									<SelectItem
										key={unitValue}
										value={unitValue}
									>
										{unitValue}
									</SelectItem>
								))}
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Volumen</SelectLabel>
								{EVENT_UNITS_BY_DIMENSION.volume.map((unitValue) => (
									<SelectItem
										key={unitValue}
										value={unitValue}
									>
										{unitValue}
									</SelectItem>
								))}
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Conteo</SelectLabel>
								{EVENT_UNITS_BY_DIMENSION.count.map((unitValue) => (
									<SelectItem
										key={unitValue}
										value={unitValue}
									>
										{unitValue}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			)}

			{type === "inventory" && (
				<div className="space-y-1">
					<Label>Tipo de ajuste (requerido)</Label>
					<Select
						value={adjustment || undefined}
						onValueChange={(value) =>
							setAdjustment(value as "increment" | "decrement" | "reset")
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Selecciona tipo de ajuste" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="increment">
								Incremento (agregar stock)
							</SelectItem>
							<SelectItem value="decrement">
								Decremento (restar stock)
							</SelectItem>
							<SelectItem value="reset">
								Resetear (establecer cantidad total)
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}

			{allowsFinancialAmount ? (
				<div className="grid gap-3 md:grid-cols-2">
					<div className="space-y-1">
						<Label htmlFor="event-amount">Monto (requerido)</Label>
						<Input
							id="event-amount"
							type="number"
							step="0.01"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
						/>
					</div>
				</div>
			) : null}

			<div className="space-y-1">
				<Label htmlFor="event-notes">Notas</Label>
				<Textarea
					id="event-notes"
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
					rows={3}
					placeholder="Opcional"
				/>
			</div>

			<div className="space-y-1">
				<Label>Estado</Label>
				<Select
					value={status}
					onValueChange={(value) =>
						setStatus(value as LivestockEventStatus)
					}
				>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="logged">Registrado</SelectItem>
						<SelectItem value="planned">Planificado</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{error ? <p className="text-sm text-destructive">{error}</p> : null}

			<div className="flex items-center gap-2">
				<Button
					type="submit"
					variant="default"
					disabled={isSubmitting}
				>
					{isSubmitting
						? "Guardando..."
						: (submitLabel ??
							(isEditMode ? "Actualizar evento" : "Guardar evento"))}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
				>
					Cancelar
				</Button>
			</div>
		</form>
	);
}
