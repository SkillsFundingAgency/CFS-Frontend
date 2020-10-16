import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {cleanup, render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as hooks from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";

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
jest.spyOn(hooks, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (noJob));

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useSelector: jest.fn(() => ({
        releaseTimetableVisible:false
    }))
}));

const renderViewCalculationResultsPage = () => {
    const {ViewSpecification} = require('../../../pages/Specifications/ViewSpecification');
    return render(<MemoryRouter initialEntries={['/ViewSpecification/SPEC123']}>
        <Switch>
            <Route path="/ViewSpecification/:specificationId" component={ViewSpecification}/>
        </Switch>
    </MemoryRouter>)
};

beforeAll(() => {
    function mockSpecificationService() {
        const specificationService = jest.requireActual('../../../services/specificationService');
        return {
            ...specificationService,
            getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                data: {
                    name: "Specification Name",
                    id: "SPEC123",
                    approvalStatus: "Draft",
                    isSelectedForFunding: true,
                    description: "Test Description",
                    providerVersionId: "PROVID123",
                    fundingStreams: ["PSG"],
                    fundingPeriod: {
                        id: "fp123",
                        name: "fp 123"
                    }
                }
            }))
        }
    }

    jest.mock('../../../services/specificationService', () => mockSpecificationService());
});

afterEach(cleanup);

describe("<ViewSpecification /> service call checks ", () => {
      it("it calls the specificationService", async () => {
        const {getSpecificationSummaryService} = require('../../../services/specificationService');
        renderViewCalculationResultsPage();
        await waitFor(() => expect(getSpecificationSummaryService).toBeCalled())
    });
});