import React from "react";
import * as redux from "react-redux";
import {render, waitFor, screen, fireEvent, waitForElementToBeRemoved, act} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {MemoryRouter} from "react-router";
import * as jobSubscription from "../../../hooks/Jobs/useJobSubscription";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";
import * as publishService from "../../../services/publishService";
import * as jobService from "../../../services/jobService";
import {createMockAxiosError} from "../../fakes/fakeAxios";
import {QueryClient, QueryClientProvider} from "react-query";
import {AddJobSubscription, JobNotification, JobSubscription} from "../../../hooks/Jobs/useJobSubscription";
import {DateTime} from "luxon";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import {Permission} from "../../../types/Permission";
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";

const latestPublishedDate = "2020-11-23T17:35:01.1080915+00:00";

describe("<ChangeProfileType /> ", () => {
    beforeAll(() => {
        useSelectorSpy.mockReturnValue([
            {
                fundingStreamId: "DSG",
                canRefreshPublishedQa: false
            },
            {
                fundingStreamId: "GAG",
                canRefreshPublishedQa: true
            }
        ]);
    });

    afterAll(() => {
        useSelectorSpy.mockReset();
    });

    describe("when no previous sql job exists", () => {
        beforeAll(() => {
            haveNoJobNotification();
            jobServiceSpy.mockResolvedValue({
                data: undefined,
                status: 200,
                statusText: "",
                headers: {},
                config: {}
            });
        });

        afterEach(() => {
            runSqlImportJobSpy.mockReset();
        })

        afterAll(() => {
            jobServiceSpy.mockReset();
        });

        it("does not show summary until funding stream and funding period selected", async () => {
            hasPermissions();
            await renderPage();

            expect(screen.queryByText(/Last SQL update/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Last funding data change/i)).not.toBeInTheDocument();
            expect(screen.queryByRole("button", {name: /Push data/})).not.toBeInTheDocument();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});

            expect(screen.queryByText(/Last SQL update/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Last funding data change/i)).not.toBeInTheDocument();
            expect(screen.queryByRole("button", {name: /Push data/})).not.toBeInTheDocument();

            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});

            expect(screen.getByText(/Last SQL update/i)).toBeInTheDocument();
            expect(screen.getByText(/Last funding data change/i)).toBeInTheDocument();
            expect(screen.getByRole("button", {name: /Push data/})).toBeDisabled();
        });

        it("does not show a permissions message for funding stream where user has canRefreshPublishedQa permission", async () => {
            hasPermissions();
            await renderPage();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});

            expect(screen.queryByText(/you do not have permissions/i)).not.toBeInTheDocument();
        });

        it("shows a permissions message for funding stream where user does not have canRefreshPublishedQa permission", async () => {
            hasMissingPermissions();
            await renderPage();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "DSG"}});

            expect(screen.getByText(/you do not have permissions/i)).toBeInTheDocument();
        });

        it("push data button is disabled when user does not have canRefreshPublishedQa permission", async () => {
            hasMissingPermissions();
            await renderPage();
            
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "DSG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "FY-2021"}});
            
            await waitFor(() => {
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText("N/A")).toBeInTheDocument();
            });

            expect(screen.getByRole("button", {name: /Push data/})).toBeDisabled();
        });

        it("shows sql job status panel when push data button clicked", async () => {
            const promise = Promise.resolve();
            runSqlImportJobSpy.mockResolvedValue({
                data: {
                    jobId: "job123"
                },
                status: 200,
                statusText: "",
                headers: {},
                config: {}
            });
            hasPermissions();
            await renderPage();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});
            await waitFor(() => {
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText("N/A")).toBeInTheDocument();
            });
            const button = screen.getByRole("button", {name: /Push data/});
            expect(button).toBeEnabled();
            fireEvent.click(button);
            expect(button).not.toBeInTheDocument();
            expect(screen.getByText(/Please do not refresh the page, you will be redirected automatically/i)).toBeInTheDocument();
            await act(() => promise);
        });

        it("does not show sql job status panel when push data button clicked when endpoint returns server error", async () => {
            runSqlImportJobSpy.mockRejectedValue(createMockAxiosError({}, 500));
            hasPermissions();
            await renderPage();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});
            await waitFor(() => {
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText("N/A")).toBeInTheDocument();
            });
            const button = screen.getByRole("button", {name: /Push data/});
            expect(button).toBeEnabled();
            fireEvent.click(button);
            await waitForElementToBeRemoved(screen.queryByText(/Please do not refresh the page, you will be redirected automatically/i));
            expect(screen.getByText(/There is a problem/i)).toBeInTheDocument();
            expect(screen.getByText(/The refresh sql import job could not be started/i)).toBeInTheDocument();
        });

        it("does not show sql job status panel when push data button clicked when endpoint returns null job id", async () => {
            runSqlImportJobSpy.mockResolvedValue({
                data: {
                    jobId: ''
                },
                status: 200,
                statusText: "",
                headers: {},
                config: {}
            });
            hasPermissions();
            await renderPage();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});
            await waitFor(() => {
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText("N/A")).toBeInTheDocument();
            });
            const button = screen.getByRole("button", {name: /Push data/});
            expect(button).toBeEnabled();
            fireEvent.click(button);
            await waitForElementToBeRemoved(screen.queryByText(/Please do not refresh the page, you will be redirected automatically/i));
            expect(screen.getByText(/There is a problem/i)).toBeInTheDocument();
            expect(screen.getByText(/The refresh sql import job could not be started/i)).toBeInTheDocument();
            expect(screen.getByText(/No job ID was returned/i)).toBeInTheDocument();
        });

        it("does not show sql job status panel when push data button clicked when endpoint returns no job id", async () => {
            runSqlImportJobSpy.mockResolvedValue({
                data: {
                    jobId: ''
                },
                status: 200,
                statusText: "",
                headers: {},
                config: {}
            });
            hasPermissions();
            await renderPage();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});
            await waitFor(() => {
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText("N/A")).toBeInTheDocument();
            });
            const button = screen.getByRole("button", {name: /Push data/});
            expect(button).toBeEnabled();
            fireEvent.click(button);
            await waitForElementToBeRemoved(screen.queryByText(/Please do not refresh the page, you will be redirected automatically/i));
            expect(screen.getByText(/There is a problem/i)).toBeInTheDocument();
            expect(screen.getByText(/The refresh sql import job could not be started/i)).toBeInTheDocument();
            expect(screen.getByText(/No job ID was returned/i)).toBeInTheDocument();
        });
    });

    describe("when a previous sql job exists", () => {
        afterEach(() => {
            jobServiceSpy.mockReset();
        });

        it("shows previous job run date and enables push data button if new data exists", async () => {
            jobServiceSpy.mockResolvedValue({
                data: {
                    jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
                    jobType: "RunSqlImportJob",
                    specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                    outcome: "",
                    runningStatus: RunningStatus.Completed,
                    completionStatus: CompletionStatus.Succeeded,
                    invokerUserId: "testid",
                    invokerUserDisplayName: "test",
                    parentJobId: "",
                    lastUpdated: new Date("2020-11-19T14:36:34.324284+00:00"),
                    created: new Date("2020-11-24T14:36:16.3435836+00:00")
                },
                status: 200,
                statusText: "",
                headers: {},
                config: {}
            });
            hasPermissions();
            
            await renderPage();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});

            await waitFor(() => {
                expect(screen.getByText(/19 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/Push data/).closest("button")).not.toBeDisabled();
        });

        it("shows previous job run date and shows warning message if job already run", async () => {
            jobServiceSpy.mockResolvedValue({
                data: {
                    jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
                    jobType: "RunSqlImportJob",
                    specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                    outcome: "",
                    runningStatus: RunningStatus.Completed,
                    completionStatus: CompletionStatus.Succeeded,
                    invokerUserId: "testid",
                    invokerUserDisplayName: "test",
                    parentJobId: "",
                    lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
                    created: new Date("2020-11-23T14:36:16.3435836+00:00")
                },
                status: 200,
                statusText: "",
                headers: {},
                config: {}
            });

            hasPermissions();
            await renderPage();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});

            await waitFor(() => {
                expect(screen.getByText(/24 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/Refresh SQL data is not available as the latest version has already been pushed/i)).toBeInTheDocument();
            expect(screen.getByText(/Push data/).closest("button")).toBeDisabled();
        });

        it("push button is disabled when funding job in progress", async () => {

            haveJobInProgressNotification();
            hasPermissions();

            await renderPage();
            
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "DSG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "FY-2021"}});
            
            await waitFor(() => {
                expect(screen.getByText(/Funding job running/i)).toBeInTheDocument();
            });
            
            expect(screen.getByText(/Push data/).closest("button")).toBeDisabled();
        });

        it("push button is disabled when sql job in progress", async () => {
            
            haveSqlJobInProgressNotification();
            hasPermissions();

            jobServiceSpy.mockResolvedValue({
                data: {
                    jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
                    jobType: "RunSqlImportJob",
                    specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                    outcome: "",
                    runningStatus: RunningStatus.InProgress,
                    completionStatus: undefined,
                    invokerUserId: "testid",
                    invokerUserDisplayName: "test",
                    parentJobId: "",
                    lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
                    created: new Date("2020-11-23T14:36:16.3435836+00:00")
                },
                status: 200,
                statusText: "",
                headers: {},
                config: {}
            });

            await renderPage();
            
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "DSG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "FY-2021"}});
            
            await waitFor(() => {
                expect(screen.getByText(/Data push queued/i)).toBeInTheDocument();
            });
            expect(screen.getByText(/Push data/).closest("button")).toBeDisabled();
        });

        it("push button is enabled when previous sql job failed", async () => {
            jobServiceSpy.mockResolvedValue({
                data: {
                    jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
                    jobType: "RunSqlImportJob",
                    specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                    outcome: "",
                    runningStatus: RunningStatus.Completed,
                    completionStatus: CompletionStatus.Failed,
                    invokerUserId: "testid",
                    invokerUserDisplayName: "test",
                    parentJobId: "",
                    lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
                    created: new Date("2020-11-23T14:36:16.3435836+00:00")
                },
                status: 200,
                statusText: "",
                headers: {},
                config: {}
            });
            hasPermissions();

            await renderPage();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});
            await waitFor(() => {
                expect(screen.getByText(/24 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText(/Failed/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/Push data/).closest("button")).not.toBeDisabled();
        });

        it("push button is enabled when previous sql job timed out", async () => {
            jobServiceSpy.mockResolvedValue({
                data: {
                    jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
                    jobType: "RunSqlImportJob",
                    specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                    outcome: "",
                    runningStatus: RunningStatus.Completed,
                    completionStatus: CompletionStatus.TimedOut,
                    invokerUserId: "testid",
                    invokerUserDisplayName: "test",
                    parentJobId: "",
                    lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
                    created: new Date("2020-11-23T14:36:16.3435836+00:00")
                },
                status: 200,
                statusText: "",
                headers: {},
                config: {}
            });
            hasPermissions();

            await renderPage();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});
            await waitFor(() => {
                expect(screen.getByText(/24 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText(/Failed/i)).toBeInTheDocument();
            });
            expect(screen.getByText(/Push data/).closest("button")).not.toBeDisabled();
        });
    });
});

