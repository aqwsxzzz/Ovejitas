import { useState } from "react";

import type { LivestockEventUnit } from "@/features/livestock/types/livestock-types";
import { EVENT_UNITS } from "@/shared/types/unit-types";

/**
 * The unit a stock movement may use.
 *
 * A stock-bearing asset is locked to the unit it already holds stock in — the
 * backend rejects a mismatch outright, and there is no conversion. A produce
 * pool gathered in `unit` cannot be sold in `kg`. Offering every unit in the
 * picker only lets the farmer choose an error.
 *
 * So the options are the units the asset actually holds. Until it holds any
 * (no inventory history yet) every unit is open, because the first movement is
 * what sets it.
 *
 * The choice is validated during render rather than stored blindly: the balance
 * arrives after mount, and a unit that is no longer offered must fall back to a
 * valid one instead of submitting a value the backend will refuse.
 */
export function useStockUnit(stockedUnits: LivestockEventUnit[]) {
	const [chosen, setChosen] = useState<LivestockEventUnit | null>(null);

	const options: readonly LivestockEventUnit[] =
		stockedUnits.length > 0 ? stockedUnits : EVENT_UNITS;
	const unit = chosen && options.includes(chosen) ? chosen : options[0]!;

	return {
		unit,
		setUnit: setChosen,
		unitOptions: options,
		/** The asset's unit is already settled — show it, but don't let it change. */
		isUnitLocked: stockedUnits.length === 1,
	};
}
