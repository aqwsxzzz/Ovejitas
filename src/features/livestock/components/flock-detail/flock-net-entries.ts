import type { IProfitabilityFullRow } from "@/features/reports/types/reports-types";

import type { CurrencyNetEntry } from "./currency-net-block";

/**
 * One entry per (asset, currency) straight from profitability-full. Feed is now
 * valued in each currency, so every entry carries its own feed and feed-inclusive
 * net — no cross-report merge, no default-currency special case.
 */
export function buildCurrencyNetEntries(
	rows: IProfitabilityFullRow[],
): CurrencyNetEntry[] {
	return rows
		.map((row) => ({
			currency: row.currency,
			income: row.income_total,
			directExpense: row.direct_expense_total,
			net: row.net,
			feed: row.consumed_material_cost,
			netInclFeed: row.net_incl_materials,
			hasUnvaluedConsumption: row.has_unvalued_consumption,
		}))
		.sort((left, right) =>
			(left.currency ?? "￿").localeCompare(right.currency ?? "￿"),
		);
}
