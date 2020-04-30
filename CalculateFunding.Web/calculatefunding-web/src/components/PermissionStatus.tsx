import React from 'react';

export function PermissionStatus(props: { requiredPermissions: string[] }) {

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

    return props.requiredPermissions.length > 0 ?
        <div className="govuk-warning-text permissions-banner">
            <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
            <strong className="govuk-warning-text__text">
                <span className="govuk-warning-text__assistive">Warning</span>
                <span data-testid="permission-alert-message">{permissionAlertMessage}</span>
            </strong>
        </div> : null
}