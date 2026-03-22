import { DateSelector } from "@/components/common/DateSelector";
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
import { Textarea } from "@/components/ui/textarea";
import { financialTransactionTypeLabelKeys } from "./expense-labels";
import type { ExpenseFormValues } from "@/features/expense/components/expense-form-schema";
import { financialTransactionTypes } from "@/features/expense/types/expense-types";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const ExpenseFormMainFields = ({
	form,
}: {
	form: UseFormReturn<ExpenseFormValues>;
}) => {
	const { t } = useTranslation("expenses");

	return (
		<>
			<FormField
				control={form.control}
				name="date"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("form.fields.date")}</FormLabel>
						<FormControl>
							<DateSelector
								date={field.value}
								setDate={field.onChange}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<FormField
					control={form.control}
					name="amount"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.amount")}</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="number"
									step="0.01"
									min="0"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.type")}</FormLabel>
							<FormControl>
								<Select
									value={field.value}
									onValueChange={field.onChange}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{financialTransactionTypes.map((type) => (
											<SelectItem
												key={type}
												value={type}
											>
												{t(financialTransactionTypeLabelKeys[type] as never)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("form.fields.description")}</FormLabel>
						<FormControl>
							<Textarea {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
