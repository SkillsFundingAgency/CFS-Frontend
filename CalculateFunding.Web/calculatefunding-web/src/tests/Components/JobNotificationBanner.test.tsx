import React from "react";
import '@testing-library/jest-dom/extend-expect';
import {render, screen} from '@testing-library/react';
import {JobNotificationBanner, JobNotificationBannerProps} from "../../components/Calculations/JobNotificationBanner";
import {JobSummary} from "../../types/jobSummary";
import {JobType} from "../../types/jobType";
import {RunningStatus} from "../../types/RunningStatus";

const mockQueuedJobResult: JobSummary = {
    jobId: "sdfg",
    jobType: JobType.RefreshFundingJob,
    specificationId: "abc123",
    runningStatus: RunningStatus.Queued,
    completionStatus: null,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "Bob"
};

const renderComponent = (params: JobNotificationBannerProps) => {
    return render(<JobNotificationBanner
        latestJob={params.latestJob}
        hasJobError={params.hasJobError}
        isCheckingForJob={params.isCheckingForJob}
        jobError={params.jobError}
        jobStatus={params.jobStatus}
    />);
};

describe('<JobNotificationBanner />', () => {
    beforeAll(() => jest.clearAllMocks());

    describe('with no job running', () => {
        it('renders null', async () => {
            const props: JobNotificationBannerProps = {
                latestJob: undefined,
                isCheckingForJob: false,
                hasJobError: false,
                jobError: "",
                jobStatus: undefined
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
                latestJob: undefined,
                isCheckingForJob: true,
                hasJobError: false,
                jobError: "",
                jobStatus: undefined
            };
            await renderComponent(props);

            expect(screen.getByText("Checking for running jobs")).toBeInTheDocument();
            expect(screen.queryByText((content) => content.startsWith('Job initiated by'))).not.toBeInTheDocument();
        });
    });

    describe('when has error loading latest spec job', () => {
        it('renders error message correctly', async () => {
            const props: JobNotificationBannerProps = {
                latestJob: undefined,
                isCheckingForJob: false,
                hasJobError: true,
                jobError: "Uh oh!",
                jobStatus: undefined
            };
            await renderComponent(props);

            expect(screen.queryByText("Error while checking for latest job")).toBeInTheDocument();
            expect(screen.queryByText("Uh oh!")).toBeInTheDocument();
            expect(screen.queryByText((content) => content.startsWith('Job initiated by'))).not.toBeInTheDocument();
        });
    });

    describe('when job is queued', () => {
        it('renders error message correctly', async () => {
            const props: JobNotificationBannerProps = {
                latestJob: mockQueuedJobResult,
                isCheckingForJob: false,
                hasJobError: false,
                jobError: "",
                jobStatus: {
                    isActive: true, 
                    isSuccessful: false,
                    isComplete: false, 
                    isFailed: false, 
                    statusDescription: "in queue", 
                    jobDescription: "Refreshing funding"
                }
            };

            renderComponent(props);

            expect(await screen.getByText("Job in queue: Refreshing funding")).toBeInTheDocument();
            expect(screen.getByText((content) => content.startsWith('Job initiated by')));
        });
    });
});
