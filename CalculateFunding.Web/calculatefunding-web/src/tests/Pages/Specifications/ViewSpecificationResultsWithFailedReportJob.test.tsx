import React from "react";
import {MemoryRouter} from "react-router";
import {render, screen, waitFor} from "@testing-library/react";
import {Route, Switch} from "react-router-dom";
import * as specHook from "../../../hooks/useSpecificationSummary";
import {testSpec} from "../../Hooks/useSpecificationSummary.test";
import {QueryClient, QueryClientProvider} from "react-query";
import * as useLatestSpecificationJobWithMonitoringHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {RunningStatus} from "../../../types/RunningStatus";
import '@testing-library/jest-dom/extend-expect';

function renderViewSpecificationResults() {
    const {ViewSpecificationResults} = require('../../../pages/Specifications/ViewSpecificationResults');
    return render(<MemoryRouter initialEntries={[`/Specifications/ViewSpecificationResults/ABC123`]}>
        <QueryClientProvider client={new QueryClient()}>
            <Switch>
            <Route path="" component={ViewSpecificationResults}/>
        </Switch>
        </QueryClientProvider>
    </MemoryRouter>)
}

const mockSpecification = () => jest.spyOn(specHook, 'useSpecificationSummary')
    .mockImplementation(() => ({
        specification: testSpec,
        isLoadingSpecification: false,
        errorCheckingForSpecification: null,
        haveErrorCheckingForSpecification: false,
        isFetchingSpecification: false,
        isSpecificationFetched: true
    }));
jest.mock("../../../components/AdminNav");


describe("<ViewSpecificationResults /> with failed CSV Generate job  ", () => {
    it("renders error notification badge", async () => {
        mockSpecification();
        renderViewSpecificationResults();

        await waitFor(() => {
            expect(screen.queryByTestId(`notification-badge`) as HTMLSpanElement).toBeInTheDocument()
        });
    });
});

const completedLatestJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    isFetched: true,
    isFetching: false,
    isMonitoring: true,
    latestJob: {
        isComplete: true,
        jobId: "123",
        statusDescription: "string",
        jobDescription: "string",
        runningStatus: RunningStatus.Completed,
        failures: [],
        isSuccessful: true,
        isFailed: true,
        isActive: false
    },
};

jest.spyOn(useLatestSpecificationJobWithMonitoringHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(
    () => (completedLatestJob));
