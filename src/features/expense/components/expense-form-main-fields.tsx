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
import {
	expenseCategoryLabelKeys,
	expenseStatusLabelKeys,
	paymentMethodLabelKeys,
} from "./expense-labels";
import type { ExpenseFormValues } from "@/features/expense/components/expense-form-schema";
import {
	expenseCategories,
	expenseStatuses,
	paymentMethods,
} from "@/features/expense/types/expense-types";
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
					name="category"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.category")}</FormLabel>
							<FormControl>
								<Select
									value={field.value}
									onValueChange={field.onChange}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{expenseCategories.map((category) => (
											<SelectItem
												key={category}
												value={category}
											>
												{t(expenseCategoryLabelKeys[category] as never)}
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
			<FormField
				control={form.control}
				name="status"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("form.fields.status")}</FormLabel>
						<FormControl>
							<Select
								value={field.value}
								onValueChange={field.onChange}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{expenseStatuses.map((status) => (
										<SelectItem
											key={status}
											value={status}
										>
											{t(expenseStatusLabelKeys[status] as never)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<details className="border rounded-card p-3">
				<summary className="cursor-pointer text-sm font-medium">
					{t("form.sections.additionalDetails")}
				</summary>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
					<FormField
						control={form.control}
						name="vendor"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("form.fields.vendor")}</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="invoiceNumber"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("form.fields.invoiceNumber")}</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="paymentMethod"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("form.fields.paymentMethod")}</FormLabel>
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
											{paymentMethods.map((method) => (
												<SelectItem
													key={method}
													value={method}
												>
													{t(paymentMethodLabelKeys[method] as never)}
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
			</details>
		</>
	);
};
