import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ExpenseFormValues } from "@/features/expense/components/expense-form-schema";
import type { ISpecie } from "@/features/specie/types/specie-types";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface ExpenseFormEntityFieldsProps {
	form: UseFormReturn<ExpenseFormValues>;
	speciesData: ISpecie[];
}

export const ExpenseFormEntityFields = ({
	form,
	speciesData,
}: ExpenseFormEntityFieldsProps) => {
	const { t } = useTranslation("expenses");

	return (
		<FormField
			control={form.control}
			name="speciesId"
			render={({ field }) => (
				<FormItem>
					<FormLabel>{t("form.fields.species")}</FormLabel>
					<FormControl>
						<Select
							value={field.value || undefined}
							onValueChange={field.onChange}
						>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={t("form.placeholders.selectSpecies")}
								/>
							</SelectTrigger>
							<SelectContent>
								{speciesData
									.filter((specie) => specie.translations?.[0]?.name)
									.map((specie) => (
										<SelectItem
											key={specie.id}
											value={specie.id}
										>
											{specie.translations?.[0]?.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
