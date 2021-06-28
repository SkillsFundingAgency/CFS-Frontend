import React from 'react';
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {SelectDataSourceRouteProps} from "../../../pages/Datasets/SelectDataSource";
import {render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import * as useRelationshipDataHook from "../../../hooks/useRelationshipData";
import {RelationshipDataQueryResult} from "../../../hooks/useRelationshipData";
import * as useSpecificationSummaryHook from "../../../hooks/useSpecificationSummary";
import {SpecificationSummaryQueryResult} from "../../../hooks/useSpecificationSummary";
import {RelationshipData} from "../../../types/Datasets/RelationshipData";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {JobType} from "../../../types/jobType";
import {RunningStatus} from "../../../types/RunningStatus";
import {QueryClient, QueryClientProvider} from "react-query";
import {Permission} from "../../../types/Permission";
import {ProviderDataTrackingMode} from "../../../types/Specifications/ProviderDataTrackingMode";
import {AddJobSubscription, JobNotification, JobSubscription} from "../../../hooks/Jobs/useJobSubscription";
import {DateTime} from "luxon";
import * as jobSubscription from "../../../hooks/Jobs/useJobSubscription";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {getJobDetailsFromJobResponse} from "../../../helpers/jobDetailsHelper";

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
const fundingStream: FundingStream = {
    name: "FS123",
    id: "Wizard Training Scheme"
};
const fundingPeriod: FundingPeriod = {
    id: "FP123",
    name: "2019-20"
};
const mockSpecification: SpecificationSummary = {
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    id: "asdfga",
    name: "Wizard Spec",
    approvalStatus: "",
    description: "",
    fundingPeriod: fundingPeriod,
    fundingStreams: [fundingStream],
    isSelectedForFunding: false,
    providerVersionId: "",
    templateIds: {},
    dataDefinitionRelationshipIds: []
};
const specificationResult: SpecificationSummaryQueryResult = {
    clearSpecificationFromCache(): Promise<void> {
        return Promise.resolve(undefined);
    },
    specification: mockSpecification,
    isLoadingSpecification: false,
    errorCheckingForSpecification: null,
    haveErrorCheckingForSpecification: false,
    isFetchingSpecification: false,
    isSpecificationFetched: false
};
const relationshipResult : RelationshipDataQueryResult ={
    relationshipData :mockRelationshipData,
    errorLoadingRelationshipData:"",
    isErrorLoadingRelationshipData: false,
    isLoadingRelationshipData: false
}
let notification: JobNotification | undefined;
let subscription: JobSubscription | undefined = {
    filterBy: {
        jobTypes: [],
    },
    id: "abc",
    onError: () => {},
    startDate: DateTime.now()
};

const haveNoJobNotification = () => {
    notification = undefined;
}
const haveDataMapJobInProgressNotification = () => {
    notification = {
        subscription: subscription as JobSubscription,
        latestJob: getJobDetailsFromJobResponse({
            jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
            jobType: JobType.MapDatasetJob,
            specificationId: mockSpecification.id,
            outcome: "",
            runningStatus: RunningStatus.InProgress,
            completionStatus: undefined,
            invokerUserId: "testid",
            invokerUserDisplayName: "test user",
            parentJobId: "",
            lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
            created: new Date("2020-11-23T14:36:16.3435836+00:00")
        })
    };
}
const haveConverterWizardJobInProgressNotification = () => {
    notification = {
        subscription: subscription as JobSubscription,
        latestJob: getJobDetailsFromJobResponse({
            jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
            jobType: JobType.RunConverterDatasetMergeJob,
            specificationId: mockSpecification.id,
            outcome: "",
            runningStatus: RunningStatus.InProgress,
            completionStatus: undefined,
            invokerUserId: "testid",
            invokerUserDisplayName: "test user",
            parentJobId: "",
            lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
            created: new Date("2020-11-23T14:36:16.3435836+00:00")
        })
    };
}

const jobSubscriptionSpy = jest.spyOn(jobSubscription, 'useJobSubscription');
jobSubscriptionSpy.mockImplementation(() => {
    return {
        addSub: (request: AddJobSubscription) => {
            const sub: JobSubscription = {
                filterBy: request.filterBy,
                id: "sertdhw4e5t",
                onError: () => null,
                startDate: DateTime.now()
            }
            subscription = sub;
            return Promise.resolve(sub as JobSubscription);
        },
        replaceSubs: _ => {return []},
        removeSub: _ => {},
        removeAllSubs: () => {},
        subs: [subscription] as JobSubscription[],
        results: notification ? [notification] : []
    }
});

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
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions')
                .mockImplementation(() => (withoutPermissions));
            jest.spyOn(useSpecificationSummaryHook, 'useSpecificationSummary')
                .mockImplementation(() => (specificationResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            haveNoJobNotification();
            renderPage();
        });

        it("renders permissions alert", () => {
            expect(screen.getByTestId('permission-alert-message')).toBeInTheDocument();
        });

        it("does not render dataset relationship", () => {
            expect(screen.queryByText('Select data source file')).not.toBeInTheDocument();
        });

        it("save button is disabled", () => {
            const button = screen.getByRole('button', {name: /Save/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it("back button is enabled", () => {
            const button = screen.getByRole('button', {name: /Back/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it("cancel button is hidden", () => {
            const button = screen.queryByRole('button', {name: /Cancel/}) as HTMLButtonElement;
            expect(button).not.toBeInTheDocument();
        });
    });

    describe("when user with permissions", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions')
                .mockImplementation(() => (withPermissions));
            jest.spyOn(useSpecificationSummaryHook, 'useSpecificationSummary')
                .mockImplementation(() => (specificationResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            haveNoJobNotification();
            renderPage();
        });

        it("does not render permissions alert", () => {
            expect(screen.queryByTestId('permission-alert-message')).not.toBeInTheDocument();
        });

        it("save button is disabled by default", () => {
            const button = screen.getByRole('button', {name: /Save/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it("back button is hidden", () => {
            const button = screen.getByRole('button', {name: /Cancel/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it("cancel button is enabled", () => {
            const button = screen.queryByRole('button', {name: /Back/}) as HTMLButtonElement;
            expect(button).not.toBeInTheDocument();
        });
    });

    describe("when specification summary loaded", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions')
                .mockImplementation(() => (withPermissions));
            jest.spyOn(useSpecificationSummaryHook, 'useSpecificationSummary')
                .mockImplementation(() => (specificationResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(
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
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions')
                .mockImplementation(() => (withPermissions));
            jest.spyOn(useSpecificationSummaryHook, 'useSpecificationSummary')
                .mockImplementation(() => (specificationResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            haveNoJobNotification();
            renderPage();
        });

        it("renders correct title", async () => {
            await waitFor(() => expect(screen.getByText('Select data source file')).toBeInTheDocument());
        });
    });

    describe("when background mapping job is running", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions')
                .mockImplementation(() => (withPermissions));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(() => (relationshipResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            haveDataMapJobInProgressNotification();
            renderPage();
        });

        it("renders correct title", async () => {
            const activeJobTitle = screen.getByTestId('job-notification-title');
            expect(activeJobTitle).toBeInTheDocument();
            expect(activeJobTitle).toHaveTextContent("Job in progress: Mapping dataset");
        });

        it("save button is hidden", () => {
            const button = screen.queryByRole('button', {name: /Save/}) as HTMLButtonElement;
            expect(button).not.toBeInTheDocument();
        });

        it("back button is enabled", () => {
            const button = screen.getByRole('button', {name: /Back/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it("cancel button is hidden", () => {
            const button = screen.queryByRole('button', {name: /Cancel/}) as HTMLButtonElement;
            expect(button).not.toBeInTheDocument();
        });
    });

    describe("when background converter wizard job is running", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions')
                .mockImplementation(() => (withPermissions));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(() => (relationshipResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            haveConverterWizardJobInProgressNotification();
            renderPage();
        });

        it("renders correct title", async () => {
            const outerDiv = screen.getByTestId('job-notification');
            screen.debug(outerDiv)
            expect(screen.getByText(/Job in progress: Running Converter Wizard/)).toBeInTheDocument();
        });

        it("displays converter wizard running warning", async () => {
            expect(screen.getByText("Mapping of this dataset is disabled until converter wizard completes.")).toBeInTheDocument();
        });

        it("save button is hidden", () => {
            expect(screen.queryByRole('button', {name: /Save/})).not.toBeInTheDocument();
        });

        it("back button is shown", () => {
            const button = screen.getByRole('button', {name: /Back/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });
    });

    describe("when background converter wizard job is not running", () => {
        beforeEach(() => {
            jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions')
                .mockImplementation(() => (withPermissions));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(() => (relationshipResult));
            jest.spyOn(useRelationshipDataHook, 'useRelationshipData')
                .mockImplementation(
                () => ({
                    isLoadingRelationshipData: false,
                    isErrorLoadingRelationshipData: false,
                    relationshipData: {}
                } as RelationshipDataQueryResult));
            haveNoJobNotification();
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
