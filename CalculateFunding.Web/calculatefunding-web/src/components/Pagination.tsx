import "../styles/pagination.scss";

import React from "react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  callback: (page: number) => void;
}

export const Pagination = ({ currentPage, lastPage, callback }: PaginationProps): JSX.Element => {
  return (
    <ul className="hods-pagination__list-items" hidden={currentPage === 1 && lastPage === 0}>
      {currentPage - 1 < 1 ? (
        ""
      ) : (
        <li className="hods-pagination__item">
          <a className="hods-pagination__link" id="btnPreviousPage" onClick={() => callback(currentPage - 1)}>
            <span aria-hidden="true" role="presentation">
              «
            </span>{" "}
            Previous
          </a>
        </li>
      )}
      {currentPage - 2 >= 1 ? (
        <li className="hods-pagination__item">
          <a className="hods-pagination__link" onClick={() => callback(currentPage - 2)}>
            {currentPage - 2}
          </a>
        </li>
      ) : (
        ""
      )}
      {currentPage - 1 >= 1 ? (
        <li className="hods-pagination__item">
          <a className="hods-pagination__link" onClick={() => callback(currentPage - 1)}>
            {currentPage - 1}
          </a>
        </li>
      ) : (
        ""
      )}
      {lastPage === 1 || currentPage === 0 ? (
        ""
      ) : (
        <li className="hods-pagination__item">
          <a className="hods-pagination__link hods-pagination__link--current" aria-current="true">
            {currentPage}
          </a>
        </li>
      )}
      {currentPage + 1 <= lastPage ? (
        <li className="hods-pagination__item">
          <a className="hods-pagination__link" onClick={() => callback(currentPage + 1)}>
            {currentPage + 1}
          </a>
        </li>
      ) : (
        ""
      )}
      {currentPage + 2 <= lastPage ? (
        <li className="hods-pagination__item">
          <a className="hods-pagination__link" onClick={() => callback(currentPage + 2)}>
            {currentPage + 2}
          </a>
        </li>
      ) : (
        ""
      )}
      {currentPage + 1 > lastPage ? (
        ""
      ) : (
        <li className="hods-pagination__item">
          <a
            className="hods-pagination__link"
            id="btnNextPage"
            title="View Next Page"
            onClick={() => callback(currentPage + 1)}
          >
            Next {" "}
            <span aria-hidden="true" role="presentation">
              »
            </span>
          </a>
        </li>
      )}
    </ul>
  );
};
