import { useState } from "react";

import { useCreateEventByAssetId } from "@/features/livestock/api/livestock-queries";
import type { LivestockEventCreatePayload } from "@/features/livestock/api/livestock-api";

export function useLocationActions(farmId: string, locationId: string) {
	const [error, setError] = useState<string | null>(null);
	const createEventMutation = useCreateEventByAssetId();

	const handleEventSubmit = async (data: LivestockEventCreatePayload) => {
		setError(null);
		try {
			await createEventMutation.mutateAsync({ farmId, assetId: locationId, data });
		} catch {
			setError("No se pudo registrar el evento. Intenta de nuevo.");
		}
	};

	return {
		handleEventSubmit,
		isSubmitting: createEventMutation.isPending,
		error,
	};
}
