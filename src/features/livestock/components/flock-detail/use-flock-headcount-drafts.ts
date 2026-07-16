import { useCallback, useReducer } from "react";

import {
	toDateInputValue,
	type FlockDecreaseKind,
	type FlockMovementKind,
} from "./flock-headcount-movement";

export interface FlockHeadcountDrafts {
	/** `YYYY-MM-DD` — the ledger's time of day is derived, never typed. */
	occurredOn: string;
	/** New total — used for same-day reconciliation. */
	target: string;
	/** Movement quantity — used for backdated entries. */
	quantity: string;
	amount: string;
	decreaseMode: FlockDecreaseKind;
	movementType: FlockMovementKind;
}

type DraftsAction =
	| { type: "patch"; patch: Partial<FlockHeadcountDrafts> }
	| { type: "reset"; currentCount: number };

function createDrafts(currentCount: number): FlockHeadcountDrafts {
	return {
		occurredOn: toDateInputValue(new Date()),
		target: String(currentCount),
		quantity: "",
		amount: "",
		decreaseMode: "mortality",
		movementType: "acquisition",
	};
}

function draftsReducer(
	state: FlockHeadcountDrafts,
	action: DraftsAction,
): FlockHeadcountDrafts {
	switch (action.type) {
		case "patch":
			return { ...state, ...action.patch };
		case "reset":
			return createDrafts(action.currentCount);
		default: {
			const exhaustive: never = action;
			return exhaustive;
		}
	}
}

export interface UseFlockHeadcountDraftsResult {
	drafts: FlockHeadcountDrafts;
	patchDrafts: (patch: Partial<FlockHeadcountDrafts>) => void;
	resetDrafts: (currentCount: number) => void;
}

/** Owns the adjustment form's field drafts and their reset transition. */
export function useFlockHeadcountDrafts(): UseFlockHeadcountDraftsResult {
	const [drafts, dispatch] = useReducer(draftsReducer, 0, createDrafts);

	const patchDrafts = useCallback((patch: Partial<FlockHeadcountDrafts>) => {
		dispatch({ type: "patch", patch });
	}, []);
	const resetDrafts = useCallback((currentCount: number) => {
		dispatch({ type: "reset", currentCount });
	}, []);

	return { drafts, patchDrafts, resetDrafts };
}
