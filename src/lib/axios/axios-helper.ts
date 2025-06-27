import { axiosInstance } from "@/lib/axios";
import { AxiosError, type AxiosResponse } from "axios";

export const axiosHelper = async <Res, Params = unknown, Data = unknown>({
    method,
    url,
    urlParams,
    data,
    headers,
}: {
    method: "get" | "post" | "put" | "delete" | "patch";
    url: string;
    urlParams?: Params;
    data?: Data;
    headers?: {
        Authorization?: `Bearer ${string}`;
    };
}): Promise<Res> => {
    const config = {
        headers,
        params: urlParams,
    };

    try {
        let response: AxiosResponse<Res>;

        if (method === "get" || method === "delete") {
            response = await axiosInstance[method]<Res>(url, config);
        } else {
            response = await axiosInstance[method]<Res>(url, data, config);
        }

        if (!response || !response.data) {
            throw new Error("No response or response data is undefined");
        }

        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
            throw error.response.data?.data || error.response.data;
        }
        throw error;
    }
};
