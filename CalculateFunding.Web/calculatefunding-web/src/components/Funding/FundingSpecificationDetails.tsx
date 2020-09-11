import React from "react";
import {SpecificationSummary} from "../../types/SpecificationSummary";

export function FundingSpecificationDetails(props: {specification: SpecificationSummary}) {
    return (
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
                <table className="govuk-table">
                    <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th className="govuk-table__header">Specification Details</th>
                        <th className="govuk-table__header">Info</th>
                        <th className="govuk-table__header">Funding</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__header">Funding Period</td>
                        <td className="govuk-table__cell">{props.specification.fundingPeriod.name}</td>
                        <td className="govuk-table__cell"></td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__header">Specification selected</td>
                        <td className="govuk-table__cell">{props.specification.name}</td>
                        <td className="govuk-table__cell"></td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__header">Funding Stream</td>
                        <td className="govuk-table__cell">{props.specification.fundingStreams.map(stream => stream.name)}</td>
                        <td className="govuk-table__cell"></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}