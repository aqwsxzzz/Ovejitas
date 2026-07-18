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

interface CropExpenseFormProps {
	farmId: string;
	categories: Pick<ILivestockEventCategory, "id" | "name">[];
	isSubmitting: boolean;
	errorMessage: string | null;
	onSubmit: (payload: {
		occurred_at: string;
		amount: number;
		currency_id?: number;
		category_id?: number | null;
		notes?: string | null;
	}) => Promise<void>;
}

export function CropExpenseForm({
	farmId,
	categories,
	isSubmitting,
	errorMessage,
	onSubmit,
}: CropExpenseFormProps) {
	const [occurredAt, setOccurredAt] = useState(
		new Date().toISOString().slice(0, 16),
	);
	const [amount, setAmount] = useState("");
	const defaultCurrencyId = useDefaultCurrencyId(farmId);
	const [currencyId, setCurrencyId] = useState<number | undefined>(undefined);
	const selectedCurrencyId = currencyId ?? defaultCurrencyId;
	const [categoryId, setCategoryId] = useState<string>("none");
	const [notes, setNotes] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const parsedAmount = Number(amount);

		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
			setLocalError("El monto debe ser mayor a 0.");
			return;
		}
		if (!occurredAt) {
			setLocalError("La fecha y hora son obligatorias.");
			return;
		}

		setLocalError(null);
		await onSubmit({
			occurred_at: new Date(occurredAt).toISOString(),
			amount: parsedAmount,
			currency_id: selectedCurrencyId,
			category_id: categoryId !== "none" ? Number(categoryId) : null,
			notes: notes.trim() || null,
		});
	};

	return (
		<form
			className="space-y-3"
			onSubmit={(event) => void handleSubmit(event)}
		>
			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="expense-occurred-at">Fecha y hora</Label>
					<Input
						id="expense-occurred-at"
						type="datetime-local"
						value={occurredAt}
						onChange={(event) => setOccurredAt(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="expense-amount">Monto</Label>
					<Input
						id="expense-amount"
						type="number"
						min="0"
						step="0.01"
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
						placeholder="250"
					/>
				</div>
			</div>

			<CurrencySelectField
				farmId={farmId}
				value={selectedCurrencyId}
				onChange={setCurrencyId}
			/>

			{categories.length > 0 ? (
				<div className="space-y-1.5">
					<Label htmlFor="expense-category">Categoria (opcional)</Label>
					<Select
						value={categoryId}
						onValueChange={setCategoryId}
					>
						<SelectTrigger
							id="expense-category"
							className="w-full"
						>
							<SelectValue placeholder="Sin categoria" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">Sin categoria</SelectItem>
							{categories.map((cat) => (
								<SelectItem
									key={cat.id}
									value={String(cat.id)}
								>
									{cat.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			) : null}

			<div className="space-y-1.5">
				<Label htmlFor="expense-notes">Notas (opcional)</Label>
				<Textarea
					id="expense-notes"
					rows={2}
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
				/>
			</div>

			{localError ? <p className="text-sm text-destructive">{localError}</p> : null}
			{errorMessage ? (
				<p className="text-sm text-destructive">{errorMessage}</p>
			) : null}

			<div className="flex justify-end">
				<Button
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Registrando..." : "Registrar gasto"}
				</Button>
			</div>
		</form>
	);
}
