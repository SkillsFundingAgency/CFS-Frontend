import { render, screen } from "@testing-library/react";
import React from "react";

import { SpinnerDisplaySetting } from "../../../components/Jobs/JobLoadingSpinner";
import {
  JobNotificationBanner,
  JobNotificationBannerProps,
} from "../../../components/Jobs/JobNotificationBanner";
import { getJobDetailsFromJobResponse } from "../../../helpers/jobDetailsHelper";
import { CompletionStatus } from "../../../types/CompletionStatus";
import { JobDetails, JobOutcomeType, JobTrigger } from "../../../types/jobDetails";
import { JobType } from "../../../types/jobType";
import { RunningStatus } from "../../../types/RunningStatus";

const renderComponent = (params: JobNotificationBannerProps) => {
  return render(<JobNotificationBanner {...params} />);
};

describe("<JobNotificationBanner />", () => {
  beforeAll(() => jest.clearAllMocks());

  describe("when no job running and not checking for job", () => {
    it("does not render banner", async () => {
      const props: JobNotificationBannerProps = {
        job: undefined,
        isCheckingForJob: false,
        notificationSettings: [
          {
            jobTypes: [JobType.RefreshFundingJob],
          },
        ],
      };
      await renderComponent(props);

      expect(screen.queryByTestId("job-notification-banner")).not.toBeInTheDocument();
    });
  });

  describe("when still checking for job", () => {
    it("renders loading message correctly", async () => {
      const props: JobNotificationBannerProps = {
        job: undefined,
        isCheckingForJob: true,
        notificationSettings: [
          {
            jobTypes: [JobType.RefreshFundingJob],
          },
        ],
        spinner: {
          loadingText: "Loading text goes here",
          isLoading: true,
          loadingDescription: "Loading description goes here",
          display: SpinnerDisplaySetting.ShowPageSpinner,
        },
      };
      await renderComponent(props);

      expect(screen.getByTestId("loader")).toBeInTheDocument();
      expect(screen.getByText(/Loading text goes here/)).toBeInTheDocument();
      expect(screen.getByText(/Loading description goes here/)).toBeInTheDocument();
      expect(screen.queryByText(/Job initiated by/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Results updated/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
    });
  });

  describe("when job is queued", () => {
    it("renders message correctly", async () => {
      const props: JobNotificationBannerProps = {
        job: mockQueuedJobResult,
        isCheckingForJob: false,
        notificationSettings: [
          {
            jobTypes: [JobType.RefreshFundingJob],
          },
        ],
      };

      renderComponent(props);

      expect(screen.getByText("Job in queue: Refreshing funding")).toBeInTheDocument();
      expect(screen.getByText(/Job initiated by/));
      expect(screen.queryByText(/Last update/)).toBeInTheDocument();
      expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
    });
  });

  describe("when job successfully completed", () => {
    it("renders correctly", async () => {
      const props: JobNotificationBannerProps = {
        job: mockCompletedJobWithNoOutcomeTypeResult,
        isCheckingForJob: false,
        notificationSettings: [
          {
            jobTypes: [JobType.RefreshFundingJob],
            failureOutcomeDescription: "a test jobCompletedOutcomeFailedMessage",
          },
        ],
      };

      renderComponent(props);

      expect(await screen.findByText(/Job completed successfully/)).toBeInTheDocument();
      expect(screen.queryByText(/There is a problem/)).not.toBeInTheDocument();
      expect(screen.queryByText(/a test jobCompletedOutcomeFailedMessage/)).not.toBeInTheDocument();
      expect(screen.getByText(/Job initiated/)).toBeInTheDocument();
      expect(screen.getByText(/Completed/)).toBeInTheDocument();
      expect(screen.getByText(/2 April 2020 11:00 PM/)).toBeInTheDocument();
      expect(screen.queryByText(/Job ID/)).not.toBeInTheDocument();
    });
  });

  describe("when job failed", () => {
    describe("with a provided jobCompletedOutcomeFailedMessage ", () => {
      it("renders jobCompletedOutcomeFailedMessage error message correctly when no failed child jobs", async () => {
        const props: JobNotificationBannerProps = {
          job: mockFailedJobWithNoChildFailedOutcomesResult,
          isCheckingForJob: false,
          notificationSettings: [
            {
              jobTypes: [JobType.RefreshFundingJob],
              failureOutcomeDescription: "a test jobCompletedOutcomeFailedMessage",
            },
          ],
        };

        renderComponent(props);

        expect(
          await screen.findByText(/Job failed: Refreshing funding: a test jobCompletedOutcomeFailedMessage/)
        ).toBeInTheDocument();
        expect(screen.getByText(/Job initiated/)).toBeInTheDocument();
        expect(screen.getByText(/Completed:/)).toBeInTheDocument();
        expect(screen.getByText(/1 February 2020 9:00 AM/)).toBeInTheDocument();
        expect(
          screen.getByText(`Job ID: ${mockFailedJobWithNoChildFailedOutcomesResult.jobId}`)
        ).toBeInTheDocument();
      });

      it("renders jobCompletedOutcomeFailedMessage error message correctly when failed child jobs", async () => {
        const props: JobNotificationBannerProps = {
          job: mockFailedJobResult,
          isCheckingForJob: false,
          notificationSettings: [
            {
              jobTypes: [JobType.RefreshFundingJob],
              failureOutcomeDescription: "a test jobCompletedOutcomeFailedMessage",
            },
          ],
        };

        renderComponent(props);

        expect(
          await screen.findByText(/Job failed: Refreshing funding: a test jobCompletedOutcomeFailedMessage/)
        ).toBeInTheDocument();
        expect(screen.getByText(/Job initiated/)).toBeInTheDocument();
        expect(screen.getByText(/Completed:/)).toBeInTheDocument();
        expect(screen.getByText(/2 May 2020 6:00 AM/)).toBeInTheDocument();
        expect(screen.getByText(`Job ID: ${mockFailedJobResult.jobId}`)).toBeInTheDocument();
      });
    });

    describe("with a provided jobFailedMessage ", () => {
      it("renders jobFailedMessage error messages correctly when no failed child jobs", async () => {
        const props: JobNotificationBannerProps = {
          job: mockFailedJobWithNoChildFailedOutcomesResult,
          isCheckingForJob: false,
          notificationSettings: [
            {
              jobTypes: [JobType.RefreshFundingJob],
              failDescription: "a test jobFailedMessage",
            },
          ],
        };

        renderComponent(props);

        expect(
          await screen.findByText(/Job failed: Refreshing funding: a test jobFailedMessage/)
        ).toBeInTheDocument();
        expect(screen.getByText(/Job initiated/)).toBeInTheDocument();
        expect(screen.getByText(/Completed:/)).toBeInTheDocument();
        expect(screen.getByText(/1 February 2020 9:00 AM/)).toBeInTheDocument();
        expect(
          screen.getByText(`Job ID: ${mockFailedJobWithNoChildFailedOutcomesResult.jobId}`)
        ).toBeInTheDocument();
      });

      it("renders jobFailedMessage error messages correctly when failed child jobs", async () => {
        const props: JobNotificationBannerProps = {
          job: mockFailedJobResult,
          isCheckingForJob: false,
          notificationSettings: [
            {
              jobTypes: [JobType.RefreshFundingJob],
              failDescription: "a test jobFailedMessage",
            },
          ],
        };

        renderComponent(props);

        expect(
          await screen.findByText(/Job failed: Refreshing funding: a test jobFailedMessage/)
        ).toBeInTheDocument();
        expect(screen.getByText(/Job initiated/)).toBeInTheDocument();
        expect(screen.getByText(/Completed:/)).toBeInTheDocument();
        expect(screen.getByText(/2 May 2020 6:00 AM/)).toBeInTheDocument();
        expect(screen.getByText(`Job ID: ${mockFailedJobResult.jobId}`)).toBeInTheDocument();
      });
    });

    describe("without a jobFailedMessage provided ", () => {
      it("renders error summary messages correctly ", async () => {
        const props: JobNotificationBannerProps = {
          job: mockFailedJobResult,
          isCheckingForJob: false,
          notificationSettings: [
            {
              jobTypes: [JobType.RefreshFundingJob],
              showFailed: true,
            },
          ],
        };

        renderComponent(props);

        expect(
          await screen.findByText(
            /Job failed: Refreshing funding: Job Approving batch provider funding: Invalid preconditions!, Job Deleting calculations: Hard disc failure!/
          )
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            `${mockFailedJobResult.failures[0].jobDescription}: ${mockFailedJobResult.failures[0].description}`
          )
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            `${mockFailedJobResult.failures[1].jobDescription}: ${mockFailedJobResult.failures[1].description}`
          )
        ).toBeInTheDocument();
        expect(screen.getByText(/Job initiated/)).toBeInTheDocument();
        expect(screen.getByText(/Completed:/)).toBeInTheDocument();
        expect(screen.getByText(/2 May 2020 6:00 AM/)).toBeInTheDocument();
        expect(screen.getByText(`Job ID: ${mockFailedJobResult.jobId}`)).toBeInTheDocument();
      });
    });
  });
});

