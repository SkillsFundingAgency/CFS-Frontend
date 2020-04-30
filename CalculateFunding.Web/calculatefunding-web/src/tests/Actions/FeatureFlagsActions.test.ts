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
    userName: ''
  },
  fundingLineStructureState: {
    specificationResult: {
      name: '',
      id: '',
      templateIds: {
        PSG: ''
      },
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
      approvalStatus: ''
    },
    fundingLineStructureResult: [],
    fundingLineStatusResult: ''
  },
  viewFundingState: {
    specifications: {
      name: '',
      id: '',
      templateIds: {
        PSG: ''
      },
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
      approvalStatus: ''
    },
    fundingStreams: [],
    selectedFundingPeriods: [],
    specificationSelected: false,
    publishedProviderResults: {
      currentPage: 0,
      endItemNumber: 0,
      facets: [],
      pagerState: {
        currentPage: 1,
        displayNumberOfPages: 0,
        lastPage: 0,
        nextPage: 0,
        pages: [],
        previousPage: 0
      },
      providers: [],
      startItemNumber: 0,
      totalErrorResults: 0,
      totalResults: 0,
      filteredFundingAmount: 0,
      canPublish: false,
      canApprove: false,
      totalFundingAmount: 0,
      totalProvidersToApprove: 0,
      totalProvidersToPublish: 0
    },
    latestRefreshDateResults: '',
    approveFundingJobId: '',
    releaseFundingJobId: '',
    refreshFundingJobId: '',
    filterTypes: [],
    pageState: 'IDLE',
    userPermission: {
      canAdministerFundingStream: false,
      canApproveFunding: false,
      canApproveSpecification: false,
      canChooseFunding: false,
      canCreateQaTests: false,
      canCreateSpecification: false,
      canDeleteCalculations: false,
      canDeleteQaTests: false,
      canDeleteSpecification: false,
      canEditCalculations: false,
      canEditQaTests: false,
      canEditSpecification: false,
      canMapDatasets: false,
      canRefreshFunding: false,
      canReleaseFunding: false,
      canCreateTemplates: false,
      canApproveTemplates: false,
      canDeleteTemplates: false,
      canEditTemplates: false,
      specificationId: '',
      userId: ''
    },
    latestJob: {
      completionStatus: null,
      invokerUserDisplayName: '',
      invokerUserId: '',
      itemCount: 0,
      jobId: '',
      jobType: '',
      outcome: null,
      overallItemsFailed: 0,
      overallItemsProcessed: 0,
      overallItemsSucceeded: 0,
      parentJobId: 0,
      runningStatus: '',
      specificationId: '',
      statusDateTime: '',
      supersededByJobId: 0
    },
    localAuthorities: []
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
      providerVersionId: ''
    }
  },
  viewSpecification: {
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
    specification: {
      name: '',
      approvalStatus: '',
      description: '',
      fundingPeriod: {
        id: '',
        name: ''
      },
      fundingStreams: [
        {
          name: '',
          id: ''
        }
      ],
      id: '',
      isSelectedForFunding: false,
      providerVersionId: ''
    },
    datasets: {
      content: [],
      statusCode: 0
    },
    releaseTimetable: {
      navisionDate: {
        day: '',
        month: '',
        year: '',
        time: ''
      },
      releaseDate: {
        day: '',
        month: '',
        year: '',
        time: ''
      }
    },
    fundingLineStructureResult: [],
    fundingLineStatusResult: '',
    profileVariationPointerResult: []
  },
  selectSpecification: {
    fundingStreams: [],
    fundingPeriods: [],
    specifications: []
  },
  viewCalculationResults: {
    providers: {
      totalResults: 0,
      endItemNumber: 0,
      startItemNumber: 0,
      pagerState: {
        currentPage: 0,
        lastPage: 0,
        previousPage: 0,
        pages: [],
        nextPage: 0,
        displayNumberOfPages: 0
      },
      totalErrorResults: 0,
      facets: [],
      currentPage: 0,
      calculationProviderResults: []
    },
    specification: {
      id: '',
      description: '',
      fundingStreams: [],
      fundingPeriod: {
        name: '',
        id: ''
      },
      name: '',
      providerVersionId: '',
      isSelectedForFunding: false,
      approvalStatus: ''
    },
    calculation: {
      lastUpdatedDateDisplay: '',
      id: '',
      lastUpdatedDate: '2020-04-28T09:26:01.094Z',
      status: '',
      fundingStreamId: '',
      name: '',
      calculationType: '',
      description: null,
      namespace: '',
      specificationId: '',
      specificationName: '',
      valueType: '',
      wasTemplateCalculation: false
    }
  },
  provider: {
    providerSummary: {
      authority: '',
      countryCode: '',
      countryName: '',
      crmAccountId: '',
      dateClosed: '',
      dateOpened: '',
      dfeEstablishmentNumber: '',
      establishmentNumber: '',
      id: '',
      laCode: '',
      legalName: '',
      localGovernmentGroupTypeCode: '',
      localGovernmentGroupTypeName: '',
      name: '',
      navVendorNo: '',
      phaseOfEducation: '',
      postcode: '',
      providerId: '',
      providerProfileIdType: '',
      providerSubType: '',
      providerType: '',
      providerVersionId: '',
      reasonEstablishmentClosed: '',
      reasonEstablishmentOpened: '',
      rscRegionCode: '',
      rscRegionName: '',
      status: '',
      successor: '',
      town: '',
      trustCode: '',
      trustName: '',
      trustStatus: '',
      ukprn: '',
      upin: '',
      urn: ''
    },
    providerTransactionSummary: {
      results: [],
      status: -1,
      latestStatus: '',
      fundingTotal: ''
    },
    profiling: {
      totalAllocation: 0,
      previousAllocation: 0,
      profilingInstallments: []
    }
  },
  specifications: {
    specificationListResults: {
      facets: [],
      items: [],
      pageNumber: 0,
      pageSize: 0,
      totalErrorItems: 0,
      totalItems: 0,
      totalPages: 0
    }
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
    templateBuilderVisible: false
  }
};