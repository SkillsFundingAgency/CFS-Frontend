import React, {MouseEvent} from "react";
import {Link} from "react-router-dom";
import {useHistory} from "react-router";

export interface BackLinkProps {
    to?: string | undefined,
    children?: any,
    className?: string,
    handleOnClick?: any
}

export function BackLink({to = '', children = 'Back', handleOnClick, className}: BackLinkProps) {
    const history = useHistory();

    const onClickHandler = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (!!handleOnClick) {
            handleOnClick();
        } else {
            if (!to || to?.length === 0) {
                history.goBack();
            } else {
                history.push(to);
            }
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