import React, {useEffect, useState} from 'react';

export function PermissionStatus(props: { requiredPermissions: string[] }) {
    const [requiredPermissions] = useState({status: props.requiredPermissions});
    useEffect(() => {
    }, [props.requiredPermissions]);

    let permissionAlertMessage = "";
    if (requiredPermissions.status.length > 0)
    {
        permissionAlertMessage = "You do not have permissions to perform the following actions: ";
        for (let i = 0; i < requiredPermissions.status.length; i++)
        {
            if (i != 0)
            {
                permissionAlertMessage += ", ";
            }
            permissionAlertMessage += requiredPermissions.status[i];
        }
    }

    return requiredPermissions.status.length > 0 ? <div className="govuk-warning-text permissions-banner">
        <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
        <strong className="govuk-warning-text__text">
            <span className="govuk-warning-text__assistive">Warning</span>
            {permissionAlertMessage}
        </strong>
    </div> : null
}