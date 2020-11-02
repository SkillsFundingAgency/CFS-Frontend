import React from 'react';

export function Details(props: { title: string, body: string | null }) {
    return <details className="govuk-details" data-module="govuk-details">
        <summary className="govuk-details__summary">
    <span className="govuk-details__summary-text">
        {props.title}
    </span>
        </summary>
        <div className="govuk-details__text">
            {props.body}
        </div>
    </details>
}