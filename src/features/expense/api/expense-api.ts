import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateExpensePayload,
	IExpense,
	IExpenseListFilters,
	IUpdateExpensePayload,
} from "@/features/expense/types/expense-types";

export const getExpenses = ({
	filters,
	page,
	limit,
}: {
	filters?: Partial<IExpenseListFilters>;
	page?: number;
	limit?: number;
}) =>
	axiosHelper<IResponse<IExpense[]>>({
		method: "get",
		url: "/expenses",
		urlParams: {
			category: filters?.category,
			paymentMethod: filters?.paymentMethod,
			status: filters?.status,
			page,
			limit,
		},
	});

export const getExpenseById = ({ expenseId }: { expenseId: string }) =>
	axiosHelper<IResponse<IExpense>>({
		method: "get",
		url: `/expenses/${expenseId}`,
	});

export const createExpense = ({
	payload,
}: {
	payload: ICreateExpensePayload;
}) =>
	axiosHelper<IResponse<IExpense>>({
		method: "post",
		url: "/expenses",
		data: payload,
	});

export const updateExpenseById = ({
	expenseId,
	payload,
}: {
	expenseId: string;
	payload: IUpdateExpensePayload;
}) =>
	axiosHelper<IResponse<IExpense>>({
		method: "put",
		url: `/expenses/${expenseId}`,
		data: payload,
	});

export const deleteExpenseById = ({ expenseId }: { expenseId: string }) =>
	axiosHelper<IResponse<null>>({
		method: "delete",
		url: `/expenses/${expenseId}`,
	});
