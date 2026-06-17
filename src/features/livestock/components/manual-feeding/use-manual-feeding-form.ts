import { useCallback, useState } from "react";

import type { ManualFeedingFormState } from "./types";

function getDefaultFormState(): ManualFeedingFormState {
	return {
		materialAssetId: "",
		quantity: "",
		unit: "kg",
	};
}

export function useManualFeedingForm() {
	const [form, setForm] = useState<ManualFeedingFormState>(getDefaultFormState);

	const updateField = useCallback(
		<K extends keyof ManualFeedingFormState>(
			field: K,
			value: ManualFeedingFormState[K],
		) => {
			setForm((current) => ({ ...current, [field]: value }));
		},
		[],
	);

	return { form, updateField };
}
