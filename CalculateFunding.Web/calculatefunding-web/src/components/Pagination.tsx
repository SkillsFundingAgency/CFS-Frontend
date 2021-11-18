import React from "react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  callback: (page: number) => void;
}

export const Pagination = ({ currentPage, lastPage, callback }: PaginationProps): JSX.Element => {
  return (
    <ul className="pagination" hidden={currentPage === 1 && lastPage === 0}>
      {currentPage - 1 < 1 ? (
        ""
      ) : (
        <li className="pagination__item">
          <button className="pagination__link" id="btnPreviousPage" onClick={() => callback(currentPage - 1)}>
            <span aria-hidden="true" role="presentation">
              «
            </span>{" "}
            Previous Page
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
          <button className="pagination__link current" aria-current="true">
            {currentPage}
          </button>
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
            Next Page{" "}
            <span aria-hidden="true" role="presentation">
              »
            </span>
          </button>
        </li>
      )}
    </ul>
  );
};
