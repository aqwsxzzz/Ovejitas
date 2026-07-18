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
import { EVENT_UNITS } from "@/shared/types/unit-types";
import type { LivestockEventUnit } from "@/features/livestock/types/livestock-types";
import type { IMaterialSaleCreatePayload } from "@/features/livestock/api/livestock-api";

interface MaterialSaleFormProps {
	farmId: string;
	categoryOptions?: Array<{
		id: number;
		name: string;
	}>;
	isSubmitting: boolean;
	errorMessage: string | null;
	onSubmit: (payload: IMaterialSaleCreatePayload) => Promise<void>;
}

export function MaterialSaleForm({
	farmId,
	categoryOptions = [],
	isSubmitting,
	errorMessage,
	onSubmit,
}: MaterialSaleFormProps) {
	const [occurredAt, setOccurredAt] = useState(
		new Date().toISOString().slice(0, 16),
	);
	const [quantity, setQuantity] = useState("");
	const [unit, setUnit] = useState<LivestockEventUnit>("kg");
	const [amount, setAmount] = useState("");
	const defaultCurrencyId = useDefaultCurrencyId(farmId);
	const [currencyId, setCurrencyId] = useState<number | undefined>(undefined);
	const selectedCurrencyId = currencyId ?? defaultCurrencyId;
	const [buyer, setBuyer] = useState("");
	const [categoryId, setCategoryId] = useState<string>("");
	const [notes, setNotes] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const parsedQuantity = Number(quantity);
		const parsedAmount = Number(amount);

		if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
			setLocalError("La cantidad debe ser mayor a 0.");
			return;
		}
		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
			setLocalError("El monto debe ser mayor a 0.");
			return;
		}

		setLocalError(null);
		await onSubmit({
			occurred_at: occurredAt ? new Date(occurredAt).toISOString() : undefined,
			quantity: parsedQuantity,
			unit,
			amount: parsedAmount,
			currency_id: selectedCurrencyId,
			buyer: buyer.trim() || null,
			category_id: categoryId.trim().length > 0 ? Number(categoryId) : null,
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
					<Label htmlFor="sale-occurred-at">Fecha y hora (opcional)</Label>
					<Input
						id="sale-occurred-at"
						type="datetime-local"
						value={occurredAt}
						onChange={(event) => setOccurredAt(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="sale-unit">Unidad</Label>
					<Select
						value={unit}
						onValueChange={(value) => setUnit(value as LivestockEventUnit)}
					>
						<SelectTrigger
							id="sale-unit"
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
				<div className="space-y-1.5">
					<Label htmlFor="sale-quantity">Cantidad</Label>
					<Input
						id="sale-quantity"
						type="number"
						min="0"
						step="0.01"
						value={quantity}
						onChange={(event) => setQuantity(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="sale-amount">Monto</Label>
					<Input
						id="sale-amount"
						type="number"
						min="0"
						step="0.01"
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
					/>
				</div>
				<CurrencySelectField
					farmId={farmId}
					value={selectedCurrencyId}
					onChange={setCurrencyId}
				/>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="sale-buyer">Comprador (opcional)</Label>
					<Input
						id="sale-buyer"
						value={buyer}
						onChange={(event) => setBuyer(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="sale-category">Categoria ingreso (opcional)</Label>
					<Select
						value={categoryId || "none"}
						onValueChange={(value) =>
							setCategoryId(value === "none" ? "" : value)
						}
					>
						<SelectTrigger
							id="sale-category"
							className="w-full"
						>
							<SelectValue placeholder="Selecciona categoria" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">Ninguna</SelectItem>
							{categoryOptions.map((category) => (
								<SelectItem
									key={category.id}
									value={String(category.id)}
								>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="sale-notes">Notas (opcional)</Label>
					<Textarea
						id="sale-notes"
						rows={2}
						value={notes}
						onChange={(event) => setNotes(event.target.value)}
					/>
				</div>
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
					{isSubmitting ? "Registrando..." : "Registrar venta"}
				</Button>
			</div>
		</form>
	);
}
