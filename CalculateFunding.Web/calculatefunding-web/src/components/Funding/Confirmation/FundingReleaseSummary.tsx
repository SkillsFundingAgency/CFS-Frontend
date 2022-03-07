import React from "react";
import { useSelector } from "react-redux";

import { useErrorContext } from "../../../context/ErrorContext";
import { useReleaseFundingSummaryData } from "../../../hooks/FundingApproval/useReleaseFundingSummaryData";
import { IStoreState } from "../../../reducers/rootReducer";
import { FundingSearchSelectionState } from "../../../states/FundingSearchSelectionState";
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

export interface FundingReleaseSummaryProps {
  approvalMode: ApprovalMode;
  channelCodes: string[];
  specification: SpecificationSummary;
  fundingSummary: PublishedProviderFundingCount | undefined;
  isWaitingForJob: boolean;
}

export function FundingReleaseSummary({
  specification,
  approvalMode,
  channelCodes,
  fundingSummary,
  isWaitingForJob,
}: FundingReleaseSummaryProps) {
  const actionType = FundingActionType.Release;
  const { addErrorToContext } = useErrorContext();
  const { selectedProviderIds } = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const { releaseSummaryData, isLoadingReleaseSummaryData } = useReleaseFundingSummaryData(
    specification?.id,
    channelCodes,
    selectedProviderIds
  );

  if (!fundingSummary || isLoadingReleaseSummaryData) {
    return (
      <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
        <LoadingFieldStatus title={"Loading funding summary"} />
      </div>
    );
  } else {
    const batchSize = fundingSummary ? fundingSummary.count : 0;
    const indicativeProviderCount = fundingSummary ? fundingSummary.indicativeProviderCount : 0;
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
                {releaseSummaryData?.channelFundings?.map((channel, idx) => (
                  <tr className="govuk-table__row" key={"channel-" + idx}>
                    {idx === 0 && (
                      <th
                        scope="row"
                        rowSpan={releaseSummaryData.channelFundings.length}
                        className="govuk-table__header"
                      >
                        Release purposes
                      </th>
                    )}
                    <td className="govuk-table__cell">{channel.channelName}</td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">{channel.totalProviders}</td>
                  </tr>
                ))}
                {releaseSummaryData?.channelFundings?.map((channel, idx) => (
                  <tr className="govuk-table__row" key={"channel-funding-" + idx}>
                    {idx === 0 && (
                      <th
                        scope="row"
                        rowSpan={releaseSummaryData.channelFundings.length}
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
                        value={fundingSummary.totalFunding ? fundingSummary.totalFunding : 0}
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
