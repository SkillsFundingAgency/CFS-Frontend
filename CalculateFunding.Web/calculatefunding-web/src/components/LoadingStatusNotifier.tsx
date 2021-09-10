import * as React from "react";

export interface LoadingNotification {
  isActive: boolean;
  title: string;
  subTitle?: string;
  description?: string;
}

export const LoadingStatusNotifier = (props: {
  id?: string;
  notifications: LoadingNotification[];
  testid?: string;
}) => {
  const firstActiveNotification = props.notifications.find((n) => n.isActive);

  if (!firstActiveNotification) return null;

  return (
    <div id={props.id} className="govuk-grid-row" data-testid="loader">
      <div className="govuk-grid-column-full govuk-!-margin-top-9">
        <h2 className="govuk-heading-l center-align">{firstActiveNotification.title}</h2>
        <h3 className="govuk-heading-m center-align">{firstActiveNotification.subTitle}</h3>
        <div className="loader loader-full" role="alert" aria-live="assertive" />
        <p className="govuk-body center-align">{firstActiveNotification.description}</p>
      </div>
    </div>
  );
};
