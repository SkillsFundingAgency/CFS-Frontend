import * as redux from "react-redux";
import { createStore, Store } from "redux";

import { IStoreState, rootReducer } from "../../reducers/rootReducer";
import { FundingSearchSelectionState } from "../../states/FundingSearchSelectionState";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { buildInitialPublishedProviderSearchRequest } from "../../types/publishedProviderSearchRequest";

const store: Store<IStoreState> = createStore(rootReducer);
const useSelectorSpy = jest.spyOn(redux, "useSelector");

const createFundingSearchSelectionState = (
  overrides: Partial<FundingSearchSelectionState> = {}
): FundingSearchSelectionState => {
  return {
    selectedProviderIds: [],
    searchCriteria: buildInitialPublishedProviderSearchRequest({
      fundingStreamId: "fundingStream.id",
      fundingPeriodId: "fundingPeriod.id",
      specificationId: "testSpec.id",
      fundingAction: FundingActionType.Approve,
    }),
    ...overrides,
  };
};

const setupFundingSearchSelectionState = (state: FundingSearchSelectionState) => {
  useSelectorSpy.mockReturnValue(state);
};

export const reduxMockingUtils = {
  store,
  useSelectorSpy,
  createFundingSearchSelectionState,
  setupFundingSearchSelectionState,
};
