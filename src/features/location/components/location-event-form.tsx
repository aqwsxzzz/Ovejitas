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

type LocationEventType = "expense" | "observation";

interface LocationEventFormProps {
	farmId: string;
	categories: ILivestockEventCategory[];
	isSubmitting: boolean;
	errorMessage: string | null;
	onSubmit: (data: LivestockEventCreatePayload) => Promise<void>;
}

const TYPE_LABELS: Record<LocationEventType, string> = {
	expense: "Gasto",
	observation: "Observación",
};

export function LocationEventForm({
	farmId,
	categories,
	isSubmitting,
	errorMessage,
	onSubmit,
}: LocationEventFormProps) {
	const [eventType, setEventType] = useState<LocationEventType>("expense");
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

	const handleTypeChange = (value: LocationEventType) => {
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

		if (eventType === "expense") {
			const parsedAmount = Number(amount);
			if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
				setLocalError("El monto debe ser mayor a 0.");
				return;
			}
			await onSubmit({
				type: "expense",
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
					<Label htmlFor="loc-event-type">Tipo de evento</Label>
					<Select value={eventType} onValueChange={(v) => handleTypeChange(v as LocationEventType)}>
						<SelectTrigger id="loc-event-type" className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(TYPE_LABELS) as LocationEventType[]).map((t) => (
								<SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="loc-occurred-at">Fecha y hora</Label>
					<Input
						id="loc-occurred-at"
						type="datetime-local"
						value={occurredAt}
						onChange={(e) => setOccurredAt(e.target.value)}
					/>
				</div>

				{eventType === "expense" ? (
					<>
						<div className="space-y-1.5">
							<Label htmlFor="loc-amount">Monto</Label>
							<Input
								id="loc-amount"
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
					<Label htmlFor="loc-category">Categoría (opcional)</Label>
					<Select value={categoryId} onValueChange={setCategoryId}>
						<SelectTrigger id="loc-category" className="w-full">
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
				<Label htmlFor="loc-notes">Notas (opcional)</Label>
				<Textarea
					id="loc-notes"
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
