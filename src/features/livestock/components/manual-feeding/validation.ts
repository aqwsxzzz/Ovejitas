import type { ManualFeedingFormState, ParsedFeedingInputs } from "./types";

function parseInputs(form: ManualFeedingFormState): ParsedFeedingInputs {
	return {
		materialAssetId: Number(form.materialAssetId),
		quantity: Number(form.quantity),
	};
}

export function validateFeedingInputs(form: ManualFeedingFormState) {
	const parsed = parseInputs(form);

	if (!Number.isInteger(parsed.materialAssetId)) {
		return {
			ok: false as const,
			error: "Selecciona un material antes de registrar la alimentacion.",
		};
	}

	if (!Number.isFinite(parsed.quantity) || parsed.quantity <= 0) {
		return {
			ok: false as const,
			error: "La cantidad debe ser mayor a 0 para registrar consumo.",
		};
	}

	return { ok: true as const, data: parsed };
}
