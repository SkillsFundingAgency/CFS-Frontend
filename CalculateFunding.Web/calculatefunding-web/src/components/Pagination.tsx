import React from 'react';

export default function Pagination(props: { currentPage: number, lastPage: number, callback: any }) {
    const callback = props.callback;

    return (
        <ul className="pagination" hidden={props.currentPage === 1 && props.lastPage === 0}>
            {props.currentPage - 1 < 1 ? "" : <li className="pagination__item"><button className="pagination__link" id="btnPreviousPage" onClick={() => callback(props.currentPage - 1)}>« Previous Page</button></li>}
            {props.currentPage - 2 >= 1 ? <li className="pagination__item"><button className="pagination__link" onClick={() => callback(props.currentPage - 2)}>{props.currentPage -2}</button></li>:""}
            {props.currentPage - 1 >= 1 ? <li className="pagination__item"><button className="pagination__link" onClick={() => callback(props.currentPage - 1)}>{props.currentPage -1}</button></li>:""}
            {props.lastPage === 1 || props.currentPage === 0 ? "" : <li className="pagination__item"><button className="pagination__link current">{props.currentPage}</button></li>}
            {props.currentPage + 1 <= props.lastPage ? <li className="pagination__item"><button className="pagination__link" onClick={() => callback(props.currentPage + 1)}>{props.currentPage + 1}</button></li>:""}
            {props.currentPage + 2 <= props.lastPage ? <li className="pagination__item"><button className="pagination__link" onClick={() => callback(props.currentPage + 2)}>{props.currentPage + 2}</button></li>:""}
            {props.currentPage + 1 > props.lastPage ? "" : <li className="pagination__item"><button className="pagination__link" id="btnNextPage" title="View Next Page" onClick={() => callback(props.currentPage + 1)}>Next Page »</button></li>}

        </ul>
    );
}