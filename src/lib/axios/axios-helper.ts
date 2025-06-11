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
    return axiosInstance[method]<Res>(url, method === "get" ? { params: urlParams, headers } : data, { headers })
        .then((res: AxiosResponse<Res>) => {
            if (!res || !res.data) {
                throw new Error("No response or response data is undefined");
            }

            return res.data as Res;
        })
        .catch((error: unknown) => {
            if (error instanceof AxiosError) {
                if (error.response) {
                    throw error.response.data.data;
                }
            }
            throw error;
        });
};
