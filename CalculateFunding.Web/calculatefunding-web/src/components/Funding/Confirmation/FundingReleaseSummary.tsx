import { LoadingFieldStatus } from "components/LoadingFieldStatus";
import React from "react";
import { ReleaseFundingPublishedProvidersSummary } from "types/PublishedProvider/ReleaseFundingPublishedProvidersSummary";

import { useErrorContext } from "../../../context/ErrorContext";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { FormattedNumber, NumberType } from "../../FormattedNumber";
import { ChangeUploadBatch } from "../ChangeUploadBatch";
import { CsvDownloadPublishedProviders } from "../CsvDownloadPublishedProviders";

export interface FundingReleaseSummaryProps {
  approvalMode: ApprovalMode;
  specification: SpecificationSummary;
  isWaitingForJob: boolean;
  releaseSummary: ReleaseFundingPublishedProvidersSummary | undefined;
  isLoadingSummaryData: boolean;
}

export function FundingReleaseSummary({
  specification,
  approvalMode,
  releaseSummary,
  isWaitingForJob,
  isLoadingSummaryData,
}: FundingReleaseSummaryProps) {
  const actionType = FundingActionType.Release;
  const { addErrorToContext } = useErrorContext();

  if (!releaseSummary || isLoadingSummaryData) {
    return (
      <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
        <LoadingFieldStatus title={"Loading funding summary"} />
      </div>
    );
  } else {
    const batchSize = releaseSummary ? releaseSummary.totalProviders : 0;
    const indicativeProviderCount = releaseSummary ? releaseSummary.totalIndicativeProviders : 0;
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
                        <span className={"govuk-error-message"}>No eligible providers to be released</span>
                      </div>
                    ) : (
                      "Providers selected"
                    )}
                  </th>
                  <td className="govuk-table__cell">
                    {approvalMode === ApprovalMode.Batches && batchSize > 0 && (
                      <CsvDownloadPublishedProviders
                        actionType={actionType}
                        specificationId={specification.id}
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
                {releaseSummary?.channelFundings?.map((channel, idx) => (
                  <tr className="govuk-table__row" key={"channel-" + idx}>
                    {idx === 0 && (
                      <th
                        scope="row"
                        rowSpan={releaseSummary.channelFundings.length}
                        className="govuk-table__header"
                      >
                        Release purposes
                      </th>
                    )}
                    <td className="govuk-table__cell">{channel.channelName}</td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">{channel.totalProviders}</td>
                  </tr>
                ))}
                {releaseSummary?.channelFundings?.map((channel, idx) => (
                  <tr className="govuk-table__row" key={"channel-funding-" + idx}>
                    {idx === 0 && (
                      <th
                        scope="row"
                        rowSpan={releaseSummary.channelFundings.length}
                        className="govuk-table__header"
                      >
                        Funding per release purpose
                      </th>
                    )}
                    <td className="govuk-table__cell">{channel.channelName}</td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      <FormattedNumber
                        value={channel.totalFunding ? channel.totalFunding : 0}
                        type={NumberType.FormattedMoney}
                      />
                    </td>
                  </tr>
                ))}
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Funding period
                  </th>
                  <td className="govuk-table__cell">{specification.fundingPeriod.name}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">&nbsp;</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Specification selected
                  </th>
                  <td className="govuk-table__cell">{specification.name}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">&nbsp;</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Total funding being released
                  </th>
                  <td className="govuk-table__cell">
                    {specification.fundingStreams && specification.fundingStreams[0].name}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    <strong>
                      <FormattedNumber
                        value={releaseSummary.totalFunding ? releaseSummary.totalFunding : 0}
                        type={NumberType.FormattedMoney}
                      />
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {approvalMode === ApprovalMode.Batches && !isWaitingForJob && (
          <ChangeUploadBatch actionType={actionType} specification={specification} />
        )}
      </>
    );
  }
}

export default React.memo(FundingReleaseSummary);
