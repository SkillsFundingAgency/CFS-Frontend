import React from "react";

interface TableResultsProps {
  startItemNumber: number;
  endItemNumber: number;
  totalResults: number;
}

export const TableResultsSummary = ({
  startItemNumber,
  endItemNumber,
  totalResults,
}: TableResultsProps): JSX.Element => {
  return <div className="hods-pagination__summary">
      Showing {startItemNumber} - {endItemNumber} of {totalResults} results
    </div>;
};
