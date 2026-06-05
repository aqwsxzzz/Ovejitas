import { useGetUserProfile } from "@/features/auth/api/auth-queries";

/** Pull the asset id a source path is already scoped to, if any. */
export function parseContextAssetId(sourcePath?: string): string | null {
	if (!sourcePath) return null;
	const pathOnly = sourcePath.split("?")[0] ?? sourcePath;

	const flock = pathOnly.match(/\/v2\/production-units\/flock\/([^/]+)/);
	if (flock?.[1]) return decodeURIComponent(flock[1]);

	const material = pathOnly.match(/\/v2\/inventory\/materials\/([^/]+)/);
	if (material?.[1]) return decodeURIComponent(material[1]);

	return null;
}

/**
 * Resolves the active farm and any asset already implied by where the quick
 * action was launched from. When no asset is in context the consumer renders an
 * asset picker.
 */
export function useLogTargetAsset(sourcePath?: string): {
	farmId: string;
	contextAssetId: string | null;
} {
	const { data: currentUser } = useGetUserProfile();
	return {
		farmId: currentUser?.lastVisitedFarmId ?? "",
		contextAssetId: parseContextAssetId(sourcePath),
	};
}
