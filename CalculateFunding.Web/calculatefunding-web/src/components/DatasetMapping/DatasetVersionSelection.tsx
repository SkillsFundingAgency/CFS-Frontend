import React from "react";
import {DateFormatter} from "../DateFormatter";
import {Dataset} from "../../types/Datasets/RelationshipData";

export interface DatasetVersionSelectionProps {
    newVersionNumber: number | undefined,
    dataset: Dataset,
    changeVersion: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function DatasetVersionSelection(props: DatasetVersionSelectionProps) {
    return <div className="govuk-radios govuk-radios--small">
        {props.dataset.versions.slice(0, 5).map((version, index) =>
            <div className="govuk-radios__item" key={index}>
                <input className="govuk-radios__input"
                       id={`datasource-${version.version}`}
                       name={`datasource-${version.version}`}
                       type="radio"
                       value={version.version}
                       defaultChecked={version.version === props.newVersionNumber || version.version === props.dataset.selectedVersion}
                       onChange={props.changeVersion}/>
                <label className="govuk-label govuk-radios__label" htmlFor={`datasource-${version.version}`}>
                    {props.dataset.name} (version {version.version})
                    <div className="govuk-!-margin-top-1">
                        <details className="govuk-details  summary-margin-removal" data-module="govuk-details">
                            <div className="govuk-details__text summary-margin-removal">
                                <p className="govuk-body-s">
                                    <strong>Version notes:</strong>
                                </p>
                                <p className="govuk-body-s">
                                    <strong>Last updated:</strong>
                                    <DateFormatter date={version.date} /></p>
                                <p className="govuk-body-s">
                                    <strong>Last updated by:</strong> {version.author.name}
                                </p>
                            </div>
                        </details>
                    </div>
                </label>
            </div>
        )}
    </div>
}