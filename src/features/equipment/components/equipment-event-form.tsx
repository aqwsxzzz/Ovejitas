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
import { useDefaultCurrencyId } from "@/features/currency/api/currency-queries";
import { CurrencySelectField } from "@/features/currency/components/currency-select-field";
import type { ILivestockEventCategory } from "@/features/livestock/types/livestock-types";
import type { LivestockEventCreatePayload } from "@/features/livestock/api/livestock-api";

type EquipmentEventType = "expense" | "income" | "observation";

interface EquipmentEventFormProps {
	farmId: string;
	categories: ILivestockEventCategory[];
	isSubmitting: boolean;
	errorMessage: string | null;
	onSubmit: (data: LivestockEventCreatePayload) => Promise<void>;
}

const TYPE_LABELS: Record<EquipmentEventType, string> = {
	expense: "Gasto",
	income: "Ingreso",
	observation: "Observación",
};

export function EquipmentEventForm({
	farmId,
	categories,
	isSubmitting,
	errorMessage,
	onSubmit,
}: EquipmentEventFormProps) {
	const [eventType, setEventType] = useState<EquipmentEventType>("expense");
	const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));
	const [amount, setAmount] = useState("");
	const defaultCurrencyId = useDefaultCurrencyId(farmId);
	const [currencyId, setCurrencyId] = useState<number | undefined>(undefined);
	const selectedCurrencyId = currencyId ?? defaultCurrencyId;
	const [categoryId, setCategoryId] = useState<string>("none");
	const [notes, setNotes] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const filteredCategories = categories.filter((c) => c.type === eventType && !c.archived_at);

	const resetFields = () => {
		setAmount("");
		setCategoryId("none");
		setNotes("");
		setLocalError(null);
	};

	const handleTypeChange = (value: EquipmentEventType) => {
		setEventType(value);
		resetFields();
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLocalError(null);

		if (!occurredAt) {
			setLocalError("La fecha y hora son obligatorias.");
			return;
		}

		if (eventType === "expense" || eventType === "income") {
			const parsedAmount = Number(amount);
			if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
				setLocalError("El monto debe ser mayor a 0.");
				return;
			}
			await onSubmit({
				type: eventType,
				occurred_at: new Date(occurredAt).toISOString(),
				amount: parsedAmount,
				currency_id: selectedCurrencyId,
				category_id: categoryId !== "none" ? Number(categoryId) : undefined,
				notes: notes.trim() || undefined,
			});
		} else {
			await onSubmit({
				type: "observation",
				occurred_at: new Date(occurredAt).toISOString(),
				category_id: categoryId !== "none" ? Number(categoryId) : undefined,
				notes: notes.trim() || undefined,
			});
		}

		resetFields();
	};

	return (
		<form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="eq-event-type">Tipo de evento</Label>
					<Select value={eventType} onValueChange={(v) => handleTypeChange(v as EquipmentEventType)}>
						<SelectTrigger id="eq-event-type" className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(TYPE_LABELS) as EquipmentEventType[]).map((t) => (
								<SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="eq-occurred-at">Fecha y hora</Label>
					<Input
						id="eq-occurred-at"
						type="datetime-local"
						value={occurredAt}
						onChange={(e) => setOccurredAt(e.target.value)}
					/>
				</div>

				{(eventType === "expense" || eventType === "income") ? (
					<>
						<div className="space-y-1.5">
							<Label htmlFor="eq-amount">Monto</Label>
							<Input
								id="eq-amount"
								type="number"
								min="0"
								step="0.01"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0.00"
							/>
						</div>
						<CurrencySelectField
							farmId={farmId}
							value={selectedCurrencyId}
							onChange={setCurrencyId}
						/>
					</>
				) : null}
			</div>

			{filteredCategories.length > 0 ? (
				<div className="space-y-1.5">
					<Label htmlFor="eq-category">Categoría (opcional)</Label>
					<Select value={categoryId} onValueChange={setCategoryId}>
						<SelectTrigger id="eq-category" className="w-full">
							<SelectValue placeholder="Sin categoría" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">Sin categoría</SelectItem>
							{filteredCategories.map((cat) => (
								<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			) : null}

			<div className="space-y-1.5">
				<Label htmlFor="eq-notes">Notas (opcional)</Label>
				<Textarea
					id="eq-notes"
					rows={2}
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
				/>
			</div>

			{localError ? <p className="text-sm text-destructive">{localError}</p> : null}
			{errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

			<div className="flex justify-end">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Registrando..." : `Registrar ${TYPE_LABELS[eventType].toLowerCase()}`}
				</Button>
			</div>
		</form>
	);
}
