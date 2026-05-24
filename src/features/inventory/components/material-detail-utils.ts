export const MATERIAL_PAGE_SIZE = 20;

export function toNumber(value: string | null | undefined): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDate(value: string): string {
	return new Date(value).toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function toDateTimeInputValue(value: string): string {
	return new Date(value).toISOString().slice(0, 16);
}

export function getPayloadSource(
	payload: Record<string, unknown> | null | undefined,
) {
	if (!payload) return null;
	const source = payload["source"];
	return typeof source === "string" ? source : null;
}
