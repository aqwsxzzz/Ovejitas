import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createPregnancy,
	deletePregnancy,
	listPregnancies,
	updatePregnancy,
} from "@/features/pregnancy/api/pregnancy-api";
import { reportsQueryKeys } from "@/features/reports/api/reports-queries";

export const pregnancyQueryKeys = {
	all: ["pregnancies"] as const,
	list: (farmId: string, page: number, pageSize: number) =>
		[...pregnancyQueryKeys.all, farmId, page, pageSize] as const,
};

function invalidatePregnancyData(
	queryClient: ReturnType<typeof useQueryClient>,
): void {
	void queryClient.invalidateQueries({ queryKey: pregnancyQueryKeys.all });
	// Pregnancy checks also drive the upcoming-births report and individual
	// timelines, both projected from the ledger under the reports key.
	void queryClient.invalidateQueries({ queryKey: reportsQueryKeys.all });
}

export const useCreatePregnancy = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPregnancy,
		onSuccess: () => invalidatePregnancyData(queryClient),
	});
};

export const useListPregnancies = ({
	farmId,
	page = 1,
	pageSize = 20,
	enabled = true,
}: {
	farmId: string;
	page?: number;
	pageSize?: number;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: pregnancyQueryKeys.list(farmId, page, pageSize),
		queryFn: () => listPregnancies({ farmId, page, pageSize }),
		enabled: enabled && !!farmId,
	});

export const useUpdatePregnancy = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updatePregnancy,
		onSuccess: () => invalidatePregnancyData(queryClient),
	});
};

export const useDeletePregnancy = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deletePregnancy,
		onSuccess: () => invalidatePregnancyData(queryClient),
	});
};
