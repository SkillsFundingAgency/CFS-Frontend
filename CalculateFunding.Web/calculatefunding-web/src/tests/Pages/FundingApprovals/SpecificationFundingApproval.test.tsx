import React from 'react';
import {match, MemoryRouter} from "react-router";
import {SpecificationFundingApproval, SpecificationFundingApprovalRoute} from "../../../pages/FundingApprovals/SpecificationFundingApproval";
import {createLocation, createMemoryHistory} from "history";
import {render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {JobSummary} from "../../../types/jobSummary";
import {Provider} from "react-redux";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {QueryCache, ReactQueryCacheProvider} from "react-query";
import * as jobHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as specHook from "../../../hooks/useSpecificationSummary";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<SpecificationFundingApprovalRoute> = {
    params: {
        specificationId: "ABC123",
        fundingStreamId: "FS123",
        fundingPeriodId: "FP123"
    },
    url: "",
    path: "",
    isExact: true,
};
export const testSpec: SpecificationSummary = {
    name: "Wizard Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: {
        id: "FP123",
        name: "2019-20"
    },
    fundingStreams: [{
        name: "FS123",
        id: "Wizard Training Scheme"
    }],
    id: "ABC123",
    isSelectedForFunding: true,
    providerVersionId: ""
};
const noJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: false,
    isCheckingForJob: false,
    hasFailedJob: false,
    hasActiveJob: false,
    jobError: "",
    latestJob: undefined,
    hasJobError: false,
    isFetched: true,
    isFetching: false,
    isMonitoring: true,
    jobInProgressMessage: "",
};

function mockGetSpecification(spec: SpecificationSummary) {
    const specService = jest.requireActual('../../../services/specificationService');
    return {
        ...specService,
        getSpecificationSummaryService: jest.fn(() => Promise.resolve({
            data: spec
        }))
    }
}

function mockGetJobs(jobResults: JobSummary[]) {
    const jobService = jest.requireActual('../../../services/jobService');
    return {
        ...jobService,
        getJobStatusUpdatesForSpecification: jest.fn(() => Promise.resolve({
            data: jobResults
        }))
    }
}

const store: Store<IStoreState> = createStore(rootReducer);

const renderPage = () => {
    const {SpecificationFundingApproval} = require('../../../pages/FundingApprovals/SpecificationFundingApproval');
    store.dispatch = jest.fn();
    return render(<MemoryRouter>
        <ReactQueryCacheProvider queryCache={new QueryCache()}>
            <Provider store={store}>
                <SpecificationFundingApproval location={location} history={history} match={matchMock}/>
            </Provider>
        </ReactQueryCacheProvider>
    </MemoryRouter>);
};

describe("<SpecificationFundingApproval /> when page initially renders before loading specification", () => {
    beforeEach(() => {
        renderPage();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders Specification loading', async () => {
        expect(await screen.getByText("Loading specification...")).toBeInTheDocument();
    });
});

describe("<SpecificationFundingApproval /> when loading specification", () => {
    beforeEach(() => {
        jest.spyOn(specHook, 'useSpecificationSummary')
            .mockImplementation(() => ({
                specification: testSpec,
                isLoadingSpecification: false,
                errorCheckingForSpecification: "",
                haveErrorCheckingForSpecification: false,
                isFetchingSpecification: false,
                isSpecificationFetched: true
            }));
        jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (noJob));
        renderPage();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders Specification name', async () => {
        expect(await screen.findByText(testSpec.name)).toBeInTheDocument();
    });
});

describe("<SpecificationFundingApproval /> when specification loads and no active jobs", () => {
    beforeEach(() => {
        mockGetSpecification(testSpec);
        mockGetJobs([]);
        jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (noJob));
        jest.spyOn(specHook, 'useSpecificationSummary')
            .mockImplementation(() => ({
                specification: testSpec,
                isLoadingSpecification: false,
                errorCheckingForSpecification: "",
                haveErrorCheckingForSpecification: false,
                isFetchingSpecification: false,
                isSpecificationFetched: true
            }));

        renderPage();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders Specification name', async () => {
        expect(await screen.findByText(testSpec.name)).toBeInTheDocument();
    });
    
    it('renders no jobs alert after loading no jobs', async () => {
        expect(await screen.queryByText("Job running:")).not.toBeInTheDocument();
    });
});