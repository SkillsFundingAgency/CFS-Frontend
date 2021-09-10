import * as React from "react";
import { useState } from "react";

interface SortableButtonProps {
  sortName: string;
  title: string;
  callback: any;
}

enum sortStatus {
  none = "none",
  ascending = "ascending",
  descending = "descending",
}

export default function SortableButton({ sortName, title, callback }: SortableButtonProps) {
  const [buttonSortStatus, setButtonSortStatus] = useState<sortStatus>(sortStatus.none);

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
