import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateCurrency } from "@/features/currency/api/currency-queries";
import { CURRENCY_OPTIONS } from "@/features/farm/constants/currency-options";

interface AddCurrencyRowProps {
	farmId: string;
	enabledCodes: string[];
	disabled?: boolean;
}

/** Enables a supported ISO currency for the farm, seeding its name from the catalog. */
export function AddCurrencyRow({
	farmId,
	enabledCodes,
	disabled,
}: AddCurrencyRowProps) {
	const [code, setCode] = useState<string>("");
	const createMutation = useCreateCurrency({ farmId });

	const options = CURRENCY_OPTIONS.filter(
		(option) => !enabledCodes.includes(option.code),
	);

	const handleAdd = (): void => {
		const option = options.find((candidate) => candidate.code === code);
		if (!option) return;
		createMutation.mutate(
			{ code: option.code, name: option.name },
			{ onSuccess: () => setCode("") },
		);
	};

	if (options.length === 0) return null;

	return (
		<div className="flex items-end gap-2">
			<div className="flex-1">
				<Select
					value={code || undefined}
					onValueChange={setCode}
					disabled={disabled || createMutation.isPending}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Agregar moneda" />
					</SelectTrigger>
					<SelectContent>
						{options.map((option) => (
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
				disabled={disabled || !code || createMutation.isPending}
				onClick={handleAdd}
			>
				Agregar
			</Button>
		</div>
	);
}
