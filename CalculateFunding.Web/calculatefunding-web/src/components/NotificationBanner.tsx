import React from "react";

export interface NotificationBannerProps {
    // todo: extend for non-successful scenarios when they come up
    title: string,
    children: any
}

export function NotificationBanner(props: NotificationBannerProps) {
    return (
        <div className="govuk-notification-banner govuk-notification-banner--success"
             id="notification-banner"
             data-testid="notification-banner"
             role="alert"
             aria-labelledby="govuk-notification-banner-title"
             data-module="govuk-notification-banner">
            <div className="govuk-notification-banner__header">
                <h2 className="govuk-notification-banner__title"
                    id="govuk-notification-banner-title">
                    {props.title}
                </h2>
            </div>
            <div className="govuk-notification-banner__content">
                <p className="govuk-notification-banner__heading">
                    {props.children}
                </p>
            </div>
        </div>
    );
}