import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	useArchiveCurrency,
	useUpdateCurrency,
} from "@/features/currency/api/currency-queries";
import type { ICurrency } from "@/features/currency/types/currency-types";

interface CurrencyRowItemProps {
	farmId: string;
	currency: ICurrency;
	disabled?: boolean;
}

/** One enabled currency: frozen ISO code, editable name/symbol, archive action. */
export function CurrencyRowItem({
	farmId,
	currency,
	disabled,
}: CurrencyRowItemProps) {
	const [name, setName] = useState(currency.name);
	const [symbol, setSymbol] = useState(currency.symbol ?? "");
	const updateMutation = useUpdateCurrency({ farmId });
	const archiveMutation = useArchiveCurrency({ farmId });

	const isDirty =
		name.trim() !== currency.name || symbol.trim() !== (currency.symbol ?? "");
	const isBusy = updateMutation.isPending || archiveMutation.isPending;

	const handleSave = (): void => {
		if (!isDirty || !name.trim()) return;
		updateMutation.mutate({
			currencyId: currency.id,
			payload: { name: name.trim(), symbol: symbol.trim() || null },
		});
	};

	return (
		<div className="flex flex-wrap items-end gap-2 rounded-lg border px-3 py-2">
			<span className="min-w-12 self-center font-mono text-sm font-semibold">
				{currency.code}
			</span>
			<div className="flex-1 space-y-1">
				<Input
					aria-label={`Nombre de ${currency.code}`}
					value={name}
					disabled={disabled || isBusy}
					onChange={(event) => setName(event.target.value)}
				/>
			</div>
			<div className="w-20 space-y-1">
				<Input
					aria-label={`Símbolo de ${currency.code}`}
					value={symbol}
					placeholder="$"
					disabled={disabled || isBusy}
					onChange={(event) => setSymbol(event.target.value)}
				/>
			</div>
			<Button
				type="button"
				size="sm"
				variant="outline"
				disabled={disabled || isBusy || !isDirty}
				onClick={handleSave}
			>
				Guardar
			</Button>
			<Button
				type="button"
				size="sm"
				variant="outline"
				className="text-destructive hover:text-destructive"
				disabled={disabled || isBusy}
				onClick={() => archiveMutation.mutate(currency.id)}
			>
				Archivar
			</Button>
		</div>
	);
}
