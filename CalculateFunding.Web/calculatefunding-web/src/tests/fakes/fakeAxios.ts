import { AxiosError, AxiosResponse } from "axios";

const error = (data: any, status = 400, message = "This is a mock Axios error") => {
  const mockError: AxiosError = {
    // eslint-disable-next-line @typescript-eslint/ban-types
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
      config: {},
    },
  };
  return mockError;
};

type AxiosResponsePartialWithDataRequired<T> = Omit<Partial<AxiosResponse<T>>, "data"> &
  Pick<AxiosResponse<T>, "data">;

function success<T>(values: AxiosResponsePartialWithDataRequired<T>): Promise<AxiosResponse<T>> {
  return Promise.resolve({
    config: {},
    headers: {},
    status: 200,
    statusText: "OK",
    ...values,
  });
}
function successWithoutResult(): Promise<AxiosResponse> {
  return Promise.resolve({
    config: {},
    headers: {},
    status: 200,
    statusText: "OK",
    data: {},
  });
}

export const fakeAxiosResponse = {
  error,
  success,
  successWithoutResult,
};
