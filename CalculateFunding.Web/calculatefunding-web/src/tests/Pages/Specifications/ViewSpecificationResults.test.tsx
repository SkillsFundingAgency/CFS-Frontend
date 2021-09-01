import React from "react";
import {MemoryRouter} from "react-router";
import {render, screen} from "@testing-library/react";
import {Route, Switch} from "react-router-dom";
import {waitFor} from "@testing-library/dom";
import * as specHook from "../../../hooks/useSpecificationSummary";
import * as useLatestSpecificationJobWithMonitoringHook
    from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {QueryClient, QueryClientProvider} from "react-query";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {RunningStatus} from "../../../types/RunningStatus";
import {SpecificationSummaryQueryResult} from "../../../hooks/useSpecificationSummary";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {ProviderDataTrackingMode} from "../../../types/Specifications/ProviderDataTrackingMode";

describe("<ViewSpecificationResults />", () => {

    describe("with specification chosen for funding", () => {

        beforeEach(() => {
            hasCompletedJob();
            hasSpecification(testSpecChosenForFunding);
        })

        afterEach(jest.clearAllMocks);

        it("shows the specification name", async () => {
            renderViewSpecificationResults();
            expect(await screen.findByRole('heading', {name: testSpecChosenForFunding.name})).toBeInTheDocument();
        });

        it("shows the specification funding period", async () => {
            renderViewSpecificationResults();
            expect(await screen.findByText(testSpecChosenForFunding.fundingPeriod.name)).toBeInTheDocument();
        });

        it("shows the correct tabs", async () => {
            renderViewSpecificationResults();
            expect(screen.getByTestId("tab-fundingline-structure")).toBeInTheDocument();
            expect(screen.getByTestId("tab-additional-calculations")).toBeInTheDocument();
            expect(screen.getByTestId("tab-downloadable-reports")).toBeInTheDocument();
        });

        it("does not show error notification badge given job has not failed", async () => {
            renderViewSpecificationResults();
            await waitFor(() => {
                expect(screen.queryByTestId(`notification-badge`) as HTMLSpanElement).not.toBeInTheDocument()
            });
        });

        it("shows the Chosen for funding tab", async () => {
            renderViewSpecificationResults();
            expect(await screen.findByText(/Chosen for funding/)).toBeInTheDocument();
        });

        it("shows the View funding link", async () => {
            renderViewSpecificationResults();
            const link = screen.getByRole("link", {name: /View funding/});
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href',
                `/Approvals/SpecificationFundingApproval/${testSpecChosenForFunding.fundingStreams[0].id}/${testSpecChosenForFunding.fundingPeriod.id}/${testSpecChosenForFunding.id}`);
        });

        it('renders the link to the specification results page', async () => {
            renderViewSpecificationResults();

            const link = screen.getByRole("link", {name: /Manage specification/}) as HTMLAnchorElement;
            expect(link).toBeInTheDocument();
            expect(link.getAttribute("href")).toBe(`/ViewSpecification/${testSpecChosenForFunding.id}`);
        })
    });

    describe("with specification NOT chosen for funding", () => {

        beforeEach(() => {
            hasCompletedJob();
            hasSpecification(testSpecNotChosenForFunding);
        })

        afterEach(jest.clearAllMocks);

        it("shows the specification name", async () => {
            renderViewSpecificationResults();
            expect(await screen.findByRole('heading', {name: testSpecNotChosenForFunding.name})).toBeInTheDocument();
        });

        it("does not show the View Funding Link", async () => {
            renderViewSpecificationResults();
            expect(screen.queryByRole("link", {name: /View funding/})).not.toBeInTheDocument();
        });

        it("does not show the Chosen for funding tag", async () => {
            renderViewSpecificationResults();
            expect(screen.queryByText(/Chosen for funding/)).not.toBeInTheDocument();
        });

        it('renders the link to the specification results page', async () => {
            renderViewSpecificationResults();

            const link = screen.getByRole("link", {name: /Manage specification/}) as HTMLAnchorElement;
            expect(link).toBeInTheDocument();
            expect(link.getAttribute("href")).toBe(`/ViewSpecification/${testSpecNotChosenForFunding.id}`);
        })
    });

});

const testSpecChosenForFunding: SpecificationSummary = {
    id: "ABC123",
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    name: "Wizard Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: {
        id: "FP123",
        name: "2019-20"
    },
    fundingStreams: [{
        id: "FS123",
        name: "Wizard Training Scheme"
    }],
    isSelectedForFunding: true,
    providerVersionId: "",
    templateIds: {},
    dataDefinitionRelationshipIds: []
};
const testSpecNotChosenForFunding: SpecificationSummary = {
    id: "RE2945",
    coreProviderVersionUpdates: ProviderDataTrackingMode.UseLatest,
    name: "Circuit Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: {
        id: "KF123",
        name: "2019-20"
    },
    fundingStreams: [{
        name: "RE123",
        id: "Circuit Training Scheme"
    }],
    isSelectedForFunding: false,
    providerVersionId: "",
    templateIds: {},
    dataDefinitionRelationshipIds: []
};

const completedLatestJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    isFetched: true,
    isFetching: false,
    latestJob: {
        isComplete: true,
        jobId: "123",
        statusDescription: "string",
        jobDescription: "string",
        runningStatus: RunningStatus.Completed,
        failures: [],
        isSuccessful: true,
        isFailed: false,
        isActive: false
    },
};


const hasCompletedJob = () => jest
    .spyOn(useLatestSpecificationJobWithMonitoringHook, 'useLatestSpecificationJobWithMonitoring')
    .mockImplementation(() => (completedLatestJob));

const specResult = (spec: SpecificationSummary): SpecificationSummaryQueryResult => {
    return {
        clearSpecificationFromCache: () => Promise.resolve(),
        specification: spec,
        isLoadingSpecification: false,
        errorCheckingForSpecification: null,
        haveErrorCheckingForSpecification: false,
        isFetchingSpecification: false,
        isSpecificationFetched: true
    }
};

const hasSpecification = (spec: SpecificationSummary) => jest
    .spyOn(specHook, 'useSpecificationSummary')
    .mockImplementation(() => (specResult(spec)));

jest.mock("../../../components/AdminNav");
jest.mock("../../../components/fundingLineStructure/FundingLineResults");
jest.mock("../../../components/Calculations/AdditionalCalculations");
jest.mock("../../../components/Reports/DownloadableReports");


const renderViewSpecificationResults = () => {
    const {ViewSpecificationResults} = require('../../../pages/Specifications/ViewSpecificationResults');

    return  render(<MemoryRouter
        initialEntries={[`/Specifications/ViewSpecificationResults/${testSpecChosenForFunding.id}`]}>
        <QueryClientProvider client={new QueryClient()}>
            <Switch>
                <Route path="/Specifications/ViewSpecificationResults/:specificationId"
                       component={ViewSpecificationResults}/>
            </Switch>
        </QueryClientProvider>
    </MemoryRouter>);
}
