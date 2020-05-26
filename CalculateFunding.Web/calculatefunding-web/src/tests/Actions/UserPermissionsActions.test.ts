import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { IStoreState } from "../../reducers/rootReducer";
import {getUserFundingStreamPermissions, UserPermissionsActionTypes} from "../../actions/UserPermissionsActions";

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const fetchMock = new MockAdapter(axios);

describe("user-permissions-actions", () => {
    beforeEach(() => {
        fetchMock.reset();
    });

    it("fetches user permissions", async () => {
        const payload = [{
            "userId": "",
            "fundingStreamId": "DSG",
            "canAdministerFundingStream": true,
            "canCreateSpecification": true,
            "canEditSpecification": true,
            "canApproveSpecification": true,
            "canDeleteSpecification": false,
            "canEditCalculations": true,
            "canDeleteCalculations": false,
            "canMapDatasets": true,
            "canChooseFunding": true,
            "canRefreshFunding": true,
            "canApproveFunding": true,
            "canReleaseFunding": true,
            "canCreateQaTests": true,
            "canEditQaTests": true,
            "canDeleteQaTests": false,
            "canCreateTemplates": true,
            "canEditTemplates": true,
            "canDeleteTemplates": true,
            "canApproveTemplates": true
        }];

        fetchMock.onGet("/api/users/permissions/fundingstreams").reply(200, payload);

        const expectedActions = [
            { type: UserPermissionsActionTypes.GET_FUNDING_STREAM_PERMISSIONS, payload: payload},
        ];

        const store = mockStore(storeWithData);

        await getUserFundingStreamPermissions()(store.dispatch, () => storeWithData, null);

        expect(store.getActions()).toEqual(expectedActions);
    });
})

const storeWithData: IStoreState = {
    userState: {
        isLoggedIn: false,
        userName: ''
    },
    viewFundingState: {
        fundingStreams: [],
        selectedFundingPeriods: [],
        specificationSelected: false,
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
            specificationId: '',
            userId: ''
        },
        localAuthorities: []
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
    featureFlags: {
        templateBuilderVisible: false
    }
};