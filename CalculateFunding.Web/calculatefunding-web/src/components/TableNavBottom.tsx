import React from "react";

import { Pagination } from "./Pagination";
import { TableResultsSummary } from "./TableResultsSummary";

export interface TableNavBottomProps {
  totalCount: number | undefined;
  startItemNumber: number | undefined;
  endItemNumber: number | undefined;
  currentPage: number | undefined;
  lastPage: number | undefined;
  onPageChange: (page: number) => void;
}

export const TableNavBottom = ({
totalCount,
  currentPage,
  lastPage,
  startItemNumber,
  endItemNumber,
  onPageChange,
}: TableNavBottomProps): JSX.Element | null => {
  if (!totalCount || !startItemNumber || !endItemNumber || !currentPage || !lastPage)
    return null;

  return (
    <nav className={"hods-pagination"} aria-labelledby="pagination-navigation" aria-label="Pagination Navigation">
      <TableResultsSummary
        totalResults={totalCount}
        startItemNumber={startItemNumber}
        endItemNumber={endItemNumber}
      />
      <Pagination currentPage={currentPage} lastPage={lastPage} callback={onPageChange} />
    </nav>
  );
};
