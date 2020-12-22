import React from "react";
import '@testing-library/jest-dom/extend-expect';
import {render, screen} from '@testing-library/react';
import {JobNotificationBanner, JobNotificationBannerProps} from "../../components/Calculations/JobNotificationBanner";
import {JobType} from "../../types/jobType";
import {RunningStatus} from "../../types/RunningStatus";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {JobDetails} from "../../types/jobDetails";

const mockQueuedJobResult: JobDetails = getJobDetailsFromJobResponse({
    jobId: "sdfg",
    jobType: JobType.RefreshFundingJob,
    specificationId: "abc123",
    runningStatus: RunningStatus.Queued,
    completionStatus: undefined,
    outcomes: [],
    outcome: "",
    trigger: {entityId: "", entityType: "", message: ""},
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "Bob",
    invokerUserId: "xxx"
}) as JobDetails;

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
});