const emptyTrigger: JobTrigger = {
  message: "",
  entityId: "",
  entityType: "",
};

const mockQueuedJobResult: JobDetails = getJobDetailsFromJobResponse({
  jobId: "34570303245",
  jobType: JobType.RefreshFundingJob,
  specificationId: "spec 6545",
  runningStatus: RunningStatus.Queued,
  completionStatus: undefined,
  lastUpdated: new Date(2020, 2, 2, 18, 0, 0),
  created: new Date(2020, 2, 1, 4, 0, 0),
  invokerUserDisplayName: "a valid invoker user",
  invokerUserId: "xxx",
  trigger: emptyTrigger,
  outcomes: [],
}) as JobDetails;

const mockFailedJobWithNoChildFailedOutcomesResult: JobDetails = getJobDetailsFromJobResponse({
  jobId: "345768293546",
  jobType: JobType.RefreshFundingJob,
  specificationId: "spec 342",
  runningStatus: RunningStatus.Completed,
  completionStatus: CompletionStatus.Failed,
  lastUpdated: new Date(Date.UTC(2020, 1, 2, 10, 0, 0)),
  created: new Date(Date.UTC(2020, 1, 1, 9, 0, 0)),
  invokerUserDisplayName: "a valid invoker user",
  trigger: emptyTrigger,
  outcomes: [],
}) as JobDetails;

