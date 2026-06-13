import type { ManualFeedingFormState, ParsedFeedingInputs } from "./types";

function parseInputs(form: ManualFeedingFormState): ParsedFeedingInputs {
	return {
		materialAssetId: Number(form.materialAssetId),
		quantity: Number(form.quantity),
		maxFeedsPerDay: Number(form.maxFeedsPerDay),
		minHoursBetweenFeeds: Number(form.minHoursBetweenFeeds),
	};
}

export function validateProfileInputsForSave(form: ManualFeedingFormState) {
	const parsed = parseInputs(form);

	if (!Number.isInteger(parsed.materialAssetId)) {
		return {
			ok: false as const,
			error: "Selecciona un material para este activo animal.",
		};
	}

	if (!Number.isFinite(parsed.quantity) || parsed.quantity <= 0) {
		return {
			ok: false as const,
			error: "La cantidad por dia debe ser mayor a 0.",
		};
	}

	if (!Number.isFinite(parsed.maxFeedsPerDay) || parsed.maxFeedsPerDay < 1) {
		return {
			ok: false as const,
			error: "El maximo de alimentaciones por dia debe ser al menos 1.",
		};
	}

	if (
		!Number.isFinite(parsed.minHoursBetweenFeeds) ||
		parsed.minHoursBetweenFeeds < 0
	) {
		return {
			ok: false as const,
			error: "El intervalo minimo entre alimentaciones no puede ser negativo.",
		};
	}

	return { ok: true as const, data: parsed };
}

export function validateProfileInputsForSubmission(
	form: ManualFeedingFormState,
) {
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

	if (!Number.isFinite(parsed.maxFeedsPerDay) || parsed.maxFeedsPerDay < 1) {
		return {
			ok: false as const,
			error: "Configura un maximo diario valido (minimo 1). ",
		};
	}

	if (
		!Number.isFinite(parsed.minHoursBetweenFeeds) ||
		parsed.minHoursBetweenFeeds < 0
	) {
		return {
			ok: false as const,
			error: "Configura un intervalo minimo valido (>= 0). ",
		};
	}

	return { ok: true as const, data: parsed };
}
