import * as React from "react";

export interface LoadingStatusNotifierProps {
  id?: string;
  notifications: LoadingNotification[];
  testId?: string;
}

export interface LoadingNotification {
  isActive?: boolean; // if not specified, defaults to active
  title: string;
  subTitle?: string;
  description?: string;
}

export const LoadingStatusNotifier = ({
  id = "loading-status-notifier",
  notifications,
  testId = "loader",
}: LoadingStatusNotifierProps): JSX.Element | null => {
  const firstActiveNotification = notifications.find((n) => n.isActive !== false);

  if (!firstActiveNotification) return null;

  return (
    <div id={id} className="govuk-grid-row" data-testid={testId}>
      <div className="govuk-grid-column-full govuk-!-margin-top-9">
        <h2 className="govuk-heading-l center-align">{firstActiveNotification.title}</h2>
        <h3 className="govuk-heading-m center-align">{firstActiveNotification.subTitle}</h3>
        <div className="loader loader-full" role="alert" aria-live="assertive" />
        <p className="govuk-body center-align">{firstActiveNotification.description}</p>
      </div>
    </div>
  );
};
