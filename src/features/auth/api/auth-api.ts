import type {
	ILoginPayload,
	ISignUpPayload,
	ISignUpResponse,
	IUser,
} from "@/features/auth/types/auth-types";
import type { IResponse } from "@/lib/axios";
import { axiosHelper } from "@/lib/axios/axios-helper";

export const signup = ({ payload }: { payload: ISignUpPayload }) =>
	axiosHelper<IResponse<ISignUpResponse>>({
		method: "post",
		url: "/auth/signup",
		data: payload,
	});

export const login = ({ payload }: { payload: ILoginPayload }) =>
	axiosHelper<IResponse<IUser>>({
		method: "post",
		url: "/auth/login",
		data: payload,
	});

export const getUserProfile = () =>
	axiosHelper<IResponse<IUser>>({ method: "get", url: "/auth/me" });

export const logout = () =>
	axiosHelper<IResponse<string>>({
		method: "post",
		url: "/auth/logout",
		withCredentials: true,
	});
