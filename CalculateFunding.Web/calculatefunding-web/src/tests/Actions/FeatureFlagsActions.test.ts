import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { getFeatureFlags, FeatureFlagsActionTypes } from "../../actions/FeatureFlagsActions";
import { IStoreState } from "../../reducers/rootReducer";

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const fetchMock = new MockAdapter(axios);

describe("featureflagsactions", () => {
  beforeEach(() => {
    fetchMock.reset();
  });

  it("fetches feature flags", async () => {
    const featureFlagsPayload = [{ "name": "EnableVariations", "isEnabled": true }, { "name": "TemplateBuilderVisible", "isEnabled": false }];

    fetchMock.onGet("/api/featureflags").reply(200, featureFlagsPayload);
    
    const expectedActions = [
      { type: FeatureFlagsActionTypes.GET_FEATUREFLAGS, payload: featureFlagsPayload},
    ];

    const store = mockStore(storeWithData);

    await getFeatureFlags()(store.dispatch, () => storeWithData, null);

    expect(store.getActions()).toEqual(expectedActions);
  });
})

const storeWithData: IStoreState = {
  userState: {
    isLoggedIn: false,
    userName: '',
    hasConfirmedSkills: true,
    fundingStreamPermissions: []
  },
  fundingLineStructureState: {
    specificationResult: {
      name: '',
      id: '',
      templateIds: {},
      publishedResultsRefreshedAt: null,
      providerVersionId: '',
      lastCalculationUpdatedAt: '',
      fundingStreams: [],
      fundingPeriod: {
        id: '',
        name: ''
      },
      isSelectedForFunding: false,
      description: '',
      approvalStatus: '',
      lastEditedDate: new Date(),
      dataDefinitionRelationshipIds: []
    },
    fundingLineStructureResult: [],
    fundingLineStatusResult: ''
  },
  viewSpecificationResults: {
    additionalCalculations: {
      lastPage: 0,
      totalCount: 0,
      results: [],
      currentPage: 0,
      endItemNumber: 0,
      facets: [],
      pagerState: {
        currentPage: 0,
        displayNumberOfPages: 0,
        lastPage: 0,
        nextPage: 0,
        pages: [],
        previousPage: 0
      },
      startItemNumber: 0,
      totalErrorResults: 0,
      totalResults: 0
    },
    templateCalculations: {
      totalCount: 0,
      lastPage: 0,
      results: [],
      currentPage: 0,
      endItemNumber: 0,
      facets: [],
      pagerState: {
        currentPage: 0,
        displayNumberOfPages: 0,
        lastPage: 0,
        nextPage: 0,
        pages: [],
        previousPage: 0
      },
      startItemNumber: 0,
      totalErrorResults: 0,
      totalResults: 0
    },
    specification: {
      name: '',
      approvalStatus: '',
      description: '',
      fundingPeriod: {
        id: '',
        name: ''
      },
      fundingStreams: [],
      id: '',
      isSelectedForFunding: false,
      providerVersionId: '',
      dataDefinitionRelationshipIds: [],
      templateIds: {},
    }
  },
  selectSpecification: {
    fundingStreams: [],
    fundingPeriods: [],
    specifications: []
  },
  datasets: {
    dataSchemas: [
      {
        name: '',
        id: '',
        description: '',
        tableDefinitions: []
      }
    ]
  },
  featureFlags: {
    templateBuilderVisible: false,
    enableReactQueryDevTool: false,
    releaseTimetableVisible: false,
    profilingPatternVisible: false
  },
  fundingSearchSelection: {
    providerVersionIds: [],
    searchCriteria: undefined
  }
};