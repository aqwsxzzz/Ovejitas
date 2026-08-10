/**
 * Barrel for the livestock query layer.
 *
 * The hooks live in one module per domain concern (assets, individuals, events,
 * flock actions, materials, categories, harvest, reports). This file only
 * re-exports them, so the ~50 call sites that import from
 * `@/features/livestock/api/livestock-queries` keep working unchanged.
 *
 * Prefer importing from the specific module in new code.
 */

export { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
export type {
	ListEventCategoriesFilters,
	ListEventsFilters,
	ListIndividualsFilters,
	ListLivestockAssetsFilters,
	ListMaterialConsumptionsFilters,
	ListMaterialPurchasesFilters,
} from "@/features/livestock/api/livestock-query-filters";

export * from "@/features/livestock/api/asset-queries";
export * from "@/features/livestock/api/individual-queries";
export * from "@/features/livestock/api/individual-mutations";
export * from "@/features/livestock/api/event-queries";
export * from "@/features/livestock/api/event-mutations";
export * from "@/features/livestock/api/event-category-queries";
export * from "@/features/livestock/api/flock-queries";
export * from "@/features/livestock/api/harvest-queries";
export * from "@/features/livestock/api/material-purchase-queries";
export * from "@/features/livestock/api/material-consumption-queries";
export * from "@/features/livestock/api/material-sale-queries";
export * from "@/features/livestock/api/livestock-report-queries";
