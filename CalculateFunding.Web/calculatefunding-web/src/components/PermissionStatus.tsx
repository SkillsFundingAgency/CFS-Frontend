import React from 'react';

export function PermissionStatus(props: { requiredPermissions: string[], hidden: boolean }) {

    let permissionAlertMessage = "";
    if (props.requiredPermissions.length > 0) {
        permissionAlertMessage = "You do not have permissions to perform the following actions: ";
        for (let i = 0; i < props.requiredPermissions.length; i++) {
            if (i > 0) {
                permissionAlertMessage += ", ";
            }
            permissionAlertMessage += props.requiredPermissions[i];
        }
    }
    if (props.hidden) {
        return null;
    } else {
        return props.requiredPermissions.length > 0 ?
            <div className="govuk-notification-banner" 
                 role="region" 
                 aria-labelledby="govuk-notification-banner-title" 
                 data-module="govuk-notification-banner">
                <div className="govuk-notification-banner__header">
                    <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                        Permissions
                    </h2>
                </div>
                <div className="govuk-notification-banner__content">
                    <span className="govuk-warning-text__assistive">Warning</span>
                    <p className="govuk-notification-banner__heading"
                       data-testid="permission-alert-message">
                        {permissionAlertMessage}
                    </p>
                </div>
            </div> : null
    }
}