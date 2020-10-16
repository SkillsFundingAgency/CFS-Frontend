import {LoadingStatus} from "../LoadingStatus";
import {Link} from "react-router-dom";
import {DateFormatter} from "../DateFormatter";
import Pagination from "../Pagination";
import * as React from "react";
import {getCalculationsService} from "../../services/calculationService";
import {CalculationSummary} from "../../types/CalculationSummary";
import {useEffect, useState} from "react";

export function AdditionalCalculations(props: { specificationId: string }) {
    const [additionalCalculations, setAdditionalCalculations] = useState<CalculationSummary>({
        results: [],
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        lastPage: 0,
        pagerState: {
            lastPage: 0,
            currentPage: 0,
            pages: [],
            displayNumberOfPages: 0,
            nextPage: 0,
            previousPage: 0
        },
        startItemNumber: 0,
        totalCount: 0,
        totalErrorResults: 0,
        totalResults: 0
    });
    const [additionalCalculationsSearchTerm, setAdditionalCalculationSearchTerm] = useState('');
    const [isLoadingAdditionalCalculations, setIsLoadingAdditionalCalculations] = useState(true);
    const [statusFilter] = useState("");

    useEffect(() => {
        populateAdditionalCalculations(props.specificationId, statusFilter, 1, additionalCalculationsSearchTerm);
    }, [props.specificationId])

    useEffect(() => {
        if (additionalCalculations.currentPage !== 0) {
            setIsLoadingAdditionalCalculations(false);
        }
    }, [additionalCalculations.results]);

    function populateAdditionalCalculations(specificationId: string, status: string, pageNumber: number, searchTerm: string) {
        getCalculationsService({
            specificationId: specificationId,
            status: status,
            pageNumber: pageNumber,
            searchTerm: additionalCalculationsSearchTerm,
            calculationType: "Additional"
        }).then((response) => {
            if (response.status === 200) {
                const result = response.data as CalculationSummary;
                setAdditionalCalculations(result)
            }
        }).finally(() => setIsLoadingAdditionalCalculations(false));
    }

    function movePage(pageNumber: number) {
        populateAdditionalCalculations(props.specificationId, statusFilter, pageNumber, additionalCalculationsSearchTerm);
    }


    return <section className="govuk-tabs__panel" id="additional-calculations">
        <LoadingStatus title={"Loading additional calculations"}
                       hidden={!isLoadingAdditionalCalculations}
                       description={"Please wait whilst additional calculations are loading"}/>
        <div className="govuk-grid-row" hidden={isLoadingAdditionalCalculations}>
            <div className="govuk-grid-column-two-thirds">
                <h2 className="govuk-heading-l">Additional calculations</h2>
            </div>
            <div className="govuk-grid-column-one-third ">
                <p className="govuk-body right-align"
                   hidden={additionalCalculations.totalResults === 0}>
                    Showing {additionalCalculations.startItemNumber} - {additionalCalculations.endItemNumber}
                    of {additionalCalculations.totalResults}
                    calculations
                </p>
            </div>
        </div>
        <div className="govuk-grid-row" hidden={isLoadingAdditionalCalculations}>
            <div className="govuk-grid-column-two-thirds">
                <div className="govuk-form-group search-container">
                    <input className="govuk-input input-search" id="event-name" name="event-name" type="text" onChange={(e) => setAdditionalCalculationSearchTerm(e.target.value)}/>
                </div>
            </div>
            <div className="govuk-grid-column-one-third">
                <button className="govuk-button" type="submit" onClick={() => populateAdditionalCalculations(props.specificationId, statusFilter, 1, additionalCalculationsSearchTerm)}>Search</button>
            </div>
        </div>
        <table className="govuk-table" hidden={isLoadingAdditionalCalculations}>
            <thead className="govuk-table__head">
            <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">Additional calculation name</th>
                <th scope="col" className="govuk-table__header">Status</th>
                <th scope="col" className="govuk-table__header">Value type</th>
                <th scope="col" className="govuk-table__header">Last edited date</th>
            </tr>
            </thead>
            <tbody className="govuk-table__body">
            {additionalCalculations.results.map((ac, index) =>
                <tr className="govuk-table__row" key={index}>
                    <td className="govuk-table__cell text-overflow">
                        <Link to={`/Specifications/EditAdditionalCalculation/${ac.id}`}>{ac.name}</Link>
                    </td>
                    <td className="govuk-table__cell">{ac.status}</td>
                    <td className="govuk-table__cell">{ac.valueType}</td>
                    <td className="govuk-table__cell"><DateFormatter date={ac.lastUpdatedDate}
                                                                     utc={false}/></td>
                </tr>
            )}
            </tbody>
        </table>

        <div className="govuk-warning-text"
             hidden={additionalCalculations.totalCount > 0 || isLoadingAdditionalCalculations}>
            <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
            <strong className="govuk-warning-text__text">
                <span className="govuk-warning-text__assistive">Warning</span>
                No additional calculations available. &nbsp;
                <Link to={`/specifications/createadditionalcalculation/${props.specificationId}`}>
                    Create a calculation
                </Link>
            </strong>
        </div>
        {additionalCalculations.totalResults > 0 &&
        <nav className="govuk-!-margin-top-9" role="navigation" aria-label="Pagination">
            <div className="pagination__summary">
                <p className="govuk-body right-align">
                    Showing
                    {additionalCalculations.startItemNumber} - {additionalCalculations.endItemNumber}
                    of {additionalCalculations.totalResults} calculations
                </p>
            </div>
            <Pagination currentPage={additionalCalculations.currentPage}
                        lastPage={additionalCalculations.lastPage}
                        callback={movePage}/>
        </nav>}
    </section>
}