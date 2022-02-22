import * as React from "react";
import { useState } from "react";

interface SortableButtonProps {
  sortName: string;
  title: string;
  callback: any;
  sortAsc?: boolean;
}

enum sortStatus {
  none = "none",
  ascending = "ascending",
  descending = "descending",
}

export default function SortableButton({ sortName, title, callback, sortAsc }: SortableButtonProps) {
  const [buttonSortStatus, setButtonSortStatus] = useState<sortStatus>(
    sortAsc === undefined ? sortStatus.none : sortAsc ? sortStatus.descending : sortStatus.ascending
  );

  function sortByValue() {
    switch (buttonSortStatus) {
      case sortStatus.none:
        setButtonSortStatus(sortStatus.ascending);
        break;
      case sortStatus.ascending:
        setButtonSortStatus(sortStatus.descending);
        break;
      case sortStatus.descending:
        setButtonSortStatus(sortStatus.ascending);
        break;
      default:
        setButtonSortStatus(sortStatus.ascending);
        break;
    }
    callback(sortName);
  }

  return (
    <span aria-sort={buttonSortStatus}>
      <button onClick={() => sortByValue()}>{title}</button>
    </span>
  );
}
