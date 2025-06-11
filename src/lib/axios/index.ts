import axios from "axios";

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
    status: "success" | "fail";
    data: T;
    message: string;
}
