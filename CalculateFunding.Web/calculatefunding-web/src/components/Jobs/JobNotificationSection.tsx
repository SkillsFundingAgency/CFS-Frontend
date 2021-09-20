import { filter, head, sortBy } from "ramda";
import React from "react";
import { compose } from "redux";

import { JobNotification } from "../../hooks/Jobs/useJobSubscription";
import { JobDetails } from "../../types/jobDetails";
import { JobType } from "../../types/jobType";
import JobBanner from "./JobBanner";
import JobLoadingSpinner, { SpinnerDisplaySetting, SpinnerSettings } from "./JobLoadingSpinner";

export interface JobTypeNotificationSetting {
  jobTypes: JobType[];
  showActive?: boolean;
  showFailed?: boolean;
  showSuccessful?: boolean;
  activeDescription?: string;
  failDescription?: string;
  failureOutcomeDescription?: string;
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

  const jobs: JobDetails[] = sortByLatest(jobNotifications.flatMap((n) => (n.latestJob ? n.latestJob : [])));

  const jobsEnabledForDisplay = jobs.filter((j) => isEnabled(j, notificationSettings));
  const activeJobsToShow = activeJobs(jobsEnabledForDisplay);
  const failedJobsToShow = failedJobs(jobsEnabledForDisplay);
  const successfulJobToShow = latestJob(successfulJobs(jobsEnabledForDisplay));

  // show all active jobs if any, otherwise show all failed jobs and/or the latest successful job
  const jobsToShow = activeJobsToShow.length
    ? activeJobsToShow
    : removeInvalidJobs([...failedJobsToShow, successfulJobToShow]);

  if (!jobsToShow?.length) return null;

  return (
    <section>
      {jobsToShow.map((job, idx) => (
        <JobBanner key={idx} job={job} notificationSettings={notificationSettings} />
      ))}
    </section>
  );
};

const sortByLatest = sortBy<JobDetails>((x) => x?.lastUpdated ?? new Date(0));
const latestJob = compose<JobDetails>(head, sortByLatest);
const isEnabled = (job: JobDetails, settings: JobTypeNotificationSetting[] | undefined): boolean => {
  if (!settings) return true;
  const setting = settings?.find(
    (s) =>
      s.jobTypes.some((t) => t === job.jobType) &&
      ((job.isActive && s.showActive) ||
        (job.isFailed && s.showFailed) ||
        (job.isSuccessful && s.showSuccessful))
  );
  return !!setting;
};
const removeInvalidJobs = filter<JobDetails>((a): a is JobDetails => !!a);
const activeJobs = filter<JobDetails>((j) => j.isActive);
const failedJobs = filter<JobDetails>((j) => j.isFailed);
const successfulJobs = filter<JobDetails>((j) => j.isSuccessful);

export default JobNotificationSection;
