import { Tag, TagTypes } from "components/Tag";
import React from "react";
import { PublishedProviderVersion } from "types/PublishedProvider/PublishedProviderVersion";

import { ProviderSummary } from "../../types/ProviderSummary";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { LoadingFieldStatus } from "../LoadingFieldStatus";

export interface ProviderSummarySectionProps {
  specification: SpecificationSummary | undefined;
  isLoadingSpecification: boolean;
  providerVersion: ProviderSummary | undefined;
  publishedProviderVersion: PublishedProviderVersion | undefined;
  isLoadingProviderVersion: boolean;
  isLoadingPublishedProviderVersion: boolean;
  status: string;
  fundingTotal: string;
}

export function ProviderSummarySection(props: ProviderSummarySectionProps) {
  return (
    <div>
      <div className="govuk-grid-row govuk-grid-column-full govuk-!-margin-bottom-7">
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-1">
          {props.isLoadingProviderVersion ? (
            <LoadingFieldStatus title="Loading..." />
          ) : props.providerVersion ? (
            props.providerVersion.name
          ) : (
            ""
          )}
          {!props.isLoadingPublishedProviderVersion && props.publishedProviderVersion?.isIndicative ? (
            <span className="govuk-!-margin-left-1">
              <Tag text="indicative" type={TagTypes.grey} />
            </span>
          ) : null}
        </h1>
        <span className="govuk-caption-l">
          {props.isLoadingSpecification ? (
            <LoadingFieldStatus title="Loading..." />
          ) : props.specification ? (
            `${props.specification.fundingStreams[0]?.name} for ${props.specification.fundingPeriod?.name}`
          ) : (
            ""
          )}
        </span>
      </div>
      <div className="govuk-grid-row govuk-!-margin-bottom-5">
        <div className="govuk-grid-column-one-half">
          <dl className="govuk-summary-list govuk-summary-list--no-border">
            <div className="govuk-summary-list__row">
              {/*<div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">
          <label id={`${props.id}-label`} htmlFor={props.id}>
            {props.title}
          </label>
        </dt>
        <dd className="govuk-summary-list__value" id={props.id} aria-labelledby={`${props.id}-label`}>
          {props.children}
        </dd>
      </div>*/}
              <dt className="govuk-summary-list__key">
                <label id="ukprn-label">UKPRN</label>
              </dt>
              <dd className="govuk-summary-list__value" aria-labelledby="ukprn-label">
                {props.isLoadingProviderVersion ? (
                  <LoadingFieldStatus title="Loading..." />
                ) : props.providerVersion?.ukprn ? (
                  props.providerVersion.ukprn
                ) : (
                  ""
                )}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                <label id="specification-label">Specification</label>
              </dt>
              <dd className="govuk-summary-list__value" aria-labelledby="specification-label">
                {props.isLoadingSpecification ? (
                  <LoadingFieldStatus title="Loading..." />
                ) : props.specification ? (
                  props.specification.name
                ) : (
                  ""
                )}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                <label id="status-label">Latest status</label>
              </dt>
              <dd className="govuk-summary-list__value" aria-labelledby="status-label">
                {props.status === "" ? <LoadingFieldStatus title="Loading..." /> : props.status}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                <label id="funding-label">Funding total</label>
              </dt>
              <dd className="govuk-summary-list__value" aria-labelledby="funding-label">
                {props.fundingTotal === "" ? <LoadingFieldStatus title="Loading..." /> : props.fundingTotal}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
