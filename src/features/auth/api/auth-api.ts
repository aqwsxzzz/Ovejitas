import type {
	IRefreshPayload,
	ILoginPayload,
	IMeResponse,
	ISignUpPayload,
	ITokenPair,
} from "@/features/auth/types/auth-types";
import { axiosHelper } from "@/lib/axios/axios-helper";
import { axiosInstance } from "@/lib/axios";

export const signup = ({ payload }: { payload: ISignUpPayload }) =>
	axiosHelper<ITokenPair>({
		method: "post",
		url: "/api/v1/auth/register",
		data: {
			name: payload.displayName,
			email: payload.email.trim().toLowerCase(),
			password: payload.password,
		},
	});

export const login = ({ payload }: { payload: ILoginPayload }) =>
	axiosHelper<ITokenPair>({
		method: "post",
		url: "/api/v1/auth/login",
		data: {
			...payload,
			email: payload.email.trim().toLowerCase(),
		},
	});

export const getUserProfile = () =>
	axiosHelper<IMeResponse>({ method: "get", url: "/api/v1/auth/me" });

export const refreshTokenPair = ({ payload }: { payload: IRefreshPayload }) =>
	axiosHelper<ITokenPair>({
		method: "post",
		url: "/api/v1/auth/refresh",
		data: payload,
	});

export const refreshTokenPairSilently = async ({
	payload,
}: {
	payload: IRefreshPayload;
}): Promise<ITokenPair> => {
	const response = await axiosInstance.post<ITokenPair>(
		"/api/v1/auth/refresh",
		payload,
		{
			_skipAuthRefresh: true,
		},
	);

	return response.data;
};
