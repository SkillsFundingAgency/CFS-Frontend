import React from "react";
import * as redux from "react-redux";
import {render, waitFor, screen, fireEvent, cleanup, waitForElementToBeRemoved, act} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {MemoryRouter} from "react-router";
import * as monitor from "../../../hooks/Jobs/useMonitorForNewSpecificationJob";
import * as fetchLatestSpecificationJobs from "../../../hooks/Jobs/useFetchAllLatestSpecificationJobs";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";

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
            useFetchLatestSpecificationJobSpy.mockImplementation(() => {
                return {
                    allJobs: undefined,
                    isCheckingForJobs: false,
                    errorCheckingForJobs: "",
                    haveErrorCheckingForJobs: false,
                    isFetching: false,
                    isFetched: true
                }
            });
        });

        afterAll(() => {
            useFetchLatestSpecificationJobSpy.mockReset();
        });

        it("does not show summary until funding stream and funding period selected", async () => {
            await renderPage();

            expect(screen.queryByText(/Last SQL update/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Last funding data change/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Push data/)).not.toBeInTheDocument();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});

            expect(screen.queryByText(/Last SQL update/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Last funding data change/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Push data/)).not.toBeInTheDocument();

            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});

            expect(screen.getByText(/Last SQL update/i)).toBeInTheDocument();
            expect(screen.getByText(/Last funding data change/i)).toBeInTheDocument();
            expect(screen.getByText(/Push data/)).toBeInTheDocument();
        });

        it("does not show a permissions message for funding stream where user has canRefreshPublishedQa permission", async () => {
            await renderPage();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});

            expect(screen.queryByText(/you do not have permissions/i)).not.toBeInTheDocument();
        });

        it("shows a permissions message for funding stream where user does not have canRefreshPublishedQa permission", async () => {
            await renderPage();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "DSG"}});

            expect(screen.getByText(/you do not have permissions/i)).toBeInTheDocument();
        });

        it("removes permissions message when funding stream changed to one where user has canRefreshPublishedQa permission", async () => {
            await renderPage();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "DSG"}});
            expect(screen.getByText(/you do not have permissions/i)).toBeInTheDocument();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});

            await waitFor(() => {
                expect(screen.queryByText(/you do not have permissions/i)).not.toBeInTheDocument();
            });
        });

        it("push data button is disabled when user does not have canRefreshPublishedQa permission", async () => {
            await renderPage();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "DSG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "FY-2021"}});
            await waitFor(() => {
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText("N/A")).toBeInTheDocument();
            });
            expect(screen.getByText(/Push data/).closest("button")).toBeDisabled();
        });

        it("push data button is re-enabled when user chooses a funding stream where they have canRefreshPublishedQa permission", async () => {
            await renderPage();

            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "DSG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "FY-2021"}});
            await waitFor(() => {
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText("N/A")).toBeInTheDocument();
            });
            expect(screen.getByText(/Push data/).closest("button")).toBeDisabled();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});
            await waitFor(() => {
                expect(screen.getByText(/Push data/).closest("button")).not.toBeDisabled();
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText("N/A")).toBeInTheDocument();
            });
        });

        it("shows sql job status panel when push data button clicked", async () => {
            await renderPage();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "GAG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "AC-2122"}});
            await waitFor(() => {
                expect(screen.getByText(/23 November 2020/i)).toBeInTheDocument();
                expect(screen.getByText("N/A")).toBeInTheDocument();
            });
            fireEvent.click(screen.getByText(/Push data/).closest("button") as HTMLElement);
            expect(screen.getByText(/Please do not refresh the page, you will be redirected automatically/i)).toBeInTheDocument();
        });
    });

    describe("when a previous sql job exists", () => {
        afterEach(() => {
            useFetchLatestSpecificationJobSpy.mockReset();
        });

        it("shows previous job run date and enables push data button if new data exists", async () => {
            useFetchLatestSpecificationJobSpy.mockImplementation(() => {
                return {
                    allJobs: [{
                        jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
                        jobType: "RunSqlImportJob",
                        specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                        statusDescription: "",
                        jobDescription: "",
                        outcome: "",
                        runningStatus: RunningStatus.Completed,
                        completionStatus: CompletionStatus.Succeeded,
                        isSuccessful: true,
                        isFailed: false,
                        isActive: false,
                        isComplete: true,
                        invokerUserId: "testid",
                        invokerUserDisplayName: "test",
                        parentJobId: "",
                        lastUpdated: new Date("2020-11-19T14:36:34.324284+00:00"),
                        created: new Date("2020-11-23T14:36:16.3435836+00:00")
                    }],
                    isCheckingForJobs: false,
                    errorCheckingForJobs: "",
                    haveErrorCheckingForJobs: false,
                    isFetching: false,
                    isFetched: true
                }
            });
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
            useFetchLatestSpecificationJobSpy.mockImplementation(() => {
                return {
                    allJobs: [{
                        jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
                        jobType: "RunSqlImportJob",
                        specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                        statusDescription: "",
                        jobDescription: "",
                        outcome: "",
                        runningStatus: RunningStatus.Completed,
                        completionStatus: CompletionStatus.Succeeded,
                        isSuccessful: true,
                        isFailed: false,
                        isActive: false,
                        isComplete: true,
                        invokerUserId: "testid",
                        invokerUserDisplayName: "test",
                        parentJobId: "",
                        lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
                        created: new Date("2020-11-23T14:36:16.3435836+00:00")
                    }],
                    isCheckingForJobs: false,
                    errorCheckingForJobs: "",
                    haveErrorCheckingForJobs: false,
                    isFetching: false,
                    isFetched: true
                }
            });
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
            useFetchLatestSpecificationJobSpy.mockImplementation(() => {
                return {
                    allJobs: [{
                        jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
                        jobType: "RefreshFundingJob",
                        specificationId: "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                        statusDescription: "",
                        jobDescription: "",
                        outcome: "",
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
                    }],
                    isCheckingForJobs: false,
                    errorCheckingForJobs: "",
                    haveErrorCheckingForJobs: false,
                    isFetching: false,
                    isFetched: true
                }
            });

            await renderPage();
            fireEvent.change(screen.getByTestId("funding-stream"), {target: {value: "DSG"}});
            fireEvent.change(screen.getByTestId("funding-period"), {target: {value: "FY-2021"}});
            await waitFor(() => {
                expect(screen.getByText(/Funding job running/i)).toBeInTheDocument();
            });
            expect(screen.getByText(/Push data/).closest("button")).toBeDisabled();
        });
    });
});

// Setup services
jest.mock('../../../services/publishService', () => ({
    getLatestPublishedDate: jest.fn(() => Promise.resolve({
        data: {
            value: new Date("2020-11-23T17:35:01.1080915+00:00")
        }
    })),
    runSqlImportJob: jest.fn(() => Promise.resolve({
        data: {
            jobId: "job123"
        }
    }))
}));

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
const useSelectorSpy = jest.spyOn(redux, 'useSelector');

const jobMonitorSpy = jest.spyOn(monitor, 'useMonitorForNewSpecificationJob');
jobMonitorSpy.mockImplementation(() => {
    return {
        isMonitoring: true,
        newJob: undefined
    }
});

const useFetchLatestSpecificationJobSpy = jest.spyOn(fetchLatestSpecificationJobs, 'useFetchAllLatestSpecificationJobs');

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
            <RefreshSql />
        </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.getByTestId("funding-stream")).toBeInTheDocument();
    });
    return component;
}