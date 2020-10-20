import React from "react";
import {CompilerMessage} from "../../types/Calculations/PreviewResponse";

export function CompliationErrorMessageList(props:{compilerMessages:CompilerMessage[], errorMessage:string}){
    return <div className="govuk-error-summary">
        <h2 className="govuk-error-summary__title">
            There was a compilation error
        </h2>
        <div className="govuk-error-summary__body">
            <table className={"govuk-table"}>
                <thead className={"govuk-table__head"}>
                <tr className={"govuk-table__row"}>
                    <th className="govuk-table__header">Error message</th>
                    <th className="govuk-table__header">Start line</th>
                    <th className="govuk-table__header">Start char</th>
                    <th className="govuk-table__header">End line</th>
                    <th className="govuk-table__header">End char</th>
                </tr>
                </thead>
                <tbody>
                {props.compilerMessages.map((cm, index) =>
                    <tr key={index} className={"govuk-table__row"}>
                        <td className="govuk-table__cell">{cm.message}</td>
                        <td className="govuk-table__cell">{cm.location?.startLine}</td>
                        <td className="govuk-table__cell">{cm.location?.startChar}</td>
                        <td className="govuk-table__cell">{cm.location?.endLine}</td>
                        <td className="govuk-table__cell">{cm.location?.endChar}</td>
                    </tr>
                )}
                </tbody>
            </table>
            <ul className="govuk-error-summary__list">
                <li hidden={props.errorMessage.length === 0}>{props.errorMessage}</li>

            </ul>
        </div>
    </div>
}