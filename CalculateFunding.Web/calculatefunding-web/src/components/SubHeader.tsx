import React from "react";
import {Link} from "react-router-dom";

export interface SubHeaderProps {
    showSecondaryNav: boolean
}

export function SubHeader({showSecondaryNav = true}: SubHeaderProps) {
    return (
        <div className="govuk-grid-row govuk-phase-banner">
            <div className="govuk-grid-column-two-thirds">
                <p className="govuk-phase-banner__content">
                    <strong className="govuk-tag govuk-phase-banner__content__tag">
                        beta
                    </strong>
                    <span className="govuk-phase-banner__text">
                      This is a new service – your
                        {' '}
                        <a className="govuk-link"
                           href="https://forms.office.com/Pages/ResponsePage.aspx?id=yXfS-grGoU2187O4s0qC-YJWVbwgF21Alt5-BoBqL_RUNjY%20xSlJVTFhWR0wwTkgyRzc2RVdDN0VEMC4u">feedback</a>
                        {' '}
                        will help us to improve it.
                    </span>
                </p>
            </div>
            <div className="govuk-grid-column-one-third">
                {showSecondaryNav &&
                <nav className="right-align">
                    <span className="govuk-body-s govuk-!-margin-right-2">
                        <Link className="govuk-link" to="/Permissions/MyPermissions">My user permissions</Link>
                    </span>
                </nav>}
            </div>
        </div>
    );
}
