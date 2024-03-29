﻿import React from "react";

import { useErrorContext } from "../../../context/ErrorContext";
import { ApprovalMode } from "../../../types/ApprovalMode";
import {
  FundingActionType,
  PublishedProviderFundingCount,
} from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { FormattedNumber, NumberType } from "../../FormattedNumber";
import { LoadingFieldStatus } from "../../LoadingFieldStatus";
import { ChangeUploadBatch } from "../ChangeUploadBatch";
import { CsvDownloadPublishedProviders } from "../CsvDownloadPublishedProviders";

export interface FundingApprovalSummaryProps {
  approvalMode: ApprovalMode;
  specification: SpecificationSummary;
  fundingSummary: PublishedProviderFundingCount | undefined;
  isWaitingForJob: boolean;
}

export function FundingApprovalSummary(props: FundingApprovalSummaryProps) {
  const actionType = FundingActionType.Approve;
  const { addErrorToContext } = useErrorContext();

  if (!props.fundingSummary) {
    return (
      <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
        <LoadingFieldStatus title={"Loading funding summary"} />
      </div>
    );
  } else {
    const batchSize = props.fundingSummary ? props.fundingSummary.count : 0;
    const indicativeProviderCount = props.fundingSummary ? props.fundingSummary.indicativeProviderCount : 0;
    const isAre = indicativeProviderCount == 1 ? "is" : "are";

    return (
      <>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">
            <table className="govuk-table" aria-label="funding-summary-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header" aria-label={"Description"}>
                    &nbsp;
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Summary
                  </th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    {batchSize === 0 ? (
                      <div className="govuk-form-group--error">
                        Providers selected
                        <span className={"govuk-error-message"}>No eligible providers to be approved</span>
                      </div>
                    ) : (
                      "Providers selected"
                    )}
                  </th>
                  <td className="govuk-table__cell">
                    {((props.approvalMode === ApprovalMode.Batches && batchSize > 0) ||
                      props.approvalMode === ApprovalMode.All) && (
                      <CsvDownloadPublishedProviders
                        actionType={FundingActionType.Approve}
                        specificationId={props.specification.id}
                        addError={addErrorToContext}
                      />
                    )}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    <p className="govuk-body govuk-!-margin-bottom-0">{batchSize}</p>
                    {indicativeProviderCount > 0 && (
                      <p className="govuk-body-s govuk-!-margin-bottom-0">
                        Of which {indicativeProviderCount} {isAre} indicative
                      </p>
                    )}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Funding period
                  </th>
                  <td className="govuk-table__cell">{props.specification.fundingPeriod.name}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">&nbsp;</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Specification selected
                  </th>
                  <td className="govuk-table__cell">{props.specification.name}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">&nbsp;</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Total funding being approved
                  </th>
                  <td className="govuk-table__cell">
                    {props.specification.fundingStreams && props.specification.fundingStreams[0].name}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    <strong>
                      <FormattedNumber
                        value={props.fundingSummary.totalFunding ? props.fundingSummary.totalFunding : 0}
                        type={NumberType.FormattedMoney}
                      />
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {props.approvalMode === ApprovalMode.Batches && !props.isWaitingForJob && (
          <ChangeUploadBatch actionType={actionType} specification={props.specification} />
        )}
      </>
    );
  }
}
