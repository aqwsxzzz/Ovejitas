export type FlockMovementKind = "acquisition" | "sale" | "mortality";
export type FlockDecreaseKind = Exclude<FlockMovementKind, "acquisition">;

export type FlockMovement =
	| { kind: "acquisition"; quantity: number; amount: number | null }
	| { kind: "sale"; quantity: number; amount: number }
	| { kind: "mortality"; quantity: number };

export type FlockMovementResult =
	| { status: "ok"; movement: FlockMovement }
	| { status: "noop" }
	| { status: "error"; message: string };

export interface ResolveFlockMovementInput {
	/** Backdated entries state a delta directly; same-day entries state a target total. */
	isBackdated: boolean;
	currentCount: number;
	targetDraft: string;
	quantityDraft: string;
	amountDraft: string;
	decreaseMode: FlockDecreaseKind;
	movementType: FlockMovementKind;
}

export function parseHeadcount(raw: string): number | null {
	if (raw.trim().length === 0) return null;
	const parsed = Number(raw);
	if (!Number.isFinite(parsed)) return null;
	return Math.max(0, Math.floor(parsed));
}

/**
 * Time of day the ledger gets for a backdated entry. Nobody remembers the hour
 * their chickens arrived, so we estimate: midday halves the worst-case error in
 * the time-weighted animal-days behind `expected`, and is unbiased if the real
 * time is uniform across the day. Same-day entries use the real clock instead.
 */
const BACKDATED_HOUR = 12;

const DATE_DRAFT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Local-time `date` input value; `toISOString()` alone would shift by the UTC offset. */
export function toDateInputValue(date: Date): string {
	const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return local.toISOString().slice(0, 10);
}

/** True when the picked day is not today. */
export function isBackdatedDraft(occurredOnDraft: string, now: Date): boolean {
	if (!occurredOnDraft) return false;
	return occurredOnDraft !== toDateInputValue(now);
}

/**
 * Turns a `YYYY-MM-DD` draft into the instant to send as `occurred_at`.
 * Parsed by hand because `new Date("2026-07-16")` is UTC midnight, which lands
 * on the previous day for anyone west of Greenwich.
 */
export function resolveOccurredAt(occurredOnDraft: string, now: Date): Date | null {
	const match = DATE_DRAFT_PATTERN.exec(occurredOnDraft);
	if (!match) return null;
	if (occurredOnDraft === toDateInputValue(now)) return now;

	const [, year, month, day] = match;
	const occurredAt = new Date(
		Number(year),
		Number(month) - 1,
		Number(day),
		BACKDATED_HOUR,
	);
	return Number.isNaN(occurredAt.getTime()) ? null : occurredAt;
}

function buildMovement(
	kind: FlockMovementKind,
	quantity: number,
	amountDraft: string,
): FlockMovementResult {
	if (kind === "mortality") {
		return { status: "ok", movement: { kind: "mortality", quantity } };
	}

	const hasAmount = amountDraft.trim().length > 0;
	const parsedAmount = Number(amountDraft);
	const isValidAmount =
		hasAmount && Number.isFinite(parsedAmount) && parsedAmount >= 0;

	if (kind === "sale") {
		if (!isValidAmount) {
			return {
				status: "error",
				message: "Para una venta debes ingresar un ingreso valido.",
			};
		}
		return {
			status: "ok",
			movement: { kind: "sale", quantity, amount: parsedAmount },
		};
	}

	if (hasAmount && !isValidAmount) {
		return {
			status: "error",
			message: "Ingresa un costo valido o dejalo vacio.",
		};
	}
	return {
		status: "ok",
		movement: {
			kind: "acquisition",
			quantity,
			amount: hasAmount ? parsedAmount : null,
		},
	};
}

/**
 * Resolves form drafts into the flock action to submit.
 *
 * Same-day entries reconcile against the live headcount, so the user states the
 * new total and the delta is derived. A backdated entry cannot do that — the
 * total as of a past date says nothing about the delta once later events exist —
 * so the user states the movement quantity and its kind directly.
 */
export function resolveFlockMovement(
	input: ResolveFlockMovementInput,
): FlockMovementResult {
	if (input.isBackdated) {
		const quantity = parseHeadcount(input.quantityDraft);
		if (quantity == null || quantity === 0) {
			return { status: "error", message: "Ingresa una cantidad mayor a 0." };
		}
		return buildMovement(input.movementType, quantity, input.amountDraft);
	}

	const target = parseHeadcount(input.targetDraft);
	if (target == null) {
		return { status: "error", message: "Ingresa un conteo valido." };
	}

	const delta = target - input.currentCount;
	if (delta === 0) return { status: "noop" };

	const kind: FlockMovementKind = delta > 0 ? "acquisition" : input.decreaseMode;
	return buildMovement(kind, Math.abs(delta), input.amountDraft);
}

/** The movement the current drafts would produce, for labelling the amount field. */
export function resolvePendingKind(
	input: Pick<
		ResolveFlockMovementInput,
		"isBackdated" | "movementType" | "decreaseMode"
	>,
	deltaPreview: number | null,
): FlockMovementKind | null {
	if (input.isBackdated) return input.movementType;
	if (deltaPreview == null || deltaPreview === 0) return null;
	return deltaPreview > 0 ? "acquisition" : input.decreaseMode;
}
