import React from "react";

export interface NoDataProps {
  hidden?: boolean;
  excludeSearchTips?: boolean;
}

export const NoData: React.FunctionComponent<NoDataProps> = ({ hidden, excludeSearchTips }) => {
  return (
    <div className="no-results govuk-!-font-size-19" data-testid="no-data" hidden={!!hidden}>
      <p className="govuk-body govuk-!-font-weight-bold">There are no matching results.</p>
      {!excludeSearchTips && (
        <>
          <p className="govuk-body">Improve your search results by:</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>removing filters</li>
            <li>double-checking your spelling</li>
            <li>using fewer keywords</li>
            <li>searching for something less specific</li>
          </ul>
        </>
      )}
    </div>
  );
};
