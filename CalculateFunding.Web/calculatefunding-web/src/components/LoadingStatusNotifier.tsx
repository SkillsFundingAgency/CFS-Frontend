import * as React from "react";

export interface LoadingStatusNotifierProps {
  id?: string;
  notifications: LoadingNotification[];
  testId?: string; // default id but you can override this in the notification setting
}

export interface LoadingNotification {
  id?: string; // used for data-testid so it can be detected for tests
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
  // Important: if isActive not specified as false, defaults to active
  const firstActiveNotification = notifications.find((n) => n.isActive !== false);

  if (!firstActiveNotification) return null;

  return (
    <div id={id} role="alert" aria-label="Loading..." className="govuk-grid-row" data-testid={firstActiveNotification.id ?? testId}>
      <div className="govuk-grid-column-full govuk-!-margin-top-9">
        <h2 className="govuk-heading-l center-align">{firstActiveNotification.title}</h2>
        <h3 className="govuk-heading-m center-align">{firstActiveNotification.subTitle}</h3>
        <div className="loader loader-full" role="alert" aria-live="assertive" />
        <p className="govuk-body center-align">{firstActiveNotification.description}</p>
      </div>
    </div>
  );
};