// Setup services
jest.mock('../../../services/specificationService', () => ({
    getSpecificationsSelectedForFundingService: jest.fn(() => Promise.resolve({
        data: [
            {
                "id": "DSG",
                "name": "Dedicated Schools Grant",
                "periods": [
                    {
                        "id": "FY-2021",
                        "name": "Financial Year 2020-21",
                        "specifications": [
                            {
                                "id": "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                                "name": "GFT Dedicated Schools Grant 2021"
                            }
                        ]
                    },
                    {
                        "id": "FY-2020",
                        "name": "Financial Year 2019-20",
                        "specifications": [
                            {
                                "id": "195ddc54-244d-486b-b762-c3ad09a63383",
                                "name": "GFT Dedicated Schools Grant 2020"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "GAG",
                "name": "Academies General Annual Grant",
                "periods": [
                    {
                        "id": "AC-2122",
                        "name": "Academies Academic Year 2021-22",
                        "specifications": [
                            {
                                "id": "84f7cc6c-648e-4947-82e6-22ee1776fa1b",
                                "name": "GAG"
                            }
                        ]
                    }
                ]
            }
        ]
    }))
}));

// Setup spies
const jobServiceSpy = jest.spyOn(jobService, 'getLatestSuccessfulJob');
const runSqlImportJobSpy = jest.spyOn(publishService, 'runSqlImportJob');
const useSelectorSpy = jest.spyOn(redux, 'useSelector');

const getLatestPublishedDateSpy = jest.spyOn(publishService, 'getLatestPublishedDate');
getLatestPublishedDateSpy.mockResolvedValue({
    data: {
        value: new Date(latestPublishedDate)
    },
    status: 200,
    statusText: "",
    headers: {},
    config: {}
});

let notification: JobNotification | undefined;
let subscription: JobSubscription | undefined = {
    filterBy: {
        jobId: 'jobId',
        jobTypes: [],
    },
    id: "sertdhw4e5t",
    onError: () => {},
    startDate: DateTime.now()
};

const haveNoJobNotification = () => {
    notification = undefined;
}
const haveJobInProgressNotification = () => {
    notification = {
        subscription: subscription as JobSubscription,
        latestJob: {
            jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
            jobType: "RefreshFundingJob",
            specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
            statusDescription: "",
            jobDescription: "",
            outcome: "",
            failures: [],
            runningStatus: RunningStatus.InProgress,
            completionStatus: undefined,
            isSuccessful: false,
            isFailed: false,
            isActive: true,
            isComplete: false,
            invokerUserId: "testid",
            invokerUserDisplayName: "test",
            parentJobId: "",
            lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
            created: new Date("2020-11-23T14:36:16.3435836+00:00")
        }
    };
}
const haveSqlJobInProgressNotification = () => {
    notification = {
        subscription: subscription as JobSubscription,
        latestJob: {
            jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
            jobType: "RunSqlImportJob",
            specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
            statusDescription: "",
            jobDescription: "",
            outcome: "",
            runningStatus: RunningStatus.InProgress,
            completionStatus: undefined,
            isSuccessful: false,
            isFailed: false,
            failures: [],
            isActive: true,
            isComplete: false,
            invokerUserId: "testid",
            invokerUserDisplayName: "test",
            parentJobId: "",
            lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
            created: new Date("2020-11-23T14:36:16.3435836+00:00")
        }
    };
}

const jobSubscriptionSpy = jest.spyOn(jobSubscription, 'useJobSubscription');
jobSubscriptionSpy.mockImplementation(() => {
    return {
        addSub: (request: AddJobSubscription | AddJobSubscription[]) => {
            const sub: JobSubscription = {
                filterBy: {},
                id: "sertdhw4e5t",
                onError: () => null,
                startDate: DateTime.now()
            }
            subscription = sub;
            return sub as JobSubscription | JobSubscription[];
        },
        replaceSubs: (requests: AddJobSubscription[]) => {
            const sub: JobSubscription = {
                filterBy: {},
                id: "sertdhw4e5t",
                onError: () => null,
                startDate: DateTime.now()
            }
            subscription = sub;
            return [sub];
        },
        removeSub: (request) => {},
        removeAllSubs: () => {},
        subs: [],
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
    permissionsDisabled: [Permission.CanRefreshPublishedQa],
    missingPermissions: [Permission.CanRefreshPublishedQa],
};
const withPermissions: SpecificationPermissionsResult = {
    userId: "3456",
    isCheckingForPermissions: false,
    hasPermission: () => true,
    hasMissingPermissions: false,
    isPermissionsFetched: true,
    permissionsEnabled: [Permission.CanRefreshPublishedQa],
    permissionsDisabled: [],
    missingPermissions: [],
};
const hasMissingPermissions = () => {
    jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withoutPermissions));
}

const hasPermissions = () => {
    jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withPermissions));
}

// Setup router mocks
const mockHistoryPush = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

const renderPage = async () => {
    const {RefreshSql} = require("../../../pages/Datasets/RefreshSql");
    const component = render(
        <MemoryRouter>
            <QueryClientProvider client={new QueryClient()}>
                <RefreshSql />
            </QueryClientProvider>
        </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.getByTestId("funding-stream")).toBeInTheDocument();
    });
    return component;
}