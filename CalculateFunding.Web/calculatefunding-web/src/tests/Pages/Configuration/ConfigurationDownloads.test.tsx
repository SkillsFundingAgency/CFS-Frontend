import { render, screen, waitFor } from "@testing-library/react";
import { createBrowserHistory, createLocation } from "history";
import React from "react";
import { QueryClient } from "react-query";
import { match, MemoryRouter } from "react-router";

import { ConfigurationDownloads } from "../../../pages/Configuration/ConfigurationDownloads";
import { fakery } from "../../fakes/fakery";
import { mockApiService } from "../../fakes/mockApiServices";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";

jest.mock("../../../components/AdminNav");

describe("<ConfigurationDownloads /> tests", () => {
  let getProfilePatternsSpy: jest.SpyInstance<Promise<unknown>>;

  afterEach(() => {
    jest.resetAllMocks();
    new QueryClient().getQueryCache().clear();
  });

  describe("After initial page load", () => {
    beforeEach(async () => {
      getProfilePatternsSpy = mockApiService.makeProfilePatternsSpy([
        mockProfilePattern1,
        mockProfilePattern2,
      ]);
    });

    it("calls the correct services on initial page load", async () => {
      await setup();

      await waitFor(() => expect(getProfilePatternsSpy).toBeCalledTimes(1));

      const profileLink = screen.getByText("Period-111-Stream-111-Line-111-Key-111");
      expect(profileLink).toHaveAttribute(
        "href",
        "/api/profiling/patterns/fundingStream/Stream-111/fundingPeriod/Period-111/fundingLineId/Line-111/profilePatternKey/Key-111/fullpattern/download-file"
      );
      expect(profileLink).toHaveAttribute("download");
    });
  });
});

const mockHistoryPush = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const mockProfilePattern1 = fakery.makeFundingStreamPeriodProfilePattern({
  id: "Period-111-Stream-111-Line-111-Key-111",
  fundingLineId: "Line-111",
});
const mockProfilePattern2 = fakery.makeFundingStreamPeriodProfilePattern({
  id: "Period-111-Stream-111-Line-222-Key-111",
  fundingLineId: "Line-222",
});

const mockRoute: match<{ fundingStreamId: string; fundingPeriodId: string }> = {
  isExact: true,
  path: "",
  url: "",
  params: { fundingStreamId: "Stream-111", fundingPeriodId: "Period-111" },
};

const history = createBrowserHistory();
const location = createLocation("", "", "", { search: "", pathname: "", hash: "", key: "", state: "" });

const setup = () =>
  render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <ConfigurationDownloads match={mockRoute} history={history} location={location} />
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
