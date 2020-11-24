import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios"
import MockAdapter from "axios-mock-adapter";
import {IStoreState} from "../../reducers/rootReducer";
import {getUserFundingStreamPermissions, UserActionEvent} from '../../actions/userAction';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const fetchMock = new MockAdapter(axios);

describe("user-permissions-actions", () => {
    beforeEach(() => {
        fetchMock.reset();
    });

    it("fetches user permissions", async () => {
        const payload = [{
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
            canApproveTemplates: false,
            canCreateTemplates: false,
            canDeleteTemplates: false,
            canEditTemplates: false,
            fundingStreamId: 'DSG',
            userId: ''
        }];

        fetchMock.onGet("/api/users/permissions/fundingstreams").reply(200, payload);

        const expectedActions = [
            {type: UserActionEvent.GET_FUNDING_STREAM_PERMISSIONS, payload: payload},
        ];

        const store = mockStore(storeWithData);

        await getUserFundingStreamPermissions()(store.dispatch, () => storeWithData.userState, null);

        expect(store.getActions()).toEqual(expectedActions);
    });
});

const storeWithData: IStoreState = {
    userState: {
        isLoggedIn: false,
        userName: '',
        fundingStreamPermissions: [],
        hasConfirmedSkills: true
    },
    featureFlags: {
        templateBuilderVisible: false,
        enableReactQueryDevTool: false,
        releaseTimetableVisible: false,
        profilingPatternVisible: false
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
            templateIds: {},
            dataDefinitionRelationshipIds: []
        }
    },
    fundingSearchSelection: {
        providerVersionIds: [],
        searchCriteria: undefined
    }
};