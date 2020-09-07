import React from 'react';
import {match, MemoryRouter} from "react-router";
import {FundingApprovalResults, FundingApprovalResultsRoute} from "../../../pages/FundingApprovals/FundingApprovalResults";
import {createLocation, createMemoryHistory} from "history";
import {render, screen, waitFor} from "@testing-library/react";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {JobSummary} from "../../../types/jobSummary";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

const history = createMemoryHistory();
const location = createLocation("","","");
const matchMock : match<FundingApprovalResultsRoute> = {
    params: {
        specificationId: "ABC123",
        fundingStreamId: "FS123",
        fundingPeriodId: "FP123"
    },
    path:"",
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
    isSelectedForFunding: false,
    providerVersionId: ""
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

const renderPage = () => {
    const {FundingApprovalResults} = require('../../../pages/FundingApprovals/FundingApprovalResults');
    return render(<MemoryRouter><FundingApprovalResults location={location} history={history} match={matchMock} /></MemoryRouter>);
};

describe("<FundingApprovalResults />", () => {
    beforeEach(() => {
        mockGetSpecification(testSpec);
        mockGetJobs([]);
    });
    it('renders Specification loading', async () => {
        const {getByTestId} = renderPage();
        await waitFor(() => expect(getByTestId("loadingSpecification")).not.toBeNull());
    });
    it('renders job loading', async () => {
        const {getByTestId} = renderPage();
        await waitFor(() => expect(getByTestId("loadingJobs")).not.toBeNull());
    });
});