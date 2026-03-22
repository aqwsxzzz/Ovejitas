import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateExpensePayload,
	IExpense,
	IExpenseListFilters,
	IExpenseSummary,
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
		url: "/financial",
		urlParams: {
			type: filters?.type,
			speciesId: filters?.speciesId,
			from: filters?.from,
			to: filters?.to,
			page,
			limit,
		},
	});

export const getExpenseSummary = ({
	filters,
}: {
	filters?: Partial<IExpenseListFilters>;
}) =>
	axiosHelper<IResponse<IExpenseSummary>>({
		method: "get",
		url: "/financial/summary",
		urlParams: {
			groupBy: filters?.groupBy,
			from: filters?.from,
			to: filters?.to,
			period: filters?.period,
			type: filters?.type,
			speciesId: filters?.speciesId,
		},
	});

export const getExpenseById = ({ expenseId }: { expenseId: string }) =>
	axiosHelper<IResponse<IExpense>>({
		method: "get",
		url: `/financial/${expenseId}`,
	});

export const createExpense = ({
	payload,
}: {
	payload: ICreateExpensePayload;
}) =>
	axiosHelper<IResponse<IExpense>>({
		method: "post",
		url: "/financial",
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
		url: `/financial/${expenseId}`,
		data: payload,
	});

export const deleteExpenseById = ({ expenseId }: { expenseId: string }) =>
	axiosHelper<IResponse<null>>({
		method: "delete",
		url: `/financial/${expenseId}`,
	});
