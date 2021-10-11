import { compose, filter } from "ramda";
import React from "react";

import {
  activeJobs,
  extractJobsFromNotifications,
  failedJobs,
  getLatestJob,
  isJobEnabledForNotification,
  removeDuplicateJobsById,
  removeInvalidJobs,
  sortByLatest,
  successfulJobs,
} from "../../helpers/jobDetailsHelper";
import { JobDetails } from "../../types/jobDetails";
import { JobNotification } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import JobBanner from "./JobBanner";
import JobLoadingSpinner, { SpinnerDisplaySetting, SpinnerSettings } from "./JobLoadingSpinner";

export interface JobTypeNotificationSetting {
  jobTypes: JobType[];
  showActive?: boolean;
  showFailed?: boolean;
  showSuccessful?: boolean;
  activeTitle?: string;
  activeDescription?: string;
  failTitle?: string;
  failDescription?: string;
  failureOutcomeDescription?: string;
  successTitle?: string;
  successDescription?: string;
  spinner?: SpinnerSettings;
}

export interface JobNotificationSectionProps {
  jobNotifications: JobNotification[] | undefined;
  notificationSettings: JobTypeNotificationSetting[] | undefined; // if empty then show any job type with default messages
  isCheckingForJob?: boolean;
  spinner?: SpinnerSettings;
}

const JobNotificationSection = ({
  jobNotifications,
  isCheckingForJob = false,
  notificationSettings,
  spinner = {
    display: SpinnerDisplaySetting.ShowPageSpinner,
    loadingDescription: "Please wait",
    loadingText: "Checking for background jobs",
  },
}: JobNotificationSectionProps): JSX.Element | null => {
  if (isCheckingForJob === true && spinner) {
    return <JobLoadingSpinner {...spinner} />;
  }

  if (!jobNotifications?.length) return null;

  const jobs: JobDetails[] = compose(
    filter<JobDetails>((j) => isJobEnabledForNotification(j, notificationSettings)),
    sortByLatest,
    removeDuplicateJobsById,
    extractJobsFromNotifications
  )(jobNotifications);

  const activeJobsToShow: JobDetails[] = activeJobs(jobs);
  const failedJobsToShow: JobDetails[] = failedJobs(jobs);
  const successfulJobToShow: JobDetails | undefined = getLatestJob(successfulJobs(jobs));

  // show all active jobs if any, otherwise show all failed jobs and/or the latest successful job
  const jobsToShow = activeJobsToShow.length
    ? activeJobsToShow
    : removeInvalidJobs(
        successfulJobToShow ? failedJobsToShow.concat(successfulJobToShow) : failedJobsToShow
      );

  if (!jobsToShow?.length) return null;

  return (
    <section>
      {jobsToShow.map((job, idx) => (
        <JobBanner key={idx} job={job} notificationSettings={notificationSettings} />
      ))}
    </section>
  );
};

export default JobNotificationSection;
