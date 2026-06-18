import type { LivestockEventUnit } from "@/features/livestock/types/livestock-types";

export interface ManualFeedingPanelProps {
	farmId: string;
	consumerAssetId: number;
	consumerAssetName: string;
}

export interface ManualFeedingFormState {
	materialAssetId: string;
	quantity: string;
	unit: LivestockEventUnit;
}

export interface ParsedFeedingInputs {
	materialAssetId: number;
	quantity: number;
}

export interface TodaysFeedMetrics {
	count: number;
	totalForSelectedMaterialAndUnit: number;
}
