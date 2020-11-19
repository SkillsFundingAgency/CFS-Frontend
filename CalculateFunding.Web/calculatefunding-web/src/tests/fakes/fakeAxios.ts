import {AxiosError} from "axios";

export function createMockAxiosError(data: any, status: number = 400, message: string = "This is a mock Axios error") {
    const mockError: AxiosError = {
        toJSON(): object {
            return {};
        },
        config: {},
        isAxiosError: true,
        message: message,
        name: "",
        response: {
            request: {},
            status: status,
            data: data,
            headers: {},
            statusText: "",
            config: {}
        }
    };
    return mockError;
}
