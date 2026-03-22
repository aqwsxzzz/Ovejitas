import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createExpense,
	deleteExpenseById,
	getExpenseById,
	getExpenses,
	getExpenseSummary,
	updateExpenseById,
} from "@/features/expense/api/expense-api";
import type {
	ICreateExpensePayload,
	IExpenseListFilters,
	IExpenseSummary,
	IUpdateExpensePayload,
} from "@/features/expense/types/expense-types";
import i18next from "i18next";

const normalizeFilters = (filters?: Partial<IExpenseListFilters>): string[] => {
	return [
		filters?.type ?? "",
		filters?.speciesId ?? "",
		filters?.from ?? "",
		filters?.to ?? "",
		filters?.period ?? "",
		filters?.groupBy ?? "",
	];
};

const DEFAULT_LIST_PAGE_SIZE = 20;
const LEGACY_LIST_PAGE_SIZE = 100;

export const expenseQueryKeys = {
	all: ["financial"] as const,
	farm: (farmId: string) => [...expenseQueryKeys.all, "farm", farmId] as const,
	expenseList: (farmId: string, filters?: Partial<IExpenseListFilters>) =>
		[
			...expenseQueryKeys.farm(farmId),
			"list",
			normalizeFilters(filters),
		] as const,
	expenseListPage: (
		farmId: string,
		filters: Partial<IExpenseListFilters> | undefined,
		limit: number,
	) =>
		[...expenseQueryKeys.expenseList(farmId, filters), "page", limit] as const,
	expenseSummary: (farmId: string, filters?: Partial<IExpenseListFilters>) =>
		[
			...expenseQueryKeys.farm(farmId),
			"summary",
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
		queryFn: () =>
			getExpenses({ filters, page: 1, limit: LEGACY_LIST_PAGE_SIZE }),
		select: (data) => data.data,
		enabled: !!farmId,
	});

export const useGetExpenseSummary = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: Partial<IExpenseListFilters>;
}) =>
	useQuery({
		queryKey: expenseQueryKeys.expenseSummary(farmId, filters),
		queryFn: () =>
			getExpenseSummary({
				filters: {
					groupBy: filters?.groupBy ?? "month",
					...filters,
				},
			}),
		select: (data): IExpenseSummary => data.data,
		enabled: !!farmId,
	});

export const useGetInfiniteExpenses = ({
	farmId,
	filters,
	limit = DEFAULT_LIST_PAGE_SIZE,
}: {
	farmId: string;
	filters?: Partial<IExpenseListFilters>;
	limit?: number;
}) =>
	useInfiniteQuery({
		queryKey: expenseQueryKeys.expenseListPage(farmId, filters, limit),
		queryFn: ({ pageParam }) =>
			getExpenses({
				filters,
				page: pageParam,
				limit,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const pagination = lastPage.meta?.pagination;
			if (!pagination) {
				return undefined;
			}

			return pagination.page < pagination.totalPages
				? pagination.page + 1
				: undefined;
		},
		select: (data) => {
			const items = data.pages.flatMap((page) => page.data);
			const latestPagination = data.pages.at(-1)?.meta?.pagination;

			return {
				items,
				total: latestPagination?.total ?? items.length,
				totalPages: latestPagination?.totalPages ?? 1,
			};
		},
		enabled: !!farmId,
	});

export const useGetExpensesPage = ({
	farmId,
	filters,
	page,
	limit,
}: {
	farmId: string;
	filters?: Partial<IExpenseListFilters>;
	page: number;
	limit: number;
}) =>
	useQuery({
		queryKey: [
			...expenseQueryKeys.expenseList(farmId, filters),
			"paged",
			page,
			limit,
		],
		queryFn: () =>
			getExpenses({
				filters,
				page,
				limit,
			}),
		select: (data) => {
			const pagination = data.meta?.pagination;

			return {
				items: data.data,
				page: pagination?.page ?? page,
				limit: pagination?.limit ?? limit,
				total: pagination?.total ?? data.data.length,
				totalPages: pagination?.totalPages ?? 1,
			};
		},
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
		onSuccess: async (_, { farmId }) => {
			toast.success(i18next.t("expenses:toast.createSuccess"));
			await queryClient.invalidateQueries({
				queryKey: expenseQueryKeys.farm(farmId),
			});
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
		onSuccess: async (_, { farmId }) => {
			toast.success(i18next.t("expenses:toast.updateSuccess"));
			await queryClient.invalidateQueries({
				queryKey: expenseQueryKeys.farm(farmId),
			});
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
		onSuccess: async (_, { farmId }) => {
			toast.success(i18next.t("expenses:toast.deleteSuccess"));
			await queryClient.invalidateQueries({
				queryKey: expenseQueryKeys.farm(farmId),
			});
		},
	});
};
