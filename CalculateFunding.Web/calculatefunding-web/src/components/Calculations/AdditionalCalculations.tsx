import {LoadingStatus} from "../LoadingStatus";
import {Link} from "react-router-dom";
import {DateFormatter} from "../DateFormatter";
import Pagination from "../Pagination";
import * as React from "react";
import {searchCalculationsForSpecification} from "../../services/calculationService";
import {CalculationSearchResultResponse, CalculationType} from "../../types/CalculationSearchResponse";
import {useEffect, useState} from "react";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";
import {useCalculationCircularDependencies} from "../../hooks/Calculations/useCalculationCircularDependencies";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import {ErrorProps} from "../../hooks/useErrors";

export interface AdditionalCalculationsProps {
    specificationId: string,
    addError: (props: ErrorProps) => void,
}

export function AdditionalCalculations(props: AdditionalCalculationsProps) {
    const [additionalCalculations, setAdditionalCalculations] = useState<CalculationSearchResultResponse>({
        calculations: [],
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
    const [isLoadingAdditionalCalculations, setIsLoadingAdditionalCalculations] = useState(false);
    const [statusFilter] = useState("");
    const {canCreateAdditionalCalculation} =
        useSpecificationPermissions(props.specificationId, [SpecificationPermissions.CreateAdditionalCalculations]);
    const {circularReferenceErrors, isLoadingCircularDependencies} =
        useCalculationCircularDependencies(props.specificationId,
            err => props.addError({error: err, description: "Error while checking for circular reference errors"}));

    useEffect(() => {
        findAdditionalCalculations(props.specificationId, statusFilter, 1, additionalCalculationsSearchTerm);
    }, [props.specificationId])

    function findAdditionalCalculations(specificationId: string, status: string, pageNumber: number, searchTerm: string) {
        if (!isLoadingAdditionalCalculations) {
            setIsLoadingAdditionalCalculations(true);
        }
        searchCalculationsForSpecification({
            specificationId: specificationId,
            status: status,
            pageNumber: pageNumber,
            searchTerm: additionalCalculationsSearchTerm,
            calculationType: CalculationType.Additional
        }).then((response) => {
            setAdditionalCalculations(response.data);
            setIsLoadingAdditionalCalculations(false);
        }).catch((err) => props.addError({error: err, description: "Error while fetching additional calculations", fieldName: "additional-calculations"}));
    }

    function movePage(pageNumber: number) {
        findAdditionalCalculations(props.specificationId, statusFilter, pageNumber, additionalCalculationsSearchTerm);
    }

    return <section className="govuk-tabs__panel" id="additional-calculations">
        {isLoadingAdditionalCalculations &&
            <LoadingStatus title="Loading additional calculations"
                description="Please wait" />
        }
        <div className="govuk-grid-row" hidden={isLoadingAdditionalCalculations}>
            <div className="govuk-grid-column-two-thirds">
                <h2 className="govuk-heading-l">Additional calculations</h2>
            </div>
            <div className="govuk-grid-column-one-third ">
                <p className="govuk-body right-align"
                    hidden={additionalCalculations.totalResults === 0}>
                    {`Showing ${additionalCalculations.startItemNumber} - ${additionalCalculations.endItemNumber} of 
                        ${additionalCalculations.totalResults} calculations`}
                </p>
            </div>
        </div>
        <div className="govuk-grid-row" hidden={isLoadingAdditionalCalculations}>
            <div className="govuk-grid-column-two-thirds">
                <div className="govuk-form-group search-container">
                    <input
                        className="govuk-input input-search"
                        id="event-name"
                        name="event-name"
                        type="text"
                        onChange={(e) => setAdditionalCalculationSearchTerm(e.target.value)} />
                </div>
            </div>
            <div className="govuk-grid-column-one-third">
                <button
                    className="govuk-button"
                    type="submit"
                    onClick={() => findAdditionalCalculations(props.specificationId, statusFilter, 1, additionalCalculationsSearchTerm)}>
                    Search
                </button>
            </div>
        </div>

        {!isLoadingAdditionalCalculations &&
            <table className="govuk-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">Additional calculation name</th>
                        <th scope="col" className="govuk-table__header">Status</th>
                        <th scope="col" className="govuk-table__header">Value type</th>
                        <th scope="col" className="govuk-table__header">Last edited date</th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    {additionalCalculations.calculations.map((ac, index) => {
                        const hasError = circularReferenceErrors && circularReferenceErrors.some((error) => error.node.calculationid === ac.id);

                        return <tr className="govuk-table__row" key={index}>
                            <td className="govuk-table__cell text-overflow">
                                <Link to={`/Specifications/EditCalculation/${ac.id}`}>{ac.name}</Link>
                                <br />
                                {hasError ? <span className="govuk-error-message">circular reference detected in calculation script</span> : ""}
                            </td>
                            <td className="govuk-table__cell">
                                {isLoadingCircularDependencies ? <LoadingFieldStatus title="Checking..." /> : hasError ? "Error" : ac.status}
                            </td>
                            <td className="govuk-table__cell">{ac.valueType}</td>
                            <td className="govuk-table__cell">
                                <DateFormatter date={ac.lastUpdatedDate} utc={false} />
                            </td>
                        </tr>
                    }
                    )}
                </tbody>
            </table>
        }

        {!isLoadingAdditionalCalculations && additionalCalculations &&
            <>
                {additionalCalculations.calculations.length === 0 &&
                    <div className="govuk-warning-text">
                        <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                        <strong className="govuk-warning-text__text">
                            <span className="govuk-warning-text__assistive">Warning</span>
                    No additional calculations available. &nbsp;
                    {canCreateAdditionalCalculation &&
                                <Link to={`/specifications/CreateAdditionalCalculation/${props.specificationId}`}>
                                    Create a calculation
                    </Link>
                            }
                        </strong>
                    </div>
                }
                {additionalCalculations.calculations.length > 0 && canCreateAdditionalCalculation &&
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <Link to={`/specifications/CreateAdditionalCalculation/${props.specificationId}`}
                                className="govuk-link govuk-button">
                                Create a calculation
                    </Link>
                        </div>
                    </div>
                }
            </>
        }
        {additionalCalculations.totalResults > 0 &&
            <nav className="govuk-!-margin-top-9" role="navigation" aria-label="Pagination">
                <div className="pagination__summary" hidden={additionalCalculations.currentPage === 1 && additionalCalculations.pagerState.lastPage <= 1}>
                    <p className="govuk-body right-align">
                        {`Showing ${additionalCalculations.startItemNumber} - ${additionalCalculations.endItemNumber} of 
                        ${additionalCalculations.totalResults} calculations`}
                    </p>
                </div>
                <Pagination currentPage={additionalCalculations.currentPage}
                    lastPage={additionalCalculations.pagerState.lastPage}
                    callback={movePage} />
            </nav>}
    </section>
}