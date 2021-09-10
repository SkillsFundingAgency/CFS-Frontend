import React from "react";

interface TableResultsProps {
  startItemNumber: number;
  endItemNumber: number;
  totalResults: number;
}

export const TableResults = ({ startItemNumber, endItemNumber, totalResults }: TableResultsProps) => {
  return (
    <div className="pagination__summary">
      Showing {startItemNumber} - {endItemNumber} of {totalResults} results
    </div>
  );
};
