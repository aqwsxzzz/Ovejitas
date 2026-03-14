import { z } from "zod";
import i18next from "i18next";
import {
	expenseCategories,
	expenseStatuses,
	paymentMethods,
	quantityUnits,
} from "@/features/expense/types/expense-types";

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

const roundMoney = (value: number): number => Number(value.toFixed(2));

export const expenseFormSchema = z
	.object({
		date: z.date(),
		amount: z
			.string()
			.min(1, i18next.t("expenses:form.validation.amountRequired")),
		category: z.enum(expenseCategories),
		description: z.string().max(400).optional(),
		vendor: z.string().max(120).optional(),
		invoiceNumber: z.string().max(120).optional(),
		paymentMethod: z.enum(paymentMethods).optional(),
		status: z.enum(expenseStatuses),
		quantity: z.string().optional(),
		quantityUnit: z.enum(quantityUnits).optional(),
		unitCost: z.string().optional(),
		speciesId: z.string().optional(),
		breedId: z.string().optional(),
		animalId: z.string().optional(),
		lotId: z.string().optional(),
	})
	.superRefine((value, ctx) => {
		const amount = toNumber(value.amount);
		const quantity = toNumber(value.quantity);
		const unitCost = toNumber(value.unitCost);

		if (amount === undefined || amount < 0) {
			ctx.addIssue({
				code: "custom",
				path: ["amount"],
				message: i18next.t("expenses:form.validation.amountNonNegative"),
			});
		}

		if (quantity !== undefined && quantity < 0) {
			ctx.addIssue({
				code: "custom",
				path: ["quantity"],
				message: i18next.t("expenses:form.validation.quantityNonNegative"),
			});
		}

		if (unitCost !== undefined && unitCost < 0) {
			ctx.addIssue({
				code: "custom",
				path: ["unitCost"],
				message: i18next.t("expenses:form.validation.unitCostNonNegative"),
			});
		}

		if (quantity !== undefined && !value.quantityUnit) {
			ctx.addIssue({
				code: "custom",
				path: ["quantityUnit"],
				message: i18next.t("expenses:form.validation.quantityUnitRequired"),
			});
		}

		if (
			quantity !== undefined &&
			unitCost !== undefined &&
			amount !== undefined
		) {
			const expectedAmount = roundMoney(quantity * unitCost);
			if (roundMoney(amount) !== expectedAmount) {
				ctx.addIssue({
					code: "custom",
					path: ["amount"],
					message: i18next.t("expenses:form.validation.amountMustMatch", {
						expectedAmount: expectedAmount.toFixed(2),
					}),
				});
			}
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
