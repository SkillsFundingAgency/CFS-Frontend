import { screen, waitForElementToBeRemoved } from "@testing-library/react";

export const showDebugMain = (): void => screen.debug(screen.getByTestId("main-content"), 20000);

export const waitForLoadingToFinish = async ({ timeout = 4000 } = {}) => {
  if (screen.queryAllByTestId("loader")?.length || screen.queryAllByText(/loading/, { exact: false })?.length)
    await waitForElementToBeRemoved(
      () => [
        ...screen.queryAllByTestId("loader", { exact: false }),
        ...screen.queryAllByText(/loading/, { exact: false }),
      ],
      { timeout }
    );
};

export const reactTesting = {
  showDebugMain,
  waitForElementToBeRemoved,
};
