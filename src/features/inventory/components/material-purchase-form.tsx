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
import type { IMaterialPurchaseCreatePayload } from "@/features/livestock/api/livestock-api";

interface MaterialPurchaseFormProps {
	farmId: string;
	materialAssetId: number;
	isSubmitting: boolean;
	errorMessage: string | null;
	onSubmit: (payload: IMaterialPurchaseCreatePayload) => Promise<void>;
}

export function MaterialPurchaseForm({
	farmId,
	materialAssetId,
	isSubmitting,
	errorMessage,
	onSubmit,
}: MaterialPurchaseFormProps) {
	const [occurredAt, setOccurredAt] = useState(
		new Date().toISOString().slice(0, 16),
	);
	const [quantity, setQuantity] = useState("");
	const [unit, setUnit] = useState<LivestockEventUnit>("kg");
	const [amount, setAmount] = useState("");
	const defaultCurrencyId = useDefaultCurrencyId(farmId);
	const [currencyId, setCurrencyId] = useState<number | undefined>(undefined);
	const selectedCurrencyId = currencyId ?? defaultCurrencyId;
	const [supplier, setSupplier] = useState("");
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
		if (!occurredAt) {
			setLocalError("La fecha y hora son obligatorias.");
			return;
		}

		setLocalError(null);
		await onSubmit({
			material_asset_id: materialAssetId,
			occurred_at: new Date(occurredAt).toISOString(),
			quantity: parsedQuantity,
			unit,
			amount: parsedAmount,
			currency_id: selectedCurrencyId,
			supplier: supplier.trim() || null,
			notes: notes.trim() || null,
			idempotency_key: crypto.randomUUID(),
		});
	};

	return (
		<form
			className="space-y-3"
			onSubmit={(event) => void handleSubmit(event)}
		>
			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="purchase-occurred-at">Fecha y hora</Label>
					<Input
						id="purchase-occurred-at"
						type="datetime-local"
						value={occurredAt}
						onChange={(event) => setOccurredAt(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="purchase-unit">Unidad</Label>
					<Select
						value={unit}
						onValueChange={(value) => setUnit(value as LivestockEventUnit)}
					>
						<SelectTrigger
							id="purchase-unit"
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
					<Label htmlFor="purchase-quantity">Cantidad</Label>
					<Input
						id="purchase-quantity"
						type="number"
						min="0"
						step="0.01"
						value={quantity}
						onChange={(event) => setQuantity(event.target.value)}
						placeholder="100"
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="purchase-amount">Monto</Label>
					<Input
						id="purchase-amount"
						type="number"
						min="0"
						step="0.01"
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
						placeholder="250"
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
					<Label htmlFor="purchase-supplier">Proveedor (opcional)</Label>
					<Input
						id="purchase-supplier"
						value={supplier}
						onChange={(event) => setSupplier(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="purchase-notes">Notas (opcional)</Label>
					<Textarea
						id="purchase-notes"
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
					{isSubmitting ? "Registrando..." : "Registrar compra"}
				</Button>
			</div>
		</form>
	);
}
