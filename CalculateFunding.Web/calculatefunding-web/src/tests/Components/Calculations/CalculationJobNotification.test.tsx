import React from "react";
import '@testing-library/jest-dom/extend-expect';
import {act} from 'react-test-renderer';
import {render, screen} from '@testing-library/react';
import {CalculationJobNotification, ICalculationJobNotificationProps} from "../../../components/Calculations/CalculationJobNotification";
import {JobSummary} from "../../../types/jobSummary";
import {JobType} from "../../../types/jobType";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";

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
const mockJobInProgressResult: JobSummary = {
    jobId: "asdfasdf",
    jobType: JobType.RefreshFundingJob,
    specificationId: "abc123",
    runningStatus: RunningStatus.InProgress,
    completionStatus: null,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "Bob"
};
const mockSuccessfulJobResult: JobSummary = {
    jobId: "asdfasdf",
    jobType: JobType.RefreshFundingJob,
    specificationId: "abc123",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Succeeded,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "Bob"
};
const mockTimedOutJobResult: JobSummary = {
    jobId: "asdfasdf",
    jobType: JobType.RefreshFundingJob,
    specificationId: "abc123",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.TimedOut,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "Bob"
};
const mockCancelledJobResult: JobSummary = {
    jobId: "asdfasdf",
    jobType: JobType.RefreshFundingJob,
    specificationId: "abc123",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Cancelled,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "Bob"
};
const mockFailedJobResult: JobSummary = {
    jobId: "asdfasdf",
    jobType: JobType.RefreshFundingJob,
    specificationId: "abc123",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Failed,
    lastUpdated: new Date(),
    created: new Date(),
    invokerUserDisplayName: "Bob"
};

const renderComponent = (params: ICalculationJobNotificationProps) => {
    return render(<CalculationJobNotification
        latestJob={params.latestJob}
        anyJobsRunning={params.anyJobsRunning}
        hasJobError={params.hasJobError}
        isCheckingForJob={params.isCheckingForJob}
        jobError={params.jobError}
        jobDisplayInfo={params.jobDisplayInfo}
    />);
};

describe('<CalculationJobNotification />', () => {
    beforeAll(() => jest.clearAllMocks());

    describe('with no job running', () => {
        it('renders null', async () => {
            const props: ICalculationJobNotificationProps = {
                latestJob: undefined,
                anyJobsRunning: false,
                isCheckingForJob: false,
                hasJobError: false,
                jobError: "",
                jobDisplayInfo: undefined
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
            const props: ICalculationJobNotificationProps = {
                latestJob: undefined,
                anyJobsRunning: false,
                isCheckingForJob: true,
                hasJobError: false,
                jobError: "",
                jobDisplayInfo: undefined
            };
            await renderComponent(props);

            expect(screen.getByText("Checking for running jobs")).toBeInTheDocument();
            expect(screen.queryByText((content) => content.startsWith('Job initiated by'))).not.toBeInTheDocument();
        });
    });

    describe('when has error loading latest spec job', () => {
        it('renders error message correctly', async () => {
            const props: ICalculationJobNotificationProps = {
                latestJob: undefined,
                anyJobsRunning: false,
                isCheckingForJob: false,
                hasJobError: true,
                jobError: "Uh oh!",
                jobDisplayInfo: undefined
            };
            await renderComponent(props);

            expect(screen.queryByText("Error while checking for latest job")).toBeInTheDocument();
            expect(screen.queryByText("Uh oh!")).toBeInTheDocument();
            expect(screen.queryByText((content) => content.startsWith('Job initiated by'))).not.toBeInTheDocument();
        });
    });

    describe('when job is queued', () => {
        it('renders error message correctly', async () => {
            const props: ICalculationJobNotificationProps = {
                latestJob: mockQueuedJobResult,
                anyJobsRunning: true,
                isCheckingForJob: false,
                hasJobError: false,
                jobError: "",
                jobDisplayInfo: {
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
