import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { FeatureFlagsActionTypes, getFeatureFlags } from "../../actions/FeatureFlagsActions";
import { IStoreState } from "../../reducers/rootReducer";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const fetchMock = new MockAdapter(axios);

describe("featureflagsactions", () => {
  beforeEach(() => {
    fetchMock.reset();
  });

  it("fetches feature flags", async () => {
    const featureFlagsPayload = [
      { name: "EnableVariations", isEnabled: true },
      { name: "TemplateBuilderVisible", isEnabled: false },
    ];

    fetchMock.onGet("/api/featureflags").reply(200, featureFlagsPayload);

    const expectedActions = [
      { type: FeatureFlagsActionTypes.GET_FEATUREFLAGS, payload: featureFlagsPayload },
    ];

    const store = mockStore(storeWithData);

    await getFeatureFlags()(store.dispatch, () => storeWithData, null);

    expect(store.getActions()).toEqual(expectedActions);
  });
});

const storeWithData: IStoreState = {
  userState: {
    isLoggedIn: false,
    userName: "",
    hasConfirmedSkills: true,
    fundingStreamPermissions: [],
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
