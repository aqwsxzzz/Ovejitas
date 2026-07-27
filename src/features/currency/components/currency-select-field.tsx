import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useCreateCurrency,
	useGetFarmCurrencies,
} from "@/features/currency/api/currency-queries";
import { rememberLastCurrencyCode } from "@/features/currency/currency-preference";
import { CURRENCY_OPTIONS } from "@/features/farm/constants/currency-options";

interface CurrencySelectFieldProps {
	farmId: string;
	value: number | undefined;
	onChange: (currencyId: number) => void;
	label?: string;
	disabled?: boolean;
}

/**
 * Currency picker bound to `currency_id`. Lists the farm's enabled currencies and
 * offers an inline "add currency" row so a farmer can enable a new ISO currency
 * mid-form (e.g. adding UYU while logging a sale) without leaving for settings.
 */
export function CurrencySelectField({
	farmId,
	value,
	onChange,
	label = "Moneda",
	disabled,
}: CurrencySelectFieldProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [newCode, setNewCode] = useState("");

	const { data: currencies } = useGetFarmCurrencies({ farmId });
	const createMutation = useCreateCurrency({ farmId });
	const active = (currencies ?? []).filter(
		(currency) => currency.archived_at == null,
	);
	const enabledCodes = active.map((currency) => currency.code);
	const addableOptions = CURRENCY_OPTIONS.filter(
		(option) => !enabledCodes.includes(option.code),
	);

	const options = useMemo<ComboboxOption[]>(
		() =>
			active.map((currency) => ({
				value: String(currency.id),
				label: currency.name ? `${currency.code} — ${currency.name}` : currency.code,
				keywords: currency.code,
			})),
		[active],
	);

	const handleChange = (next: string): void => {
		setIsCreating(false);
		const currencyId = Number(next);
		onChange(currencyId);
		const code = active.find((currency) => currency.id === currencyId)?.code;
		if (code) rememberLastCurrencyCode(farmId, code);
	};

	const handleAdd = async (): Promise<void> => {
		const option = addableOptions.find((candidate) => candidate.code === newCode);
		if (!option) return;
		const created = await createMutation.mutateAsync({
			code: option.code,
			name: option.name,
		});
		onChange(created.id);
		rememberLastCurrencyCode(farmId, created.code);
		setNewCode("");
		setIsCreating(false);
	};

	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			<Combobox
				options={options}
				value={value != null ? String(value) : undefined}
				onChange={handleChange}
				disabled={disabled}
				placeholder="Selecciona o agrega moneda"
				searchPlaceholder="Buscar moneda"
				createLabel={
					addableOptions.length > 0 ? "Agregar nueva moneda" : undefined
				}
				onCreateSelect={
					addableOptions.length > 0 ? () => setIsCreating(true) : undefined
				}
			/>

			{isCreating ? (
				<div className="flex items-end gap-2 rounded-lg border bg-muted/40 p-2">
					<div className="flex-1">
						<Select
							value={newCode || undefined}
							onValueChange={setNewCode}
							disabled={createMutation.isPending}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Elige una moneda" />
							</SelectTrigger>
							<SelectContent>
								{addableOptions.map((option) => (
									<SelectItem
										key={option.code}
										value={option.code}
									>
										{option.code} — {option.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={() => setIsCreating(false)}
					>
						Cancelar
					</Button>
					<Button
						type="button"
						onClick={() => void handleAdd()}
						disabled={!newCode || createMutation.isPending}
					>
						{createMutation.isPending ? "Agregando..." : "Agregar"}
					</Button>
				</div>
			) : null}
		</div>
	);
}
