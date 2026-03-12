import { axiosInstance } from "@/lib/axios";
import { AxiosError, type AxiosResponse } from "axios";

export type ApiErrorCode =
	| "validation_error"
	| "unauthorized_error"
	| "forbidden_error"
	| "not_found_error"
	| "conflict_error"
	| "network_error"
	| "unknown_error";

export class ApiRequestError extends Error {
	statusCode?: number;
	code: ApiErrorCode;
	details?: unknown;

	constructor(
		message: string,
		code: ApiErrorCode,
		statusCode?: number,
		details?: unknown,
	) {
		super(message);
		this.name = "ApiRequestError";
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
	}
}

const getErrorCodeByStatus = (statusCode?: number): ApiErrorCode => {
	if (!statusCode) {
		return "network_error";
	}

	if (statusCode === 400) {
		return "validation_error";
	}

	if (statusCode === 401) {
		return "unauthorized_error";
	}

	if (statusCode === 403) {
		return "forbidden_error";
	}

	if (statusCode === 404) {
		return "not_found_error";
	}

	if (statusCode === 409) {
		return "conflict_error";
	}

	return "unknown_error";
};

const getDefaultErrorMessageByStatus = (statusCode?: number): string => {
	if (!statusCode) {
		return "Network error. Please verify your connection and try again.";
	}

	if (statusCode === 400) {
		return "Please review the provided information and try again.";
	}

	if (statusCode === 401) {
		return "Your session is not valid. Please sign in again.";
	}

	if (statusCode === 403) {
		return "You do not have permission to perform this action.";
	}

	if (statusCode === 404) {
		return "Requested resource was not found.";
	}

	if (statusCode === 409) {
		return "This resource already exists.";
	}

	return "Unable to complete the request at this time.";
};

const getResponseMessage = (responseData: unknown): string | undefined => {
	if (
		typeof responseData === "object" &&
		responseData !== null &&
		"message" in responseData &&
		typeof (responseData as { message?: unknown }).message === "string"
	) {
		return (responseData as { message: string }).message;
	}

	return undefined;
};

export const axiosHelper = async <Res, Params = unknown, Data = unknown>({
	method,
	url,
	urlParams,
	data,
	headers,
	withCredentials,
	errorMessagesByStatus,
}: {
	method: "get" | "post" | "put" | "delete" | "patch";
	url: string;
	urlParams?: Params;
	data?: Data;
	headers?: {
		Authorization?: `Bearer ${string}`;
	};
	withCredentials?: boolean;
	errorMessagesByStatus?: Partial<Record<number, string>>;
}): Promise<Res> => {
	return axiosInstance
		.request<Res>({
			method,
			url,
			params: urlParams,
			data,
			headers,
			withCredentials,
		})
		.then((res: AxiosResponse<Res>) => {
			if (!res || !res.data) {
				throw new Error("No response or response data is undefined");
			}

			return res.data as Res;
		})
		.catch((error: unknown) => {
			if (error instanceof AxiosError) {
				const statusCode = error.response?.status;
				const responseData = error.response?.data;
				const responseMessage = getResponseMessage(responseData);
				const mappedMessage =
					(statusCode ? errorMessagesByStatus?.[statusCode] : undefined) ??
					responseMessage ??
					getDefaultErrorMessageByStatus(statusCode);

				throw new ApiRequestError(
					mappedMessage,
					getErrorCodeByStatus(statusCode),
					statusCode,
					responseData,
				);
			}
			throw error;
		});
};
