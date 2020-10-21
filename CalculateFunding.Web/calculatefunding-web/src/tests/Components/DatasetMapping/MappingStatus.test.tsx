import React from "react";
import {JobSummary} from "../../../types/jobSummary";
import {CompletionStatus} from "../../../types/CompletionStatus";
import {RunningStatus} from "../../../types/RunningStatus";
import {JobType} from "../../../types/jobType";
import {render, screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {MappingStatus} from "../../../components/DatasetMapping/MappingStatus";

const renderComponent = (job: JobSummary) => {
  const {MappingStatus} = require("../../../components/DatasetMapping/MappingStatus");
  return render(<MappingStatus job={job} hasActiveJob={job.runningStatus !== RunningStatus.Completed} />);
};

describe('<MappingStatus />', () => {

  it("renders status based on Queued job", () => {
    const job = createTestJob(null, RunningStatus.Queued);

    renderComponent(job);

    expect(screen.getByText("Job in queue: Mapping dataset"));

    const outerDiv = screen.getByTestId('job-notification');
    expect(outerDiv.className).toContain("govuk-error-summary-orange");

    expect(screen.getByText((content) => content.startsWith('Mapping initiated by Harry Potter on'))).toBeInTheDocument();
    expect(screen.getByTestId('formatted-created-date')).toBeInTheDocument();
    expect(screen.queryByText("Completed:")).not.toBeInTheDocument();
    expect(screen.queryByTestId('formatted-completed-date')).not.toBeInTheDocument();
  });
  
  it("renders status based on InProgress job", () => {
    const job = createTestJob(null, RunningStatus.InProgress);
    
    renderComponent(job);

    expect(screen.getByText("Job in progress: Mapping dataset"));

    const outerDiv = screen.getByTestId('job-notification');
    expect(outerDiv.className).toContain("govuk-error-summary-orange");

    expect(screen.getByText((content) => content.startsWith('Mapping initiated by Harry Potter on'))).toBeInTheDocument();
    expect(screen.getByTestId('formatted-created-date')).toBeInTheDocument();
    expect(screen.queryByText("Completed:")).not.toBeInTheDocument();
    expect(screen.queryByTestId('formatted-completed-date')).not.toBeInTheDocument();
  });

  it("renders status based on successfully completed job", () => {
    const job = createTestJob(CompletionStatus.Succeeded, RunningStatus.Completed);

    renderComponent(job);

    expect(screen.getByText("Job completed successfully: Mapping dataset"));

    const outerDiv = screen.getByTestId('job-notification');
    expect(outerDiv.className).toContain("govuk-error-summary-green");

    expect(screen.getByText((content) => content.startsWith('Mapping initiated by Harry Potter on'))).toBeInTheDocument();
    expect(screen.getByTestId('formatted-created-date')).toBeInTheDocument();
    expect(screen.getByText("Completed:"));
    expect(screen.queryByTestId('formatted-completed-date')).toBeInTheDocument();
  });

  it("renders status based on failed completed job", () => {
    const job = createTestJob(CompletionStatus.Failed, RunningStatus.Completed);

    renderComponent(job);

    expect(screen.getByText("Job failed: Mapping dataset"));

    const outerDiv = screen.getByTestId('job-notification');
    expect(outerDiv.className).toContain("govuk-error-summary-red");

    expect(screen.getByText((content) => content.startsWith('Mapping initiated by Harry Potter on'))).toBeInTheDocument();
    expect(screen.getByTestId('formatted-created-date')).toBeInTheDocument();
    expect(screen.getByText("Completed:"));
    expect(screen.queryByTestId('formatted-completed-date')).toBeInTheDocument();
  });

});

function createTestJob(completionStatus: CompletionStatus | null, runningStatus: RunningStatus) : JobSummary {
  return {
    completionStatus: completionStatus,
    invokerUserDisplayName: "Harry Potter",
    invokerUserId: "",
    jobId: "",
    jobType: JobType.MapDatasetJob,
    runningStatus: runningStatus,
    specificationId: "",
    created: new Date("2020-09-02T09:50:45.4873729+00:00"),
    lastUpdated: new Date(Date.now())
  };
}