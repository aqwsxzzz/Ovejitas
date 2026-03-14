import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { IResponse } from "@/lib/axios";
import {
	createExpense,
	deleteExpenseById,
	getExpenseById,
	getExpenses,
	updateExpenseById,
} from "@/features/expense/api/expense-api";
import type {
	ICreateExpensePayload,
	IExpense,
	IExpenseListFilters,
	IUpdateExpensePayload,
} from "@/features/expense/types/expense-types";
import i18next from "i18next";

const normalizeFilters = (filters?: Partial<IExpenseListFilters>): string[] => {
	return [
		filters?.category ?? "",
		filters?.status ?? "",
		filters?.paymentMethod ?? "",
	];
};

export const expenseQueryKeys = {
	all: ["expense"] as const,
	expenseList: (farmId: string, filters?: Partial<IExpenseListFilters>) =>
		[
			...expenseQueryKeys.all,
			"list",
			farmId,
			normalizeFilters(filters),
		] as const,
	expenseById: (expenseId: string) =>
		[...expenseQueryKeys.all, "byId", expenseId] as const,
};

export const useGetExpenses = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: Partial<IExpenseListFilters>;
}) =>
	useQuery({
		queryKey: expenseQueryKeys.expenseList(farmId, filters),
		queryFn: () => getExpenses({ filters }),
		select: (data) => data.data,
		enabled: !!farmId,
	});

export const useGetExpenseById = (expenseId: string) =>
	useQuery({
		queryKey: expenseQueryKeys.expenseById(expenseId),
		queryFn: () => getExpenseById({ expenseId }),
		select: (data) => data.data,
		enabled: !!expenseId,
	});

export const useCreateExpense = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
		}: {
			payload: ICreateExpensePayload;
			farmId: string;
			filters?: Partial<IExpenseListFilters>;
		}) => createExpense({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { filters, farmId }) => {
			toast.success(i18next.t("expenses:toast.createSuccess"));
			queryClient.setQueryData<IResponse<IExpense[]>>(
				expenseQueryKeys.expenseList(farmId, filters),
				(oldData) => {
					if (!oldData) {
						return;
					}

					return {
						...oldData,
						data: [response.data, ...oldData.data],
					};
				},
			);
		},
	});
};

export const useUpdateExpenseById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			expenseId,
			payload,
		}: {
			expenseId: string;
			payload: IUpdateExpensePayload;
			farmId: string;
			filters?: Partial<IExpenseListFilters>;
		}) => updateExpenseById({ expenseId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { filters, farmId }) => {
			toast.success(i18next.t("expenses:toast.updateSuccess"));
			queryClient.setQueryData<IResponse<IExpense[]>>(
				expenseQueryKeys.expenseList(farmId, filters),
				(oldData) => {
					if (!oldData) {
						return;
					}

					return {
						...oldData,
						data: oldData.data.map((expense) =>
							expense.id === response.data.id ? response.data : expense,
						),
					};
				},
			);
		},
	});
};

export const useDeleteExpenseById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			expenseId,
		}: {
			expenseId: string;
			farmId: string;
			filters?: Partial<IExpenseListFilters>;
		}) => deleteExpenseById({ expenseId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { expenseId, filters, farmId }) => {
			toast.success(i18next.t("expenses:toast.deleteSuccess"));
			queryClient.setQueryData<IResponse<IExpense[]>>(
				expenseQueryKeys.expenseList(farmId, filters),
				(oldData) => {
					if (!oldData) {
						return;
					}

					return {
						...oldData,
						data: oldData.data.filter((expense) => expense.id !== expenseId),
					};
				},
			);
		},
	});
};
