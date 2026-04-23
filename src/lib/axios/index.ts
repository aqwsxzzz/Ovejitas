import axios from "axios";

declare module "axios" {
	export interface AxiosRequestConfig<D = any> {
		_skipAuthRefresh?: boolean;
	}
}

export const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
});

export const setDefaultHeaders = (token: string | null) => {
	if (!token) {
		delete axiosInstance.defaults.headers.common["Authorization"];
	} else {
		axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	}
};

export interface IResponse<T> {
	status: "success" | "fail" | "error";
	data: T;
	message: string;
	meta?: {
		timestamp?: string;
		pagination?: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	};
}

export interface IResponseDataArray<T> {
	status: "success" | "fail";
	data: { created: T };
	message: string;
}
