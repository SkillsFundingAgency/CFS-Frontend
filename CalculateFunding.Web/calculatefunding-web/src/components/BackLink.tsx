import React from "react";
import {Link} from "react-router-dom";
import {useHistory} from "react-router";

export interface BackLinkProps {
    to?: string | undefined,
    children?: any,
    className?: string
}

export function BackLink({to = '', children = 'Back', className}: BackLinkProps) {
    const history = useHistory();

    const onClickHandler = () => {
        if (!to || to?.length === 0) {
            history.goBack();
        }
        return;
    }
    
    return (
        <Link
            className={`govuk-link govuk-back-link govuk-link--no-visited-state ${className || ''}`}
            to={to}
            onClick={onClickHandler}
        >
            {children}
        </Link>
    );
}