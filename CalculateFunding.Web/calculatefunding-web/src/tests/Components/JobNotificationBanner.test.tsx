import React from "react";
import '@testing-library/jest-dom/extend-expect';
import {render, screen, waitFor} from '@testing-library/react';
import {JobNotificationBanner, JobNotificationBannerProps} from "../../components/Calculations/JobNotificationBanner";
import {JobType} from "../../types/jobType";
import {RunningStatus} from "../../types/RunningStatus";
import {CompletionStatus} from "../../types/CompletionStatus";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {JobDetails, JobTrigger} from "../../types/jobDetails";

const renderComponent = (params: JobNotificationBannerProps) => {
    return render(<JobNotificationBanner
        job={params.job}
        isCheckingForJob={params.isCheckingForJob}
    />);
};

describe('<JobNotificationBanner />', () => {
    beforeAll(() => jest.clearAllMocks());

    describe('with no job running', () => {
        it('renders null', async () => {
            const props: JobNotificationBannerProps = {
                job: undefined,
                isCheckingForJob: false,
            };
            await renderComponent(props);

            expect(screen.queryByText("Checking for running jobs")).toBeFalsy();
            expect(screen.queryByText("Error while checking for latest job")).toBeFalsy();
            expect(screen.queryByText("Calculation job ")).toBeFalsy();
            expect(screen.queryByText("Calculation initiated by Bob on ")).toBeFalsy();
            expect(screen.queryByText((content) => content.startsWith('Job initiated by'))).not.toBeInTheDocument();
        });
    });

    describe('when still loading latest spec job', () => {
        it('renders loading message correctly', async () => {
            const props: JobNotificationBannerProps = {
                job: undefined,
                isCheckingForJob: true,
            };
            await renderComponent(props);

            expect(screen.getByText("Checking for running jobs")).toBeInTheDocument();
            expect(screen.queryByText((content) => content.startsWith('Job initiated by'))).not.toBeInTheDocument();
        });
    });

    describe('when job is queued', () => {
        it('renders error message correctly', async () => {
            const props: JobNotificationBannerProps = {
                job: mockQueuedJobResult,
                isCheckingForJob: false,
            };

            renderComponent(props);

            expect(await screen.getByText("Job in queue: Refreshing funding")).toBeInTheDocument();
            expect(screen.getByText((content) => content.startsWith('Job initiated by')));
        });
    });

    describe('with completed job ', () => {
        describe('without any failed outcome ', () => {
            it('does not render any error messages', async () => {
                const props: JobNotificationBannerProps = {
                    job: mockCompletedJobWithNoOutcomeTypeResult,
                    isCheckingForJob: false,
                    jobCompletedOutcomeFailedMessage: "a test jobCompletedOutcomeFailedMessage"
                };

                renderComponent(props);

                waitFor(() => {
                    expect(screen.queryByText(/There is a problem/)).not.toBeInTheDocument();
                    expect(screen.queryByText(/a test jobCompletedOutcomeFailedMessage/)).not.toBeInTheDocument();
                });
            });
        });
        describe('with a failed outcome ', () => {
            it('renders error messages correctly ', async () => {
                const props: JobNotificationBannerProps = {
                    job: mockCompletedJobWithFailedOutcomeResult,
                    isCheckingForJob: false,
                    jobCompletedOutcomeFailedMessage: "a test jobCompletedOutcomeFailedMessage"
                };

                renderComponent(props);

                waitFor(() => {
                    expect(screen.getByText(/There is a problem/)).toBeInTheDocument();
                    expect(screen.getByText(/a test jobCompletedOutcomeFailedMessage/)).toBeInTheDocument();
                });
            });
        });
    });

    describe('with failed job ', () => {
        describe('with a provided jobFailedMessage ', () => {
            it('renders jobFailedMessage error messages correctly ', async () => {
                const props: JobNotificationBannerProps = {
                    job: mockFailedJobResult,
                    isCheckingForJob: false,
                    jobFailedMessage: "a test jobFailedMessage"
                };

                renderComponent(props);

                waitFor(() => {
                    expect(screen.getByText(/There is a problem/)).toBeInTheDocument();
                    expect(screen.getByText(/a test jobFailedMessage/)).toBeInTheDocument();
                    expect(screen.getByText(/Job initiated/)).not.toBeInTheDocument();
                    expect(screen.getByText(/Results updated/)).not.toBeInTheDocument();
                });
            });
        });

        describe('without a jobFailedMessage provided ', () => {
            it('renders error summary messages correctly ', async () => {
                const props: JobNotificationBannerProps = {
                    job: mockFailedJobResult,
                    isCheckingForJob: false,
                    jobFailedMessage: "a test jobFailedMessage"
                };

                renderComponent(props);

                waitFor(() => {
                    expect(screen.getByText(/There is a problem/)).not.toBeInTheDocument();
                    expect(screen.getByText(/a test jobFailedMessage/)).not.toBeInTheDocument();
                    expect(screen.getByText(/Job initiated/)).toBeInTheDocument();
                    expect(screen.getByText(/Results updated/)).toBeInTheDocument();
                });
            });
        });
    });
});

const emptyTrigger: JobTrigger = {
    message: "",
    entityId: "",
    entityType: ""
}

const mockQueuedJobResult: JobDetails = getJobDetailsFromJobResponse({
    jobId: "a valid job id",
    jobType: JobType.RefreshFundingJob,
    specificationId: "a valid specification id",
    runningStatus: RunningStatus.Queued,
    completionStatus: undefined,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "a valid invoker user",
    invokerUserId: "xxx",
    trigger: emptyTrigger,
    outcomes: []
}) as JobDetails;

const mockCompletedJobWithFailedOutcomeResult: JobDetails = getJobDetailsFromJobResponse({
    jobId: "a valid job id",
    jobType: JobType.RefreshFundingJob,
    specificationId: "a valid specification id",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Succeeded,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "a valid invoker user",
    trigger: emptyTrigger,
    outcomes: []
}) as JobDetails;

const mockCompletedJobWithNoOutcomeTypeResult: JobDetails = getJobDetailsFromJobResponse({
    jobId: "a valid job id",
    jobType: JobType.RefreshFundingJob,
    specificationId: "a valid specification id",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Succeeded,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "a valid invoker user",
    trigger: emptyTrigger,
    outcomes: []
}) as JobDetails;

const mockFailedJobResult: JobDetails = getJobDetailsFromJobResponse({
    jobId: "a valid job id",
    jobType: JobType.RefreshFundingJob,
    specificationId: "a valid specification id",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Failed,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "a valid invoker user",
    trigger: emptyTrigger,
    outcomes: []
}) as JobDetails;