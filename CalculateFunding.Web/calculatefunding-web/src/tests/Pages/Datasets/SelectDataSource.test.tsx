import React from 'react';
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {SelectDataSourceRouteProps} from "../../../pages/Datasets/SelectDataSource";
import {render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import * as useRelationshipDataHook from "../../../hooks/useRelationshipData";
import * as useLatestEntityJobWithMonitoringHook from "../../../hooks/Jobs/useLatestEntityJobWithMonitoring";
import * as useLatestSpecificationJobWithMonitoringHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {
    LatestSpecificationJobWithMonitoringResult, 
    useLatestSpecificationJobWithMonitoring
} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as useSpecificationSummaryHook from "../../../hooks/useSpecificationSummary";
import {SpecificationSummaryQueryResult} from "../../../hooks/useSpecificationSummary";
import {RelationshipData} from "../../../types/Datasets/RelationshipData";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {JobType} from "../../../types/jobType";
import {RunningStatus} from "../../../types/RunningStatus";
import {RelationshipDataQueryResult} from "../../../hooks/useRelationshipData";
import {getJobDetailsFromJobResponse} from "../../../helpers/jobDetailsHelper";
import {QueryClient, QueryClientProvider} from "react-query";
import {Permission} from "../../../types/Permission";

jest.spyOn(global.console, 'info').mockImplementation(() => jest.fn());
jest.mock("../../../components/AdminNav");

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<SelectDataSourceRouteProps> = {
    params: {
        datasetRelationshipId: "123"
    },
    path: "",
    isExact: true,
    url: ""
};
const mockRelationshipData: RelationshipData = {
    specificationId: "asdfga",
    datasets: [],
    definitionId: "asdfa",
    definitionName: "Definition name",
    relationshipId: "34524",
    relationshipName: "relationship name",
    specificationName: "Spec Name"
};
const mockSpecification: SpecificationSummary = {
    id: "asdfga",
    name: "Wizard Spec",
    approvalStatus: "",
    description: "",
    fundingPeriod: {id: "", name: "The Distant Future, 2000"},
    fundingStreams: [],
    isSelectedForFunding: false,
    providerVersionId: "",
    templateIds: {},
    dataDefinitionRelationshipIds: []
};
const specificationResult: SpecificationSummaryQueryResult = {
    specification: mockSpecification,
    isLoadingSpecification: false,
    errorCheckingForSpecification: null,
    haveErrorCheckingForSpecification: false,
    isFetchingSpecification: false,
    isSpecificationFetched: false,
};
const relationshipResult : RelationshipDataQueryResult ={
    relationshipData :mockRelationshipData,
    errorLoadingRelationshipData:"",
    isErrorLoadingRelationshipData: false,
    isLoadingRelationshipData: false
}
const noJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: false,
    isCheckingForJob: false,
    latestJob: undefined,
    isFetched: true,
    isFetching: false
};
const activeRunConverterDatasetMergeJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobResponse({
        jobId: "kdfghjboer",
        jobType: JobType.RunConverterDatasetMergeJob,
        invokerUserDisplayName: "test user",
        runningStatus: RunningStatus.InProgress,
        created: new Date(),
        lastUpdated: new Date()
    }),
    isFetched: true,
    isFetching: false
};
const activeJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobResponse({
        jobId: "kdfghjboer",
        jobType: JobType.MapDatasetJob,
        invokerUserDisplayName: "test user",
        runningStatus: RunningStatus.InProgress,
        created: new Date(),
        lastUpdated: new Date()
    }),
    isFetched: true,
    isFetching: false
};
const withoutPermissions: SpecificationPermissionsResult = {
    userId: "3456",
    isCheckingForPermissions: false,
    hasPermission: () => false,
    hasMissingPermissions: true,
    isPermissionsFetched: true,
    permissionsEnabled: [],
    permissionsDisabled: [Permission.CanMapDatasets],
    missingPermissions: [Permission.CanMapDatasets],
};
const withPermissions: SpecificationPermissionsResult = {
    userId: "3456",
    isCheckingForPermissions: false,
    hasPermission: () => true,
    hasMissingPermissions: false,
    isPermissionsFetched: true,
    permissionsEnabled: [Permission.CanMapDatasets],
    permissionsDisabled: [],
    missingPermissions: [],
};

const renderPage = () => {
    const {SelectDataSource} = require("../../../pages/Datasets/SelectDataSource");
    return render(
        <MemoryRouter>
            <QueryClientProvider client={new QueryClient()}>
                <SelectDataSource match={matchMock} location={location} history={history}/>
            </QueryClientProvider>
        </MemoryRouter>);
};

