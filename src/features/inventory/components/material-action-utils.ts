import { ApiRequestError } from "@/lib/axios/axios-helper";

interface ValidationDetail {
	msg?: string;
}

function getValidationMessages(details: unknown): string[] {
	if (!details || typeof details !== "object") return [];
	if (!("detail" in details)) return [];

	const detail = (details as { detail?: unknown }).detail;
	if (!Array.isArray(detail)) return [];

	return detail
		.map((item) => {
			if (!item || typeof item !== "object") return null;
			const msg = (item as ValidationDetail).msg;
			return typeof msg === "string" ? msg : null;
		})
		.filter((msg): msg is string => Boolean(msg));
}

export function getMaterialActionErrorMessage(
	error: unknown,
	fallback: string,
): string {
	if (!(error instanceof ApiRequestError)) {
		return error instanceof Error ? error.message : fallback;
	}

	const detailsMessages = getValidationMessages(error.details);
	const normalizedMessage = `${error.message} ${detailsMessages.join(" ")}`
		.toLowerCase()
		.trim();

	if (
		error.code === "conflict_error" &&
		normalizedMessage.includes("insufficient_stock")
	) {
		return "Stock insuficiente para esta accion de material.";
	}

	if (detailsMessages.length > 0) {
		return detailsMessages.join(" ");
	}

	return error.message || fallback;
}