const mockCompletedJobWithNoOutcomeTypeResult: JobDetails = getJobDetailsFromJobResponse({
  jobId: "732457230405",
  jobType: JobType.RefreshFundingJob,
  specificationId: "spec 574",
  runningStatus: RunningStatus.Completed,
  completionStatus: CompletionStatus.Succeeded,
  lastUpdated: new Date(Date.UTC(2020, 3, 2, 22, 0, 0)),
  created: new Date(Date.UTC(2020, 3, 1, 22, 0, 0)),
  invokerUserDisplayName: "a valid invoker user",
  trigger: emptyTrigger,
  outcomes: [],
}) as JobDetails;

const mockFailedJobResult: JobDetails = getJobDetailsFromJobResponse({
  jobId: "8765434444",
  jobType: JobType.RefreshFundingJob,
  specificationId: "spec 684",
  runningStatus: RunningStatus.Completed,
  completionStatus: CompletionStatus.Failed,
  lastUpdated: new Date(Date.UTC(2020, 4, 2, 5, 0, 0)),
  created: new Date(Date.UTC(2020, 4, 1, 5, 0, 0)),
  invokerUserDisplayName: "a valid invoker user",
  trigger: emptyTrigger,
  outcomes: [
    {
      jobType: JobType.ApproveBatchProviderFundingJob,
      type: JobOutcomeType.Failed,
      description: "Invalid preconditions!",
      isSuccessful: false,
    },
    {
      jobType: JobType.DeleteCalculationsJob,
      type: JobOutcomeType.Failed,
      description: "Hard disc failure!",
      isSuccessful: false,
    },
  ],
}) as JobDetails;
