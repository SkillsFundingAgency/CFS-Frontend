import React from "react";
import '@testing-library/jest-dom/extend-expect';
import {render, screen, waitFor} from '@testing-library/react';
import {JobNotificationBanner, JobNotificationBannerProps} from "../../../components/Jobs/JobNotificationBanner";
import {JobType} from "../../../types/jobType";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";
import {getJobDetailsFromJobResponse} from "../../../helpers/jobDetailsHelper";
import {JobDetails, JobTrigger} from "../../../types/jobDetails";

const renderComponent = (params: JobNotificationBannerProps) => {
    return render(<JobNotificationBanner
        job={params.job}
        isCheckingForJob={params.isCheckingForJob}
    />);
};

describe('<JobNotificationBanner />', () => {
    beforeAll(() => jest.clearAllMocks());

    describe('when no job running and not checking for job', () => {
        it('does not render banner', async () => {
            const props: JobNotificationBannerProps = {
                job: undefined,
                isCheckingForJob: false,
            };
            await renderComponent(props);

            expect(screen.queryByTestId("job-notification-banner")).not.toBeInTheDocument();
        });
    });

    describe('when still checking for job', () => {
        it('renders loading message correctly', async () => {
            const props: JobNotificationBannerProps = {
                job: undefined,
                isCheckingForJob: true,
            };
            await renderComponent(props);

            expect(screen.getByText("Checking for running jobs")).toBeInTheDocument();
            expect(screen.queryByText(/Job initiated by/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
        });
    });

    describe('when job is queued', () => {
        it('renders message correctly', async () => {
            const props: JobNotificationBannerProps = {
                job: mockQueuedJobResult,
                isCheckingForJob: false,
            };

            renderComponent(props);

            expect(screen.getByText("Job in queue: Refreshing funding")).toBeInTheDocument();
            expect(screen.getByText(/Job initiated by/));
            expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
        });
    });

    describe('when job successfully completed', () => {
        it('renders correctly', async () => {
            const props: JobNotificationBannerProps = {
                job: mockCompletedJobWithNoOutcomeTypeResult,
                isCheckingForJob: false,
                jobCompletedOutcomeFailedMessage: "a test jobCompletedOutcomeFailedMessage"
            };

            renderComponent(props);

            waitFor(() => {
                expect(screen.getByText(/Job completed successfully/)).toBeInTheDocument();
                expect(screen.queryByText(/There is a problem/)).not.toBeInTheDocument();
                expect(screen.queryByText(/a test jobCompletedOutcomeFailedMessage/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
            });
        });
    });

    describe('when job failed', () => {
        
        describe('with a provided jobCompletedOutcomeFailedMessage ', () => {
            
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
                    expect(screen.getByText(/Job ID/)).toBeInTheDocument();
                    expect(screen.getByText(mockCompletedJobWithFailedOutcomeResult.jobId)).toBeInTheDocument();
                });
            });
        });
        
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
                    expect(screen.getByText(/Job ID/)).toBeInTheDocument();
                    expect(screen.getByText(mockCompletedJobWithFailedOutcomeResult.jobId)).toBeInTheDocument();
                });
            });
        });

        describe('with a jobFailedMessage provided ', () => {
            it('renders error summary messages correctly ', async () => {
                const props: JobNotificationBannerProps = {
                    job: mockFailedJobResult,
                    isCheckingForJob: false,
                    jobFailedMessage: "a test jobFailedMessage"
                };

                renderComponent(props);

                waitFor(() => {
                    expect(screen.getByText(/There is a problem/)).not.toBeInTheDocument();
                    expect(screen.getByText(/a test jobFailedMessage/)).toBeInTheDocument();
                    expect(screen.getByText(/Job initiated/)).toBeInTheDocument();
                    expect(screen.getByText(/Results updated/)).toBeInTheDocument();
                    expect(screen.getByText(/Job ID/)).toBeInTheDocument();
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
    jobId: "34570303245",
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
    jobId: "345768293546",
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
    jobId: "732457230405",
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
    jobId: "8765434444",
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