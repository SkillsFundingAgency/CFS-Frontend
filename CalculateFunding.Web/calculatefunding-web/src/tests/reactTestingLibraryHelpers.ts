import { screen } from "@testing-library/react";

export const showDebugMain = (): void => screen.debug(screen.getByTestId("main-content"), 20000);
