import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { createStore, Store } from "redux";

import { FundingConfirmationSummary } from "../../../components/Funding/FundingConfirmationSummary";
import { ConfirmFundingRouteProps } from "../../../pages/FundingApprovals/ConfirmFundingOld";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { ApprovalMode } from "../../../types/ApprovalMode";
import {
  FundingActionType,
  PublishedProviderFundingCount,
} from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../../types/viewFundingTypes";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";

const callBackSpy = jest.fn();

const renderComponent = async (
  specificationSummary: SpecificationSummary,
  approvalMode: ApprovalMode,
  fundingSummary: PublishedProviderFundingCount
) => {
  return render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <Provider store={store}>
          <FundingConfirmationSummary
            routingParams={config.mockConfirmApprovalRoute}
            approvalMode={approvalMode}
            specification={specificationSummary}
            fundingSummary={fundingSummary}
            canReleaseFunding={true}
            canApproveFunding={true}
            addError={callBackSpy}
            isWaitingForJob={false}
          />
        </Provider>
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
};

const store: Store<IStoreState> = createStore(rootReducer);
store.dispatch = jest.fn();

const config = setupTestConfig();

function setupTestConfig() {
  const fundingStream: FundingStream = {
    id: "WIZ-123",
    name: "Wizard Training Scheme",
  };
  const fundingPeriod: FundingPeriod = {
    id: "FP123",
    name: "2019-20",
  };
  const testSpec: SpecificationSummary = {
    coreProviderVersionUpdates: undefined,
    name: "Wizard Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: fundingPeriod,
    fundingStreams: [fundingStream],
    id: "ABC123",
    isSelectedForFunding: true,
    providerVersionId: "",
    dataDefinitionRelationshipIds: [],
    templateIds: {},
  };
  const mockConfirmApprovalRoute: ConfirmFundingRouteProps = {
    specificationId: testSpec.id,
    fundingStreamId: fundingStream.id,
    fundingPeriodId: fundingPeriod.id,
    mode: FundingActionType.Approve,
  };
  const mockPublishedProviderFundingZeroCount: PublishedProviderFundingCount = {
    indicativeProviderTotalFunding: 0,
    paidProviderCount: 0,
    paidProvidersTotalFunding: 0,
    count: 0,
    fundingStreamsFundings: [],
    localAuthorities: [],
    localAuthoritiesCount: 0,
    providerTypes: [],
    providerTypesCount: 0,
    indicativeProviderCount: 0,
    totalFunding: 0,
  };
  const mockPublishedProviderFundingProviderCountWithIndicative: PublishedProviderFundingCount = {
    indicativeProviderTotalFunding: 0,
    paidProviderCount: 0,
    paidProvidersTotalFunding: 0,
    count: 2,
    fundingStreamsFundings: [],
    localAuthorities: [],
    localAuthoritiesCount: 0,
    providerTypes: [],
    providerTypesCount: 0,
    indicativeProviderCount: 1,
    totalFunding: 0,
  };

  return {
    fundingStream,
    fundingPeriod,
    testSpec,
    mockConfirmApprovalRoute,
    mockPublishedProviderFundingZeroCount,
    mockPublishedProviderFundingProviderCountWithIndicative,
  };
}

describe("<FundingConfirmationSummary />", () => {
  describe("<FundingConfirmationSummary /> with the Release Type and no published providers selected", () => {
    test("link not rendered", async () => {
      await renderComponent(
        config.testSpec,
        ApprovalMode.Batches,
        config.mockPublishedProviderFundingZeroCount
      );
      expect(screen.queryByText(/Generating export of providers/)).not.toBeInTheDocument();
    });
  });

  describe("<FundingConfirmationSummary /> with the Release Type and 2 published providers selected with 1 indicative", () => {
    test("link not rendered", async () => {
      await renderComponent(
        config.testSpec,
        ApprovalMode.Batches,
        config.mockPublishedProviderFundingProviderCountWithIndicative
      );
      expect(screen.queryByText(/Of which 1 is indicative/)).toBeInTheDocument();
    });
  });
});
