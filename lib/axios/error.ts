import type {AxiosError} from "axios"
export interface ApiError{
    status: number;
    message: string;
    data?:unknown
}
export function handleAxiosError(error: unknown): ApiError {
    if ((error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError<any>;
        return {
            status: axiosError.response?.status || 500,
            message: 
            axiosError.response?.data?.message || 
            axiosError.message || 
            "Unknown Axios Error",
            data: axiosError.response?.data
        }
    }
    return {
        status: 500,
        message: "Unexpected Error"
    }
}