describe("<SelectDataSource/>", () => {
    describe("when user without mapping permissions", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withoutPermissions));
            jest.spyOn(useSpecificationSummaryHook, 'useSpecificationSummary').mockImplementation(() => (specificationResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            renderPage();
        });

        it("renders permissions alert", () => {
            expect(screen.getByTestId('permission-alert-message')).toBeInTheDocument();
        });

        it("does not render dataset relationship", () => {
            expect(screen.queryByText('Select data source file')).not.toBeInTheDocument();
        });

        it("save button is disabled", () => {
            const button = screen.getByRole('button', {name: /saveButton/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it("back button is enabled", () => {
            const button = screen.getByRole('button', {name: /backButton/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it("cancel button is hidden", () => {
            const button = screen.queryByRole('button', {name: /cancelButton/}) as HTMLButtonElement;
            expect(button).not.toBeInTheDocument();
        });
    });

    describe("when user with permissions", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withPermissions));
            jest.spyOn(useSpecificationSummaryHook, 'useSpecificationSummary').mockImplementation(() => (specificationResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            renderPage();
        });

        it("does not render permissions alert", () => {
            expect(screen.queryByTestId('permission-alert-message')).not.toBeInTheDocument();
        });

        it("save button is disabled by default", () => {
            const button = screen.getByRole('button', {name: /saveButton/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it("back button is hidden", () => {
            const button = screen.getByRole('button', {name: /cancelButton/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it("cancel button is enabled", () => {
            const button = screen.queryByRole('button', {name: /backButton/}) as HTMLButtonElement;
            expect(button).not.toBeInTheDocument();
        });
    });

    describe("when specification summary loaded", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withPermissions));
            jest.spyOn(useSpecificationSummaryHook, 'useSpecificationSummary').mockImplementation(() => (specificationResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            renderPage();
        });

        it("renders correct specification name", () => {
            expect(screen.getAllByText(mockSpecification.name)).toHaveLength(2);
        });

        it("renders correct funding period", () => {
            expect(screen.getByText(mockSpecification.fundingPeriod.name)).toBeInTheDocument();
        });
    });

    describe("when relationship data loaded", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withPermissions));
            jest.spyOn(useSpecificationSummaryHook, 'useSpecificationSummary').mockImplementation(() => (specificationResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            jest.spyOn(useLatestEntityJobWithMonitoringHook, 'useLatestEntityJobWithMonitoring').mockImplementation(() => (noJob));
            renderPage();
        });

        it("renders correct title", async () => {
            await waitFor(() => expect(screen.getByText('Select data source file')).toBeInTheDocument());
        });
    });

    describe("when background job is running", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withPermissions));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(() => (relationshipResult));jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            jest.spyOn(useLatestEntityJobWithMonitoringHook, 'useLatestEntityJobWithMonitoring').mockImplementation(() => (activeJob));
            jest.spyOn(useLatestSpecificationJobWithMonitoringHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(()=> noJob);
            renderPage();
        });

        it("renders correct title", async () => {
            const activeJobTitle = screen.getByTestId('job-notification-title');
            expect(activeJobTitle).toBeInTheDocument();
            expect(activeJobTitle).toHaveTextContent("Job in progress: Mapping dataset");
        });

        it("save button is hidden", () => {
            const button = screen.queryByRole('button', {name: /saveButton/}) as HTMLButtonElement;
            expect(button).not.toBeInTheDocument();
        });

        it("back button is enabled", () => {
            const button = screen.getByRole('button', {name: /backButton/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it("cancel button is hidden", () => {
            const button = screen.queryByRole('button', {name: /cancelButton/}) as HTMLButtonElement;
            expect(button).not.toBeInTheDocument();
        });
    });

    describe("when background converter wizard job is running", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withPermissions));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(() => (relationshipResult));jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            jest.spyOn(useLatestEntityJobWithMonitoringHook, 'useLatestEntityJobWithMonitoring').mockImplementation(() => (noJob));
            jest.spyOn(useLatestSpecificationJobWithMonitoringHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (activeRunConverterDatasetMergeJob));
            renderPage();
        });

        it("renders correct title", async () => {
            expect(screen.getByText("Job in progress: Running Converter Wizard")).toBeInTheDocument();
        });

        it("displays converter wizard running warning", async () => {
            expect(screen.getByText("Mapping of this dataset is disabled until converter wizard completes.")).toBeInTheDocument();
        });

        it("save button is disabled", () => {
            const button = screen.getByRole('button', {name: /saveButton/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });
    });

    describe("when background converter wizard job is not running", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withPermissions));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(() => (relationshipResult));jest.spyOn(useRelationshipDataHook, 'useRelationshipData').mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            jest.spyOn(useLatestSpecificationJobWithMonitoringHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(()=> noJob);
            renderPage();
        });

        it("does not show job in progress title", () => {
            expect(screen.queryByText("Job in progress: Running Converter Wizard")).not.toBeInTheDocument();
        });

        it("does not display converter wizard running warning", () => {
            expect(screen.queryByText("Mapping of this dataset is disabled until converter wizard completes.")).not.toBeInTheDocument();
        });
    });
});
