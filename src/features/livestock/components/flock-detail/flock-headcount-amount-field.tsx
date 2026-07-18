import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelectField } from "@/features/currency/components/currency-select-field";

import type { FlockMovementKind } from "./flock-headcount-movement";

interface FlockHeadcountAmountFieldProps {
	pendingKind: FlockMovementKind | null;
	amount: string;
	onAmountChange: (value: string) => void;
	farmId: string;
	currencyId: number | undefined;
	onCurrencyChange: (currencyId: number) => void;
}

/** Money field for the movement the drafts currently resolve to; mortality has none. */
export function FlockHeadcountAmountField({
	pendingKind,
	amount,
	onAmountChange,
	farmId,
	currencyId,
	onCurrencyChange,
}: FlockHeadcountAmountFieldProps) {
	if (pendingKind == null || pendingKind === "mortality") return null;

	const isSale = pendingKind === "sale";

	return (
		<div className="mt-2 grid gap-2 md:grid-cols-2">
			<div className="space-y-1 text-xs">
				<Label
					htmlFor="headcount-amount"
					className="text-xs"
				>
					{isSale ? "Ingreso (requerido)" : "Costo (opcional)"}
				</Label>
				<Input
					id="headcount-amount"
					type="number"
					min="0"
					step="0.01"
					value={amount}
					onChange={(event) => onAmountChange(event.target.value)}
					placeholder={isSale ? "Ej: 250.00" : "Ej: 125.50"}
				/>
			</div>
			<CurrencySelectField
				farmId={farmId}
				value={currencyId}
				onChange={onCurrencyChange}
			/>
		</div>
	);
}
