import "@testing-library/jest-dom/extend-expect";

import { render, screen } from "@testing-library/react";
import React from "react";

import {
  JobProgressNotificationBanner,
  JobProgressNotificationBannerProps,
} from "../../../components/Jobs/JobProgressNotificationBanner";
import { getJobDetailsFromJobResponse } from "../../../helpers/jobDetailsHelper";
import { CompletionStatus } from "../../../types/CompletionStatus";
import { JobDetails, JobResponse } from "../../../types/jobDetails";
import { JobType } from "../../../types/jobType";
import { RunningStatus } from "../../../types/RunningStatus";

const renderComponent = (props: JobProgressNotificationBannerProps) => {
  const { JobProgressNotificationBanner } = require("../../../components/Jobs/JobProgressNotificationBanner");
  return render(<JobProgressNotificationBanner {...props} />);
};

describe("<JobProgressNotificationBanner />", () => {
  it("renders correctly when job queued", () => {
    const job = createTestJob(undefined, RunningStatus.Queued);

    renderComponent({ job });

    expect(screen.getByText("Job in queue: Mapping dataset"));

    const outerDiv = screen.getByTestId("job-notification");
    expect(outerDiv.className).toContain("govuk-error-summary-orange");

    expect(screen.getByText(/Initiated by Harry Potter on/)).toBeInTheDocument();
    expect(screen.getByTestId("formatted-created-date")).toBeInTheDocument();
    expect(screen.queryByText("Completed:")).not.toBeInTheDocument();
    expect(screen.queryByTestId("formatted-completed-date")).not.toBeInTheDocument();
    expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
    expect(screen.queryByText(job.jobId)).not.toBeInTheDocument();
  });

  it("renders correctly when job in progress", () => {
    const job = createTestJob(undefined, RunningStatus.InProgress);

    renderComponent({ job });

    expect(screen.getByText("Job in progress: Mapping dataset"));

    const outerDiv = screen.getByTestId("job-notification");
    expect(outerDiv.className).toContain("govuk-error-summary-orange");

    expect(screen.getByText(/Initiated by Harry Potter on/)).toBeInTheDocument();
    expect(screen.getByTestId("formatted-created-date")).toBeInTheDocument();
    expect(screen.queryByText("Completed:")).not.toBeInTheDocument();
    expect(screen.queryByTestId("formatted-completed-date")).not.toBeInTheDocument();
    expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
    expect(screen.queryByText(job.jobId)).not.toBeInTheDocument();
  });

  it("renders custom heading and description when job in progress", () => {
    const job = createTestJob(undefined, RunningStatus.InProgress);

    renderComponent({
      job,
      jobInProgressOverride: {
        heading: "custom in-progress heading",
        description: "custom in-progress description",
      },
    });

    expect(screen.getByRole("heading", { name: "custom in-progress heading" }));
    expect(screen.getByText("custom in-progress description"));
  });

  it("renders correctly when job completed successfully", () => {
    const job = createTestJob(CompletionStatus.Succeeded, RunningStatus.Completed);

    renderComponent({ job });

    expect(screen.getByText("Job completed successfully: Mapping dataset"));

    const outerDiv = screen.getByTestId("job-notification");
    expect(outerDiv.className).toContain("govuk-error-summary-green");

    expect(screen.getByText(/Initiated by Harry Potter on/)).toBeInTheDocument();
    expect(screen.getByTestId("formatted-created-date")).toBeInTheDocument();
    expect(screen.getByText("Completed:"));
    expect(screen.queryByTestId("formatted-completed-date")).toBeInTheDocument();
    expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
    expect(screen.queryByText(job.jobId)).not.toBeInTheDocument();
  });

  it("renders custom heading and description when job successful", () => {
    const job = createTestJob(CompletionStatus.Succeeded, RunningStatus.Completed);

    renderComponent({
      job,
      jobSuccessfulOverride: {
        heading: "custom success heading",
        description: "custom success description",
      },
    });

    expect(screen.getByRole("heading", { name: "custom success heading" }));
    expect(screen.getByText("custom success description"));
  });

  it("renders correctly when job failed", () => {
    const job = createTestJob(CompletionStatus.Failed, RunningStatus.Completed);

    renderComponent({ job });

    expect(screen.getByText("Job failed: Mapping dataset"));

    const outerDiv = screen.getByTestId("job-notification");
    expect(outerDiv.className).toContain("govuk-error-summary-red");

    expect(screen.getByText(/Initiated by Harry Potter on/)).toBeInTheDocument();
    expect(screen.getByTestId("formatted-created-date")).toBeInTheDocument();
    expect(screen.getByText("Completed:"));
    expect(screen.queryByTestId("formatted-completed-date")).toBeInTheDocument();
    expect(screen.getByText(/Job ID/)).toBeInTheDocument();
    expect(screen.getByText(/job-id-5472345/)).toBeInTheDocument();
  });

  it("renders custom heading and description when job failed", () => {
    const job = createTestJob(CompletionStatus.Failed, RunningStatus.Completed);

    renderComponent({
      job,
      jobFailedOverride: {
        heading: "custom failure heading",
        description: "custom failure description",
      },
    });

    expect(screen.getByRole("heading", { name: "custom failure heading" }));
    expect(screen.getByText("custom failure description"));
  });

  it("does not render status of successfully completed job given displaySuccessfulJob is false", () => {
    const job = createTestJob(CompletionStatus.Succeeded, RunningStatus.Completed);

    renderComponent({ job, displaySuccessfulJob: false });

    expect(screen.queryByText("Job completed successfully: Mapping dataset")).not.toBeInTheDocument();
  });

  it("renders status based on Queued completed job given displaySuccessfulJob is false", () => {
    const job = createTestJob(undefined, RunningStatus.Queued);

    renderComponent({ job, displaySuccessfulJob: false });

    expect(screen.getByText("Job in queue: Mapping dataset"));
  });

  it("renders status based on InProgress completed job given displaySuccessfulJob is false", () => {
    const job = createTestJob(undefined, RunningStatus.InProgress);

    renderComponent({ job, displaySuccessfulJob: false });

    expect(screen.getByText("Job in progress: Mapping dataset"));
  });

  it("renders status based on failed completed job given displaySuccessfulJob is false", () => {
    const job = createTestJob(CompletionStatus.Failed, RunningStatus.Completed);

    renderComponent({ job, displaySuccessfulJob: false });

    expect(screen.getByText("Job failed: Mapping dataset"));
  });
});

function createTestJob(
  completionStatus: CompletionStatus | undefined,
  runningStatus: RunningStatus
): JobDetails {
  return getJobDetailsFromJobResponse({
    completionStatus: completionStatus,
    invokerUserDisplayName: "Harry Potter",
    invokerUserId: "",
    jobId: "job-id-5472345",
    jobType: JobType.MapDatasetJob,
    runningStatus: runningStatus,
    specificationId: "",
    created: new Date("2020-09-02T09:50:45.4873729+00:00"),
    lastUpdated: new Date(Date.now()),
  } as JobResponse) as JobDetails;
}
