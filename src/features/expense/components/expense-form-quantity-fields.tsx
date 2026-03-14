import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { quantityUnitLabelKeys } from "./expense-labels";
import type { ExpenseFormValues } from "@/features/expense/components/expense-form-schema";
import { quantityUnits } from "@/features/expense/types/expense-types";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface ExpenseFormQuantityFieldsProps {
	form: UseFormReturn<ExpenseFormValues>;
	selectedQuantity?: string;
	selectedUnitCost?: string;
	onQuantityRelatedChange: (
		nextQuantity?: string,
		nextUnitCost?: string,
	) => void;
}

export const ExpenseFormQuantityFields = ({
	form,
	selectedQuantity,
	selectedUnitCost,
	onQuantityRelatedChange,
}: ExpenseFormQuantityFieldsProps) => {
	const { t } = useTranslation("expenses");

	return (
		<details className="border rounded-card p-3">
			<summary className="cursor-pointer text-sm font-medium">
				{t("form.sections.quantityDetails")}
			</summary>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
				<FormField
					control={form.control}
					name="quantity"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.quantity")}</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="number"
									min="0"
									step="0.01"
									onChange={(event) => {
										field.onChange(event.target.value);
										onQuantityRelatedChange(
											event.target.value,
											selectedUnitCost,
										);
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="quantityUnit"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.quantityUnit")}</FormLabel>
							<FormControl>
								<Select
									value={field.value ?? "none"}
									onValueChange={(value) =>
										field.onChange(value === "none" ? undefined : value)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t("form.placeholders.optional")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">
											{t("form.placeholders.none")}
										</SelectItem>
										{quantityUnits.map((unit) => (
											<SelectItem
												key={unit}
												value={unit}
											>
												{t(quantityUnitLabelKeys[unit] as never)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="unitCost"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.unitCost")}</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="number"
									min="0"
									step="0.01"
									onChange={(event) => {
										field.onChange(event.target.value);
										onQuantityRelatedChange(
											selectedQuantity,
											event.target.value,
										);
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</details>
	);
};
