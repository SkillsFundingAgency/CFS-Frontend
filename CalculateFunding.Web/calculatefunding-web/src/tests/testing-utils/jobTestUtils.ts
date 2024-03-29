﻿import { DateTime } from "luxon";

import { AddJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import * as jobSubscriptionHook from "../../hooks/Jobs/useJobSubscription";
import { CompletionStatus } from "../../types/CompletionStatus";
import { JobDetails } from "../../types/jobDetails";
import { JobNotification, JobSubscription } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import { RunningStatus } from "../../types/RunningStatus";
import { waitForLoadingToFinish } from "./reactTestingLibraryUtils";

export const jobSubscriptionTestUtils = ({ mockSpecId }: { mockSpecId?: string | undefined } = {}) => {
  let notification: JobNotification | undefined;
  let subscription: JobSubscription = {
    filterBy: {
      jobId: "jobId",
      jobTypes: [],
      specificationId: mockSpecId,
    },
    id: "sertdhw4e5t",
    isEnabled: true,
    onError: () => null,
    startDate: DateTime.local(),
  };

  const haveNoJobNotification = () => {
    notification = undefined;
  };

  const haveFailedJobNotification = (
    jobOverrides: Partial<JobDetails>,
    subscriptionOverrides: Partial<JobSubscription>
  ) => {
    notification = {
      subscription: {
        ...subscription,
        jobTypes: [jobOverrides?.jobType || JobType.RunConverterDatasetMergeJob],
        ...subscriptionOverrides,
      } as JobSubscription,
      latestJob: {
        jobId: "jobId",
        jobType: jobOverrides?.jobType || JobType.RunConverterDatasetMergeJob,
        statusDescription: "Job description",
        jobDescription: "",
        runningStatus: RunningStatus.Completed,
        completionStatus: CompletionStatus.Failed,
        failures: [],
        isSuccessful: false,
        isFailed: true,
        isActive: false,
        isComplete: true,
        outcome: "Job failed",
      },
    };

    return notification;
  };

  const haveJobInProgressNotification = (
    jobOverrides: Partial<JobDetails>,
    subscriptionOverrides: Partial<JobSubscription>
  ) => {
    subscription.id = "sub-id";
    notification = {
      subscription: {
        ...subscription,
        jobTypes: [jobOverrides?.jobType || JobType.RunConverterDatasetMergeJob],
        ...subscriptionOverrides,
      } as JobSubscription,
      latestJob: {
        jobId: "job-id",
        jobType: jobOverrides?.jobType || JobType.RunConverterDatasetMergeJob,
        statusDescription: "Job is in progress",
        jobDescription: "Job description",
        outcome: "",
        ...jobOverrides,
        runningStatus: RunningStatus.InProgress,
        failures: [],
        isComplete: false,
        isSuccessful: false,
        isFailed: false,
        isActive: true,
      },
    };
    return notification;
  };

  const haveJobSuccessfulNotification = (
    jobOverrides: Partial<JobDetails>,
    subscriptionOverrides: Partial<JobSubscription>
  ) => {
    notification = {
      subscription: {
        ...subscription,
        jobTypes: [jobOverrides?.jobType || JobType.RunConverterDatasetMergeJob],
        ...subscriptionOverrides,
      } as JobSubscription,
      latestJob: {
        jobId: "new-spec-job",
        jobType: jobOverrides?.jobType || JobType.RunConverterDatasetMergeJob,
        statusDescription: "Create Specification job completed successfully",
        jobDescription: "Create Specification Job",
        ...jobOverrides,
        runningStatus: RunningStatus.Completed,
        completionStatus: CompletionStatus.Succeeded,
        lastUpdated: new Date(),
        failures: [],
        isComplete: true,
        isSuccessful: true,
        isFailed: false,
        isActive: false,
        outcome: "",
      },
    };
    return notification;
  };

  let notificationCallback: (n: JobNotification) => void = () => null;
  let hasNotificationCallback = false;

  const getNotificationCallback = () => {
    return notificationCallback;
  };

  const setupJobSpy = () => {
    const jobSubscriptionSpy = jest.spyOn(jobSubscriptionHook, "useJobSubscription");
    jobSubscriptionSpy.mockImplementation(({ onNewNotification }) => {
      if (onNewNotification && !hasNotificationCallback) {
        notificationCallback = onNewNotification;
        hasNotificationCallback = true;
      }
      return {
        addSub: (request: AddJobSubscription) => {
          const sub: JobSubscription = {
            filterBy: {
              jobId: request?.filterBy.jobId,
              specificationId: request?.filterBy.specificationId,
              jobTypes: request?.filterBy.jobTypes ? request?.filterBy.jobTypes : undefined,
            },
            isEnabled: true,
            id: "sertdhw4e5t",
            onError: () => request.onError,
            startDate: DateTime.now(),
          };
          subscription = sub;
          return Promise.resolve(sub);
        },
        replaceSubs: () => {
          const sub: JobSubscription = {
            filterBy: {},
            id: "sertdhw4e5t",
            onError: () => null,
            isEnabled: true,
            startDate: DateTime.now(),
          };
          subscription = sub;
          return [sub];
        },
        removeSub: () => null,
        removeAllSubs: () => null,
        subs: [],
        results: notification ? [notification] : [],
      };
    });
    return jobSubscriptionSpy;
  };

  return {
    setupJobSpy,
    notification,
    getNotificationCallback,
    subscription,
    haveNoJobNotification,
    haveJobSuccessfulNotification,
    haveFailedJobNotification,
    haveJobInProgressNotification,
    waitForLoadingToFinish,
  };
};
