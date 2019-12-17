import React from 'react';

export default function Pagination(props: { currentPage: number, lastPage: number, callback: any }) {
    const callback = props.callback;

    return (
        <ul className="pagination">
            <li className="hasPrevious">
                <button id="btnFirstPage" title="View First Page"
                        disabled={props.currentPage === 1}
                        onClick={() => callback(1)}><span
                    className="govuk-body">&lt;&lt;</span>
                </button>
            </li>
            <li>
                <button id="btnPreviousPage" disabled={props.currentPage === 1}
                        onClick={() => callback(props.currentPage - 1)}><span
                    className="govuk-body">&lt;</span></button>
            </li>
            <li>
                <button hidden={(props.currentPage - 2) < 1} onClick={() => callback(props.currentPage - 2)}><span
                    className="govuk-body">{props.currentPage - 2}</span></button>
            </li>
            <li>
                <button hidden={(props.currentPage - 1) < 1} onClick={() => callback(props.currentPage - 1)}><span
                    className="govuk-body">{props.currentPage - 1}</span></button>
            </li>
            <li>
                <button disabled><span className="govuk-body">{props.currentPage}</span></button>
            </li>
            <li>
                <button hidden={(props.currentPage + 1) > props.lastPage} onClick={() => callback(props.currentPage + 1)}><span
                    className="govuk-body">{props.currentPage + 1}</span></button>
            </li>
            <li>
                <button hidden={(props.currentPage + 2) > props.lastPage} onClick={() => callback(props.currentPage +2)}><span
                    className="govuk-body">{props.currentPage + 2}</span></button>
            </li>
            <li className="hasNext">
                <button id="btnNextPage" title="View Next Page"
                        disabled={props.currentPage === props.lastPage}
                        onClick={() => callback(props.currentPage + 1)}><span
                    className="govuk-body">&gt;</span>
                </button>
            </li>
            <li className="hasNext">
                <button id="btnLastPage" title="View Last Page"
                        disabled={props.currentPage === props.lastPage}
                        onClick={() => callback(props.lastPage)}><span
                    className="govuk-body">&gt;&gt;</span>
                </button>
            </li>
        </ul>
    );
}