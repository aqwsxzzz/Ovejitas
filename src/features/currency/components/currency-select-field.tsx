import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetFarmCurrencies } from "@/features/currency/api/currency-queries";
import { rememberLastCurrencyCode } from "@/features/currency/currency-preference";

interface CurrencySelectFieldProps {
	farmId: string;
	value: number | undefined;
	onChange: (currencyId: number) => void;
	label?: string;
	disabled?: boolean;
}

/**
 * Currency picker bound to `currency_id`. Lists the farm's enabled (non-archived)
 * currencies and remembers the chosen ISO code as the sticky default for next
 * time. Controlled: the parent owns `value` and its submit-time fallback.
 */
export function CurrencySelectField({
	farmId,
	value,
	onChange,
	label = "Moneda",
	disabled,
}: CurrencySelectFieldProps) {
	const { data: currencies } = useGetFarmCurrencies({ farmId });
	const active = (currencies ?? []).filter(
		(currency) => currency.archived_at == null,
	);

	const handleChange = (next: string): void => {
		const currencyId = Number(next);
		onChange(currencyId);
		const code = active.find((currency) => currency.id === currencyId)?.code;
		if (code) rememberLastCurrencyCode(farmId, code);
	};

	return (
		<div className="space-y-1">
			<Label>{label}</Label>
			<Select
				value={value != null ? String(value) : undefined}
				onValueChange={handleChange}
				disabled={disabled || active.length === 0}
			>
				<SelectTrigger className="w-full">
					<SelectValue
						placeholder={
							active.length === 0 ? "Sin monedas configuradas" : "Selecciona moneda"
						}
					/>
				</SelectTrigger>
				<SelectContent>
					{active.map((currency) => (
						<SelectItem
							key={currency.id}
							value={String(currency.id)}
						>
							{currency.code}
							{currency.name ? ` — ${currency.name}` : ""}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
