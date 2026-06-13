import type { LivestockEventUnit } from "@/features/livestock/types/livestock-types";

export interface ManualFeedingPanelProps {
	farmId: string;
	consumerAssetId: number;
	consumerAssetName: string;
}

export interface FeedingProfile {
	materialAssetId: number;
	quantity: number;
	unit: LivestockEventUnit;
	maxFeedsPerDay: number;
	minHoursBetweenFeeds: number;
}

export type FeedingProfileMap = Record<string, FeedingProfile>;

export interface ManualFeedingFormState {
	materialAssetId: string;
	quantity: string;
	unit: LivestockEventUnit;
	maxFeedsPerDay: string;
	minHoursBetweenFeeds: string;
}

export interface ParsedFeedingInputs {
	materialAssetId: number;
	quantity: number;
	maxFeedsPerDay: number;
	minHoursBetweenFeeds: number;
}

export interface TodaysFeedMetrics {
	count: number;
	countForSelectedMaterial: number;
	totalForSelectedMaterialAndUnit: number;
	latestFeedAtForSelectedMaterial: string | null;
}
