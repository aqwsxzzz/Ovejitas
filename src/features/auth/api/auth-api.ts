import type { ILoginPayload, ILoginResponse, ISignUpPayload, ISignUpResponse, IUser } from "@/features/auth/types/auth-types";
import type { IResponse } from "@/lib/axios";
import { axiosHelper } from "@/lib/axios/axios-helper";

export const signup = ({ payload }: { payload: ISignUpPayload }) => axiosHelper<IResponse<ISignUpResponse>>({ method: "post", url: "/auth/signup", data: payload });

export const login = ({ payload }: { payload: ILoginPayload }) => axiosHelper<IResponse<ILoginResponse>>({ method: "post", url: "/auth/login", data: payload });

export const getUserProfile = () => axiosHelper<IResponse<IUser>>({ method: "get", url: "/auth/me" });
