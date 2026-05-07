import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { refreshTokenPairSilently } from "@/features/auth/api/auth-api";
import {
	clearTokenPair,
	loadTokenPair,
	saveTokenPair,
} from "@/features/auth/utils/auth-session";
import { axiosInstance } from "@/lib/axios";

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
	_skipAuthRefresh?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;
let interceptorRegistered = false;

const getRefreshedAccessToken = async (): Promise<string | null> => {
	if (!refreshPromise) {
		const tokenPair = loadTokenPair();

		if (!tokenPair?.refresh_token) {
			clearTokenPair();
			return null;
		}

		refreshPromise = refreshTokenPairSilently({
			payload: { refresh_token: tokenPair.refresh_token },
		})
			.then((nextTokenPair) => {
				saveTokenPair(nextTokenPair);
				return nextTokenPair.access_token;
			})
			.catch(() => {
				clearTokenPair();
				return null;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
};

export const initializeAuthRefreshInterceptor = (): void => {
	if (interceptorRegistered) {
		return;
	}

	axiosInstance.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const requestConfig = error.config as
				| RetryableAxiosRequestConfig
				| undefined;

			if (
				error.response?.status !== 401 ||
				!requestConfig ||
				requestConfig._retry ||
				requestConfig._skipAuthRefresh
			) {
				return Promise.reject(error);
			}

			requestConfig._retry = true;

			const accessToken = await getRefreshedAccessToken();

			if (!accessToken) {
				return Promise.reject(error);
			}

			requestConfig.headers.set("Authorization", `Bearer ${accessToken}`);

			return axiosInstance.request(requestConfig);
		},
	);

	interceptorRegistered = true;
};
