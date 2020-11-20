import React from "react";
import '@testing-library/jest-dom/extend-expect';
import {render, screen} from '@testing-library/react';
import {JobNotificationBanner, JobNotificationBannerProps} from "../../components/Calculations/JobNotificationBanner";
import {JobType} from "../../types/jobType";
import {RunningStatus} from "../../types/RunningStatus";
import {getJobDetailsFromJobSummary, JobDetails} from "../../helpers/jobDetailsHelper";

const mockQueuedJobResult: JobDetails = getJobDetailsFromJobSummary({
    jobId: "sdfg",
    jobType: JobType.RefreshFundingJob,
    specificationId: "abc123",
    runningStatus: RunningStatus.Queued,
    completionStatus: undefined,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "Bob"
});

const renderComponent = (params: JobNotificationBannerProps) => {
    return render(<JobNotificationBanner
        job={params.job}
        hasJobError={params.hasJobError}
        isCheckingForJob={params.isCheckingForJob}
        jobError={params.jobError}
    />);
};

describe('<JobNotificationBanner />', () => {
    beforeAll(() => jest.clearAllMocks());

    describe('with no job running', () => {
        it('renders null', async () => {
            const props: JobNotificationBannerProps = {
                job: undefined,
                isCheckingForJob: false,
                hasJobError: false,
                jobError: "",
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
                hasJobError: false,
                jobError: "",
            };
            await renderComponent(props);

            expect(screen.getByText("Checking for running jobs")).toBeInTheDocument();
            expect(screen.queryByText((content) => content.startsWith('Job initiated by'))).not.toBeInTheDocument();
        });
    });

    describe('when has error loading latest spec job', () => {
        it('renders error message correctly', async () => {
            const props: JobNotificationBannerProps = {
                job: undefined,
                isCheckingForJob: false,
                hasJobError: true,
                jobError: "Uh oh!",
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
                job: mockQueuedJobResult,
                isCheckingForJob: false,
                hasJobError: false,
                jobError: ""
            };

            renderComponent(props);

            expect(await screen.getByText("Job in queue: Refreshing funding")).toBeInTheDocument();
            expect(screen.getByText((content) => content.startsWith('Job initiated by')));
        });
    });
});
