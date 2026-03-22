import { z } from "zod";
import i18next from "i18next";
import { financialTransactionTypes } from "@/features/expense/types/expense-types";

const toNumber = (value: string | undefined): number | undefined => {
	if (!value?.trim()) {
		return undefined;
	}
	const parsed = Number(value);
	if (Number.isNaN(parsed)) {
		return undefined;
	}
	return parsed;
};

export const expenseFormSchema = z
	.object({
		date: z.date(),
		amount: z
			.string()
			.min(1, i18next.t("expenses:form.validation.amountRequired")),
		type: z.enum(financialTransactionTypes),
		description: z.string().max(400).optional(),
		speciesId: z
			.string()
			.min(1, i18next.t("expenses:form.validation.speciesRequired")),
	})
	.superRefine((value, ctx) => {
		const amount = toNumber(value.amount);

		if (amount === undefined || amount <= 0) {
			ctx.addIssue({
				code: "custom",
				path: ["amount"],
				message: i18next.t("expenses:form.validation.amountPositive"),
			});
		}
	});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const parseOptionalNumber = (value?: string): number | undefined => {
	const parsed = toNumber(value);
	if (parsed === undefined) {
		return undefined;
	}
	return parsed;
};

export const toDateValue = (date: string): Date => {
	return new Date(`${date}T00:00:00`);
};

export const toYyyyMmDd = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const formatDecimal = (value?: number): string => {
	if (value === undefined) {
		return "";
	}
	return String(value);
};
