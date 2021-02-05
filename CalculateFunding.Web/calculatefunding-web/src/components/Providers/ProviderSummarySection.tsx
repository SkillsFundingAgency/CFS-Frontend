import React from "react";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {ProviderSummary} from "../../types/ProviderSummary";
import {LoadingFieldStatus} from "../LoadingFieldStatus";

export interface ProviderSummarySectionProps {
    specification: SpecificationSummary | undefined,
    isLoadingSpecification: boolean,
    providerVersion: ProviderSummary | undefined,
    isLoadingProviderVersion: boolean,
    status: string,
    fundingTotal: string
}

export function ProviderSummarySection(props: ProviderSummarySectionProps) {

    return (<div>
            <div className="govuk-grid-row govuk-grid-column-full govuk-!-margin-bottom-7">
                <h1 className="govuk-heading-xl govuk-!-margin-bottom-1">
                    {props.isLoadingProviderVersion ?
                        <LoadingFieldStatus
                            title="Loading..."/> : props.providerVersion ? props.providerVersion.name : ""}
                </h1>
                <span className="govuk-caption-l">
                {props.isLoadingSpecification ? <LoadingFieldStatus
                    title="Loading..."/> : props.specification ?
                    `${props.specification.fundingStreams[0]?.name} for ${props.specification.fundingPeriod?.name}` : ""}
            </span>
            </div>
            <div className="govuk-grid-row govuk-!-margin-bottom-5">
                <div className="govuk-grid-column-one-half">
                    <dl className="govuk-summary-list govuk-summary-list--no-border">
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">
                                UKPRN
                            </dt>
                            <dd className="govuk-summary-list__value">
                                {props.isLoadingProviderVersion ?
                                    <LoadingFieldStatus
                                        title="Loading..."/> : props.providerVersion?.ukprn ? props.providerVersion.ukprn : ""}
                            </dd>
                        </div>
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">
                                Specification
                            </dt>
                            <dd className="govuk-summary-list__value">
                                {props.isLoadingSpecification ? <LoadingFieldStatus
                                    title="Loading..."/> : props.specification ? props.specification.name : ""}
                            </dd>
                        </div>
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">
                                Latest status
                            </dt>
                            <dd className="govuk-summary-list__value">
                                {props.status === "" ? <LoadingFieldStatus title="Loading..."/> : props.status}
                            </dd>
                        </div>
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">
                                Funding total
                            </dt>
                            <dd className="govuk-summary-list__value">
                                {props.fundingTotal === "" ?
                                    <LoadingFieldStatus title="Loading..."/> : props.fundingTotal}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}