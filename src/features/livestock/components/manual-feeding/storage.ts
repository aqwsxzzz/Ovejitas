import type { FeedingProfileMap } from "./types";

const FEEDING_PROFILE_STORAGE_KEY = "v2-feeding-profiles";

export function getProfileMapFromStorage(): FeedingProfileMap {
	if (typeof window === "undefined") return {};

	const raw = window.localStorage.getItem(FEEDING_PROFILE_STORAGE_KEY);
	if (!raw) return {};

	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object") return {};
		return parsed as FeedingProfileMap;
	} catch {
		return {};
	}
}

export function setProfileMapToStorage(nextMap: FeedingProfileMap) {
	if (typeof window === "undefined") return;

	window.localStorage.setItem(
		FEEDING_PROFILE_STORAGE_KEY,
		JSON.stringify(nextMap),
	);
}

export function clearStoredProfile(profileStorageId: string) {
	const currentMap = getProfileMapFromStorage();
	if (!(profileStorageId in currentMap)) return;

	const rest = { ...currentMap };
	delete rest[profileStorageId];
	setProfileMapToStorage(rest);
}
