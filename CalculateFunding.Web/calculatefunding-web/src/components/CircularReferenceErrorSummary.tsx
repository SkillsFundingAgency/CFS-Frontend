import React, {useState} from "react";
import "../styles/CircularReferenceErrorSummary.scss";
import {CircularReferenceError} from "../types/Calculations/CircularReferenceError";
import {Link} from "react-router-dom";

interface CircularReferenceErrorSummaryProps {
    errors: CircularReferenceError[];
    defaultSize: number;
}

export const CircularReferenceErrorSummary = ({errors, defaultSize}: CircularReferenceErrorSummaryProps) => {
    const [showMore, setShowMore] = useState<boolean>(false);

    if (!errors || errors.length === 0) return null;

    const handleShowMore = () => {
        setShowMore(true);
    }

    const createLink = (e: CircularReferenceError) =>
        <Link className="govuk-link" to={`/Specifications/EditCalculation/${e.node.calculationid}`}>
            {e.node.calculationName}
        </Link>

    return (
        <div className="govuk-error-summary circular-reference-error" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}
            data-module="govuk-error-summary">
            <h2 className="govuk-error-summary__title" id="error-summary-title">
                Problems found with calculations
            </h2>
            <p className="govuk-body">Calculations are not able to run due to the following problem</p>
            <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                    <li>
                        <strong>One or more circular reference in your calculation script.</strong>
                    </li>
                </ul>
                <p className="govuk-body">This problem is affecting the following calculations</p>
                <h4 className="govuk-heading-s">Template calculations</h4>
                <ul className="govuk-list govuk-error-summary__list">
                    {errors.slice(0, defaultSize).map(e => (
                        <li key={e.node.calculationid}>
                            {createLink(e)}
                        </li>))
                    }
                    {errors.length > defaultSize && !showMore ? <li><button className="govuk-link" onClick={handleShowMore}>Show more</button></li> : null}
                    {showMore && errors.slice(defaultSize).map(e => (
                        <li key={e.node.calculationid}>
                            {createLink(e)}
                        </li>))
                    }
                </ul>
            </div>
        </div>
    )
}