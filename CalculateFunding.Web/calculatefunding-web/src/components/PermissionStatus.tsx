import React, {useMemo} from "react";
import {Permission} from "../types/Permission";
import {convertToPermissions} from "../helpers/permissionsHelper";
import {Link} from "react-router-dom";

export interface PermissionStatusProps {
    requiredPermissions: Permission[] | string[] | undefined,
    hidden: boolean
}

export function PermissionStatus(props: PermissionStatusProps) {
    const missingPermissions = useMemo<Permission[]>(() => {
            if (!props.requiredPermissions) return [];
            const perms = props.requiredPermissions as Permission[];
            if (perms && perms.length > 0) {
                return perms;
            } else {
                return convertToPermissions(props.requiredPermissions);
            }
        },
        [props.requiredPermissions])

    if (props.hidden || !props.requiredPermissions || props.requiredPermissions.length === 0) {

        return null;

    } else {

        return missingPermissions.length > 0 ?
            <div className="govuk-notification-banner govuk-!-margin-top-1"
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
                    <span className="govuk-notification-banner__heading govuk-!-width-full" data-testid="permission-alert-message">
                        You do not have permissions to perform the following {missingPermissions.length === 1 ? "action" : "actions"}: {' '}
                        {missingPermissions.length > 0 ? missingPermissions.join(', ') : props.requiredPermissions.join(', ')}. {' '}
                        <Link to="/Permissions/MyPermissions">View my user permissions</Link>
                    </span>
                </div>
            </div> : null
    }
}
