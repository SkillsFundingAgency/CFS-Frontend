import React from "react";

import { JobDetails } from "../../types/jobDetails";
import JobBanner from "./JobBanner";
import JobLoadingSpinner, { SpinnerDisplaySetting, SpinnerSettings } from "./JobLoadingSpinner";
import { JobTypeNotificationSetting } from "./JobNotificationSection";

export interface JobNotificationBannerProps {
  job: JobDetails | undefined;
  isCheckingForJob: boolean;
  notificationSettings?: JobTypeNotificationSetting[] | undefined;
  spinner?: SpinnerSettings;
}

// job banner with spinner option when loading - use JobBanner if you don't want spinner option
export const JobNotificationBanner = ({
  job,
  isCheckingForJob,
  notificationSettings,
  spinner = {
    display: SpinnerDisplaySetting.ShowPageSpinner,
    loadingDescription: "Please wait",
    loadingText: "Checking for background jobs",
  },
}: JobNotificationBannerProps): JSX.Element | null => {
  if (isCheckingForJob && spinner) {
    return <JobLoadingSpinner {...spinner} />;
  }

  if (!job) {
    return null;
  }

  return <JobBanner job={job} notificationSettings={notificationSettings} />;
};
