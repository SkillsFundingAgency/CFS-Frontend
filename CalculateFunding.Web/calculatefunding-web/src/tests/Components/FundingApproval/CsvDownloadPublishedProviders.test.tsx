import "@testing-library/jest-dom/extend-expect";

import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { Store,createStore } from "redux";

import { CsvDownloadPublishedProviders } from "../../../components/Funding/CsvDownloadPublishedProviders";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";

const callBackSpy = jest.fn();

const renderComponent = async (
  specificationId: string,
  publishedProvidersSelected: string[],
  actionType: FundingActionType
) => {
  return render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <Provider store={store}>
          <CsvDownloadPublishedProviders
            specificationId={specificationId}
            actionType={actionType}
            addError={callBackSpy}
          />
        </Provider>
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
};
const store: Store<IStoreState> = createStore(rootReducer);
store.dispatch = jest.fn();

describe("<CsvDownloadPublishedProviders />", () => {
  beforeAll(() => {
    jest.mock("../../../services/publishService", () => {
      const mockService = jest.requireActual("../../../services/publishService");
      return {
        ...mockService,
        generateCsvForApprovalAll: jest.fn(() =>
          Promise.resolve({
            data: {
              url: "http://testing-link",
            },
            status: 200,
          })
        ),
        generateCsvForApprovalBatch: jest.fn(() =>
          Promise.resolve({
            data: {
              url: "http://testing-link",
            },
            status: 200,
          })
        ),
        generateCsvForReleaseBatch: jest.fn(() =>
          Promise.resolve({
            data: {
              url: "http://testing-link",
            },
            status: 200,
          })
        ),
        generateCsvForReleaseAll: jest.fn(() =>
          Promise.resolve({
            data: {
              url: "http://testing-link",
            },
            status: 200,
          })
        ),
      };
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe("<CsvDownloadPublishedProviders /> with the Release Type and no published providers selected", () => {
    test("renders the link correctly", async () => {
      await renderComponent("ABC123", [], FundingActionType.Release);
      waitForElementToBeRemoved(screen.getByText(/Generating export of providers/)).then(() => {
        expect(screen.getByText(/Export all as CSV/) as HTMLAnchorElement).toBeInTheDocument();
      });
    });
  });

  describe("<CsvDownloadPublishedProviders /> with the Release Type and some published providers selected", () => {
    test("renders the link correctly", async () => {
      await renderComponent("ABC123", ["ABC", "DEF"], FundingActionType.Release);
      expect(screen.getByText(/Generating export of providers/)).toBeInTheDocument();
      waitForElementToBeRemoved(document.querySelector("span.loader-inline")).then(() => {
        expect(screen.getByText(/Export all as CSV/) as HTMLAnchorElement).toBeInTheDocument();
      });
    });
  });

  describe("<CsvDownloadPublishedProviders /> with the Approve Type and no published providers selected", () => {
    test("renders the link correctly", async () => {
      await renderComponent("ABC123", [], FundingActionType.Approve);
      waitForElementToBeRemoved(screen.getByText(/Generating export of providers/)).then(() => {
        expect(screen.getByText(/Export all as CSV/) as HTMLAnchorElement).toBeInTheDocument();
      });
    });
  });

  describe("<CsvDownloadPublishedProviders /> with the Approve Type and some published providers selected", () => {
    test("renders the link correctly", async () => {
      await renderComponent("ABC123", ["ABC", "DEF"], FundingActionType.Approve);
      waitForElementToBeRemoved(screen.getByText(/Generating export of providers/)).then(() => {
        expect(screen.getByText(/Export all as CSV/) as HTMLAnchorElement).toBeInTheDocument();
      });
    });
  });
});
