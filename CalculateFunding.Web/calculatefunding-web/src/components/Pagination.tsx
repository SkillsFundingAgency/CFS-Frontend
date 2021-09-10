import React from "react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  callback: Function;
}

export default function Pagination({ currentPage, lastPage, callback }: PaginationProps) {
  return (
    <ul className="pagination" hidden={currentPage === 1 && lastPage === 0}>
      {currentPage - 1 < 1 ? (
        ""
      ) : (
        <li className="pagination__item">
          <button className="pagination__link" id="btnPreviousPage" onClick={() => callback(currentPage - 1)}>
            « Previous Page
          </button>
        </li>
      )}
      {currentPage - 2 >= 1 ? (
        <li className="pagination__item">
          <button className="pagination__link" onClick={() => callback(currentPage - 2)}>
            {currentPage - 2}
          </button>
        </li>
      ) : (
        ""
      )}
      {currentPage - 1 >= 1 ? (
        <li className="pagination__item">
          <button className="pagination__link" onClick={() => callback(currentPage - 1)}>
            {currentPage - 1}
          </button>
        </li>
      ) : (
        ""
      )}
      {lastPage === 1 || currentPage === 0 ? (
        ""
      ) : (
        <li className="pagination__item">
          <button className="pagination__link current">{currentPage}</button>
        </li>
      )}
      {currentPage + 1 <= lastPage ? (
        <li className="pagination__item">
          <button className="pagination__link" onClick={() => callback(currentPage + 1)}>
            {currentPage + 1}
          </button>
        </li>
      ) : (
        ""
      )}
      {currentPage + 2 <= lastPage ? (
        <li className="pagination__item">
          <button className="pagination__link" onClick={() => callback(currentPage + 2)}>
            {currentPage + 2}
          </button>
        </li>
      ) : (
        ""
      )}
      {currentPage + 1 > lastPage ? (
        ""
      ) : (
        <li className="pagination__item">
          <button
            className="pagination__link"
            id="btnNextPage"
            title="View Next Page"
            onClick={() => callback(currentPage + 1)}
          >
            Next Page »
          </button>
        </li>
      )}
    </ul>
  );
}
