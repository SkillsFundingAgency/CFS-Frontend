import React from "react";
import '@testing-library/jest-dom/extend-expect';
import {act} from 'react-test-renderer';
import {render, screen} from '@testing-library/react';
import {CalculationJobNotification, CalculationJobNotificationProps} from "../../../components/Calculations/CalculationJobNotification";
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

const renderComponent = (params: CalculationJobNotificationProps) => {
    return render(<CalculationJobNotification
        latestJob={params.latestJob}
        anyJobsRunning={params.anyJobsRunning}
        hasJobError={params.hasJobError}
        isCheckingForJob={params.isCheckingForJob}
        jobError={params.jobError}
        jobStatus={params.jobStatus}
    />);
};

describe('<CalculationJobNotification />', () => {
    beforeAll(() => jest.clearAllMocks());

    describe('with no job running', () => {
        it('renders null', async () => {
            const props: CalculationJobNotificationProps = {
                latestJob: undefined,
                anyJobsRunning: false,
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
            const props: CalculationJobNotificationProps = {
                latestJob: undefined,
                anyJobsRunning: false,
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
            const props: CalculationJobNotificationProps = {
                latestJob: undefined,
                anyJobsRunning: false,
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
            const props: CalculationJobNotificationProps = {
                latestJob: mockQueuedJobResult,
                anyJobsRunning: true,
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
