import React from "react";

import { JobDetails } from "../../types/jobDetails";
import { DateTimeFormatter } from "../DateTimeFormatter";
import { NotificationBanner, NotificationStatus } from "../NotificationBanner";
import { JobTypeNotificationSetting } from "./JobNotificationSection";

export interface JobBannerProps {
  job: JobDetails | undefined;
  notificationSettings?: JobTypeNotificationSetting[] | undefined;
}

// N.B. this is without any loading spinner - use JobNotificationBanner for that
const JobBanner = ({ job, notificationSettings }: JobBannerProps): JSX.Element | null => {
  if (!job) {
    return null;
  }

  const setting =
    notificationSettings?.find((s) => s.jobTypes.some((t) => t === job.jobType)) ||
    notificationSettings?.find((s) => s.jobTypes.length === 0);

  // if settings applied then we hide proactively
  if (
    notificationSettings &&
    (!setting ||
      (job.isActive && setting?.showActive === false) ||
      (job.isFailed && setting?.showFailed === false) ||
      (job.isSuccessful && setting?.showSuccessful === false))
  ) {
    return null;
  }

  const isFailed = job.isFailed || (job.isComplete && job.failures.length > 0);
  const status = isFailed
    ? NotificationStatus.Failed
    : job.isSuccessful
    ? NotificationStatus.Success
    : job.isActive
    ? NotificationStatus.Attention
    : NotificationStatus.Information;

  const { title } = getTitle(job, setting);

  return (
    <NotificationBanner token={"job-notification-banner"} title={title} isCollapsible={true} status={status}>
      <ul className="govuk-list">
        {job.isFailed && <FailureDetails job={job} notificationSetting={setting} />}
        <li aria-label="Job initiated by">
          <p className="govuk-body">
            <span>Job initiated by {job.invokerUserDisplayName} on </span>
            <span>
              <DateTimeFormatter date={job.created as Date} />
            </span>
          </p>
        </li>
        {isFailed && (
          <li aria-label="Job ID">
            <p className="govuk-body-s">Job ID: {job.jobId}</p>
          </li>
        )}
        {(job.isActive || job.isComplete) && (
          <li aria-label="Job last update">
            <p className="govuk-body-s">
              <strong>{job.isComplete ? "Completed: " : "Last update: "}</strong>
              <DateTimeFormatter date={job.lastUpdated as Date} />
            </p>
          </li>
        )}
      </ul>
    </NotificationBanner>
  );
};

const CustomFailureMessage = ({
  failDescription,
  failureOutcomeDescription,
}: {
  failDescription?: string;
  failureOutcomeDescription?: string;
}) => (
  <>
    {failDescription?.length && <h3 role="alert">{failDescription}</h3>}
    {failureOutcomeDescription && <p className="govuk-body">{failureOutcomeDescription}</p>}
  </>
);

const FailureDetails = (props: {
  job: JobDetails;
  notificationSetting: JobTypeNotificationSetting | undefined;
}) => (
  <>
    {props.notificationSetting &&
    (props.notificationSetting.failDescription?.length ||
      props.notificationSetting?.failureOutcomeDescription?.length) ? (
      <CustomFailureMessage
        failDescription={props.notificationSetting.failDescription}
        failureOutcomeDescription={props.notificationSetting.failureOutcomeDescription}
      />
    ) : (
      !!props.job.failures?.length &&
      props.job.failures.map((f, i) => (
        <li key={i}>
          <p className="govuk-body-s">
            {f.jobDescription}: {f.description}
          </p>
        </li>
      ))
    )}
  </>
);

const getTitle = (
  job: JobDetails,
  setting: JobTypeNotificationSetting | undefined
): { outcome: string; title: string } => {
  if (!job.isFailed) {
    const title = [`Job ${job.statusDescription}`, job.jobDescription, job.outcome]
      .filter((s) => s?.length)
      .join(": ");
    if (job.isSuccessful && setting && (setting.successTitle?.length || setting.successDescription?.length))
      return {
        outcome: job.outcome ?? "",
        title: setting.successTitle ?? setting.successDescription ?? title,
      };
    if (job.isActive && setting && (setting.activeTitle?.length || setting.activeDescription?.length))
      return {
        outcome: job.outcome ?? "",
        title: setting.activeTitle ?? setting.activeDescription ?? title,
      };
    return { outcome: job.outcome ?? "", title: title };
  }

  // failed scenario

  let outcome = job.outcome?.length ? job.outcome : "Something went wrong";
  if (setting?.failTitle?.length) {
    outcome = setting.failTitle;
  } else if (setting?.failDescription?.length) {
    outcome = setting.failDescription;
  } else if (setting?.failureOutcomeDescription?.length) {
    outcome = setting.failureOutcomeDescription;
  } else {
    const failures = job.failures.map((f) => `Job ${f.jobDescription}: ${f.description}`);
    if (failures.length) {
      outcome = outcome.concat(". ", failures.join(", "));
    }
  }

  const failTitle = setting?.failTitle?.length
    ? setting.failTitle
    : [`Job ${job.statusDescription}`, job.jobDescription, outcome].filter((s) => s?.length).join(": ");

  return { outcome, title: failTitle };
};

export default JobBanner;
