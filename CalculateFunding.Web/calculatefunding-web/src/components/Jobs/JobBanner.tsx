import React from "react";

import { JobDetails } from "../../types/jobDetails";
import { RunningStatus } from "../../types/RunningStatus";
import { DateTimeFormatter } from "../DateTimeFormatter";
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

  const setting = notificationSettings?.find((s) => s.jobTypes.some((t) => t === job.jobType));

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

  return (
    <div
      data-testid="job-notification-banner"
      className={
        job.isFailed || (job.isComplete && job.failures.length > 0)
          ? "govuk-error-summary"
          : job.isActive
          ? "govuk-error-summary-orange"
          : "govuk-error-summary-green"
      }
      aria-labelledby="error-summary-title"
      aria-label="job-notification"
      role="alert"
      data-module="govuk-error-summary"
    >
      <h2 className="govuk-error-summary__title">
        {(job.isFailed || job.failures.length > 0) && <div>There is a problem</div>}
        <div>
          Job {job.statusDescription}: {job.jobDescription}
          {job.outcome != null && job.outcome.length > 0 ? ": " + job.outcome : ""}
        </div>
        {job.isActive && (
          <div
            className="loader loader-small"
            role="alert"
            aria-live="assertive"
            aria-label="Monitoring job"
          />
        )}
        {job.failures.length > 0 && (
          <ul className="govuk-list govuk-error-summary__list">
            {job.failures.map((f, i) => (
              <li key={i}>
                <p className="govuk-body">
                  {f.jobDescription}: {f.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {job.isFailed && <FailureDetails job={job} notificationSetting={setting} />}
          <li>
            <p className="govuk-body">
              <span>Job initiated by {job.invokerUserDisplayName} on </span>
              <span>
                <DateTimeFormatter date={job.created as Date} />
              </span>
            </p>
          </li>
          {(job.runningStatus === RunningStatus.InProgress || job.isComplete) && (
            <li>
              <p className="govuk-body-s">
                <strong>Results updated: </strong>
                <DateTimeFormatter date={job.lastUpdated as Date} />
              </p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

const FailureDetails = (props: {
  job: JobDetails;
  notificationSetting: JobTypeNotificationSetting | undefined;
}) => {
  return (
    <>
      {props.notificationSetting && props.notificationSetting.failDescription && (
        <li>
          <p className="govuk-body">{props.notificationSetting.failDescription}</p>
          Try again later.
        </li>
      )}
      {props.notificationSetting?.failureOutcomeDescription && (
        <li>
          <p className="govuk-body">{props.notificationSetting?.failureOutcomeDescription}</p>
        </li>
      )}
      <li>
        <p className="govuk-body-s">
          <span>Job ID: {props.job.jobId}</span>
        </p>
      </li>
    </>
  );
};

export default JobBanner;
