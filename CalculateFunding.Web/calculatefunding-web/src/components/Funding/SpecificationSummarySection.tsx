import React from "react";
import {SpecificationSummary} from "../../types/SpecificationSummary";

export interface ISpecificationSummarySectionProps {
    specification: SpecificationSummary | undefined,
    isLoadingSpecification: boolean,
}

export function SpecificationSummarySection(props: ISpecificationSummarySectionProps) {

    if (props.isLoadingSpecification) {
        return null;
    }
    if (props.specification) {
        return (
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full govuk-!-margin-bottom-5">
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-1" data-testid="specName"> {props.specification.name} </h1>
                    <span className="govuk-caption-l" data-testid="fundingDetails">{props.specification.fundingStreams[0].name} for {props.specification.fundingPeriod.name}</span>
                </div>
            </div>
        );
    } else {
        return null;
    }
}