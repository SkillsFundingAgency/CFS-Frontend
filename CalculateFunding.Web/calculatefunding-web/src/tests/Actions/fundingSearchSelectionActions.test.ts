﻿import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import {
  FundingSearchSelectionActionEvent,
  TextSearchModel,
  updateSearchTextFilter,
} from "../../actions/FundingSearchSelectionActions";
import { IStoreState } from "../../reducers/rootReducer";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const fetchMock = new MockAdapter(axios);

describe("fundingSearchSelectionActions tests", () => {
  beforeEach(() => {
    fetchMock.reset();
  });

  it("updates search criteria by search term and search fields", async () => {
    const payload: TextSearchModel = { searchTerm: "Ascendio", searchFields: ["spells"] };

    const expectedActions = [
      { type: FundingSearchSelectionActionEvent.UPDATE_SEARCH_TEXT_FILTER, payload: payload },
    ];

    const store = mockStore(storeWithData);

    await updateSearchTextFilter(payload)(store.dispatch, () => storeWithData.fundingSearchSelection, null);

    expect(store.getActions()).toEqual(expectedActions);
  });
});

const storeWithData: IStoreState = {
  userState: {
    isLoggedIn: false,
    userName: "",
    fundingStreamPermissions: [],
    hasConfirmedSkills: true,
  },
  jobObserverState: { jobFilter: undefined },
  featureFlags: {
    templateBuilderVisible: false,
    enableReactQueryDevTool: false,
    releaseTimetableVisible: false,
    profilingPatternVisible: false,
    specToSpec: false,
    enableNewFundingManagement: false,
  },
  fundingSearchSelection: {
    selectedProviderIds: [],
    searchCriteria: undefined,
  },
};
