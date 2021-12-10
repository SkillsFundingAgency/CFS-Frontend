import React from "react";

import { Pagination } from "./Pagination";
import { TableResultsSummary } from "./TableResultsSummary";

export interface TableNavBottomProps {
  totalCount: number | undefined;
  totalResults: number | undefined;
  startItemNumber: number | undefined;
  endItemNumber: number | undefined;
  currentPage: number | undefined;
  lastPage: number | undefined;
  onPageChange: (page: number) => void;
  navCss?: string;
}

export const TableNavBottom = ({
  totalCount,
  totalResults,
  currentPage,
  lastPage,
  startItemNumber,
  endItemNumber,
  navCss,
  onPageChange,
}: TableNavBottomProps): JSX.Element | null => {
  if (!totalResults || !totalCount || !startItemNumber || !endItemNumber || !currentPage || !lastPage)
    return null;

  return (
    <nav
      className={navCss ?? "govuk-!-margin-top-5 govuk-!-margin-bottom-9"}
      aria-labelledby="pagination-navigation"
    >
      <TableResultsSummary
        totalResults={totalResults}
        startItemNumber={startItemNumber}
        endItemNumber={endItemNumber}
      />
      <Pagination currentPage={currentPage} lastPage={lastPage} callback={onPageChange} />
    </nav>
  );
};
