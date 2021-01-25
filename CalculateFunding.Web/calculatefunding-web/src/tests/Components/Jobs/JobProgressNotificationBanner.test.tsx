import React from "react";
import {CompletionStatus} from "../../../types/CompletionStatus";
import {RunningStatus} from "../../../types/RunningStatus";
import {JobType} from "../../../types/jobType";
import {render, screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {JobProgressNotificationBanner} from "../../../components/Jobs/JobProgressNotificationBanner";
import {JobDetails} from "../../../types/jobDetails";
import {getJobDetailsFromJobResponse} from "../../../helpers/jobDetailsHelper";

const renderComponent = (job: JobDetails, displaySuccessfulJob?: boolean) => {
  const {JobProgressNotificationBanner} = require("../../../components/Jobs/JobProgressNotificationBanner");
  return render(<JobProgressNotificationBanner job={job} displaySuccessfulJob={displaySuccessfulJob}
                                               hasActiveJob={job.runningStatus !== RunningStatus.Completed} />);
};



describe('<JobProgressNotificationBanner />', () => {

  it("renders status based on Queued job", () => {
    const job = createTestJob(undefined, RunningStatus.Queued);

    renderComponent(job);

    expect(screen.getByText("Job in queue: Mapping dataset"));

    const outerDiv = screen.getByTestId('job-notification');
    expect(outerDiv.className).toContain("govuk-error-summary-orange");

    expect(screen.getByText(/Initiated by Harry Potter on/)).toBeInTheDocument();
    expect(screen.getByTestId('formatted-created-date')).toBeInTheDocument();
    expect(screen.queryByText("Completed:")).not.toBeInTheDocument();
    expect(screen.queryByTestId('formatted-completed-date')).not.toBeInTheDocument();
    expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
    expect(screen.queryByText(job.jobId)).not.toBeInTheDocument();
  });
  
  it("renders status based on InProgress job", () => {
    const job = createTestJob(undefined, RunningStatus.InProgress);
    
    renderComponent(job);

    expect(screen.getByText("Job in progress: Mapping dataset"));

    const outerDiv = screen.getByTestId('job-notification');
    expect(outerDiv.className).toContain("govuk-error-summary-orange");

    expect(screen.getByText(/Initiated by Harry Potter on/)).toBeInTheDocument();
    expect(screen.getByTestId('formatted-created-date')).toBeInTheDocument();
    expect(screen.queryByText("Completed:")).not.toBeInTheDocument();
    expect(screen.queryByTestId('formatted-completed-date')).not.toBeInTheDocument();
    expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
    expect(screen.queryByText(job.jobId)).not.toBeInTheDocument();
  });

  it("renders status based on successfully completed job", () => {
    const job = createTestJob(CompletionStatus.Succeeded, RunningStatus.Completed);

    renderComponent(job);

    expect(screen.getByText("Job completed successfully: Mapping dataset"));

    const outerDiv = screen.getByTestId('job-notification');
    expect(outerDiv.className).toContain("govuk-error-summary-green");

    expect(screen.getByText(/Initiated by Harry Potter on/)).toBeInTheDocument();
    expect(screen.getByTestId('formatted-created-date')).toBeInTheDocument();
    expect(screen.getByText("Completed:"));
    expect(screen.queryByTestId('formatted-completed-date')).toBeInTheDocument();
    expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
    expect(screen.queryByText(job.jobId)).not.toBeInTheDocument();
  });

  it("renders status based on failed completed job", () => {
    const job = createTestJob(CompletionStatus.Failed, RunningStatus.Completed);

    renderComponent(job);

    expect(screen.getByText("Job failed: Mapping dataset"));

    const outerDiv = screen.getByTestId('job-notification');
    expect(outerDiv.className).toContain("govuk-error-summary-red");

    expect(screen.getByText(/Initiated by Harry Potter on/)).toBeInTheDocument();
    expect(screen.getByTestId('formatted-created-date')).toBeInTheDocument();
    expect(screen.getByText("Completed:"));
    expect(screen.queryByTestId('formatted-completed-date')).toBeInTheDocument();
    expect(screen.getByText(/Job ID/)).toBeInTheDocument();
    expect(screen.getByText(/job-id-5472345/)).toBeInTheDocument();
  });

  it("does not render status of successfully completed job given displaySuccessfulJob is false", () => {
    const job = createTestJob(CompletionStatus.Succeeded, RunningStatus.Completed);

    renderComponent(job, false);

    expect(screen.queryByText("Job completed successfully: Mapping dataset")).not.toBeInTheDocument();
  });

  it("renders status based on Queued completed job given displaySuccessfulJob is false", () => {
    const job = createTestJob(undefined, RunningStatus.Queued);

    renderComponent(job, false);

    expect(screen.getByText("Job in queue: Mapping dataset"));
  });

  it("renders status based on InProgress completed job given displaySuccessfulJob is false", () => {
    const job = createTestJob(undefined, RunningStatus.InProgress);

    renderComponent(job, false);

    expect(screen.getByText("Job in progress: Mapping dataset"));
  });

  it("renders status based on failed completed job given displaySuccessfulJob is false", () => {
    const job = createTestJob(CompletionStatus.Failed, RunningStatus.Completed);

    renderComponent(job, false);

    expect(screen.getByText("Job failed: Mapping dataset"));
  });
});

function createTestJob(completionStatus: CompletionStatus | undefined, runningStatus: RunningStatus) : JobDetails {
  return getJobDetailsFromJobResponse({
    completionStatus: completionStatus,
    invokerUserDisplayName: "Harry Potter",
    invokerUserId: "",
    jobId: `job-id-5472345`,
    jobType: JobType.MapDatasetJob,
    runningStatus: runningStatus,
    specificationId: "",
    created: new Date("2020-09-02T09:50:45.4873729+00:00"),
    lastUpdated: new Date(Date.now())
  }) as JobDetails;
}