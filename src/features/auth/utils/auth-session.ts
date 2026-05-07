import { setDefaultHeaders } from "@/lib/axios";
import type {
	IFarmMembership,
	ITokenPair,
} from "@/features/auth/types/auth-types";

const ACCESS_TOKEN_KEY = "auth.access_token";
const REFRESH_TOKEN_KEY = "auth.refresh_token";
const ACTIVE_FARM_ID_KEY = "auth.active_farm_id";

const isBrowser = () => typeof window !== "undefined";

export const saveTokenPair = (tokenPair: ITokenPair): void => {
	if (!isBrowser()) return;

	window.localStorage.setItem(ACCESS_TOKEN_KEY, tokenPair.access_token);
	window.localStorage.setItem(REFRESH_TOKEN_KEY, tokenPair.refresh_token);
	setDefaultHeaders(tokenPair.access_token);
};

export const loadTokenPair = (): ITokenPair | null => {
	if (!isBrowser()) return null;

	const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
	const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);

	if (!accessToken || !refreshToken) {
		return null;
	}

	return {
		access_token: accessToken,
		refresh_token: refreshToken,
		token_type: "bearer",
	};
};

export const clearTokenPair = (): void => {
	if (!isBrowser()) return;

	window.localStorage.removeItem(ACCESS_TOKEN_KEY);
	window.localStorage.removeItem(REFRESH_TOKEN_KEY);
	window.localStorage.removeItem(ACTIVE_FARM_ID_KEY);
	setDefaultHeaders(null);
};

export const saveActiveFarmId = (farmId: string): void => {
	if (!isBrowser() || !farmId) return;

	window.localStorage.setItem(ACTIVE_FARM_ID_KEY, farmId);
};

export const loadActiveFarmId = (): string | null => {
	if (!isBrowser()) return null;

	return window.localStorage.getItem(ACTIVE_FARM_ID_KEY);
};

export const resolveAndPersistActiveFarmId = (
	memberships: IFarmMembership[],
): string => {
	if (!memberships.length) {
		if (isBrowser()) {
			window.localStorage.removeItem(ACTIVE_FARM_ID_KEY);
		}
		return "";
	}

	const storedFarmId = loadActiveFarmId();
	const hasStoredMembership = memberships.some(
		(membership) => String(membership.farm_id) === storedFarmId,
	);

	if (storedFarmId && hasStoredMembership) {
		return storedFarmId;
	}

	const fallbackFarmId = String(memberships[0].farm_id);
	saveActiveFarmId(fallbackFarmId);
	return fallbackFarmId;
};

export const initializeAuthSession = (): void => {
	const tokenPair = loadTokenPair();
	setDefaultHeaders(tokenPair?.access_token ?? null);
};
