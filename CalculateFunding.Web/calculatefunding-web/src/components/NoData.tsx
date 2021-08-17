import React from "react";

export function NoData(props: { hidden?: boolean, excludeSearchTips?: boolean }) {
    return (
        <div className="no-results govuk-!-font-size-19" 
             data-testid="no-data"
             hidden={!!props.hidden}>
            <p className="govuk-body govuk-!-font-weight-bold">There are no matching results.</p>
            {!props.excludeSearchTips &&
            <>
                <p className="govuk-body">Improve your search results by:</p>
                <ul className="govuk-list govuk-list--bullet">
                    <li>removing filters</li>
                    <li>double-checking your spelling</li>
                    <li>using fewer keywords</li>
                    <li>searching for something less specific</li>
                </ul>
            </>
            }
        </div>
    );
}