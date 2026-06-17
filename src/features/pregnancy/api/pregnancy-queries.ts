import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPregnancy } from "@/features/pregnancy/api/pregnancy-api";
import { reportsQueryKeys } from "@/features/reports/api/reports-queries";

export const useCreatePregnancy = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPregnancy,
		onSuccess: () => {
			// Pregnancy checks feed the individual timeline and upcoming-births
			// report, both projected from the ledger under the reports key.
			void queryClient.invalidateQueries({ queryKey: reportsQueryKeys.all });
		},
	});
};
