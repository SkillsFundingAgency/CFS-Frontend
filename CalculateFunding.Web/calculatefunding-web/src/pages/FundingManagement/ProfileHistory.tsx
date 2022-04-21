import { FundingSelectionBreadcrumb } from "components/Funding/FundingSelectionBreadcrumb";
import { ProviderFundingLineProfileLink } from "components/Funding/ProviderFundingLineProfileLink";
import { ProviderFundingOverviewUri } from "components/Funding/ProviderFundingOverviewLink";
import { FundingResultsBreadcrumb } from "components/Funding/ProviderFundingSearch/FundingResultsBreadcrumb";
import { useErrors } from "hooks/useErrors";
import { useSpecificationSummary } from "hooks/useSpecificationSummary";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { RouteComponentProps } from "react-router";
import { FundingActionType } from "types/PublishedProvider/PublishedProviderFundingCount";

import { AccordionPanel } from "../../components/AccordionPanel";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { ErrorSummary } from "../../components/ErrorSummary";
import { FormattedNumber, NumberType } from "../../components/FormattedNumber";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { formatDateTime } from "../../helpers/DateHelper";
import { getPreviousProfilesForSpecificationForProviderForFundingLine } from "../../services/fundingLineDetailsService";
import { FundingLineChangeViewModel } from "../../types/PublishedProvider/FundingLineProfile";
import { Section } from "../../types/Sections";

export interface ProfileHistoryProps {
  providerId: string;
  specificationId: string;
  fundingLineId: string;
  providerVersionId: string;
  actionType: Exclude<FundingActionType, FundingActionType.Refresh>;
}

export function ProfileHistory({ match }: RouteComponentProps<ProfileHistoryProps>) {
  const specificationId = match.params.specificationId;
  const fundingLineId = match.params.fundingLineId;
  const providerId = match.params.providerId;
  const providerVersionId = match.params.providerVersionId;
  const actionType = match.params.actionType;
  const [allExpanded, setAllExpanded] = useState<boolean>(false);
  const providerFundingOverviewUrl = ProviderFundingOverviewUri({
    actionType: actionType,
    specificationId: specificationId,
    providerId: providerId,
    specCoreProviderVersionId: providerVersionId,
  });
  const { addError } = useErrors();
  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({ error: err, description: "Error while loading specification" })
  );

  const fundingStreamId = specification && specification.fundingStreams[0]?.id;
  const fundingPeriodId = specification && specification.fundingPeriod?.id;

  const { data, isLoading, isError, error } = useQuery<FundingLineChangeViewModel>(
    `profile-history-${specificationId}-${providerId}-${fundingStreamId}-${fundingLineId}`,
    async () =>
      (
        await getPreviousProfilesForSpecificationForProviderForFundingLine(
          specificationId,
          providerId,
          fundingStreamId as string,
          fundingLineId,
          providerVersionId
        )
      ).data
  );

  const getErrorMessage = () => {
    let message = "Profiling history could not be loaded.";
    if (error) {
      message = message.concat(` ${(error as Error).message}.`);
    }
    if (!data) {
      message = message.concat(" No data available.");
    }
    return message;
  };

  const getFundingStreamName = () => {
    if (data && data.fundingLineChanges.length > 0) {
      return data.fundingLineChanges[0].fundingStreamName;
    }
    return "Funding stream name could not be found";
  };

  const handleExpandClick = () => {
    setAllExpanded(!allExpanded);
  };

  return (
    <Main location={Section.FundingManagement}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name="Funding Management" url="/FundingManagement" />
        <FundingSelectionBreadcrumb actionType={actionType} />
        <FundingResultsBreadcrumb
          actionType={actionType}
          specificationId={specificationId}
          specificationName={specification?.name}
          fundingPeriodId={fundingPeriodId}
          fundingStreamId={fundingStreamId}
        />
        <Breadcrumb name={data?.providerName ?? "Provider"} url={providerFundingOverviewUrl} />
        <Breadcrumb name="Profile history" />
      </Breadcrumbs>
      {(isError || (!isLoading && !data) || (!isLoadingSpecification && !specification)) && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <ErrorSummary error="There is a problem" title={getErrorMessage()} suggestion="" />
          </div>
        </div>
      )}
      {isLoading || isLoadingSpecification ? (
        <LoadingStatus title="Loading profiling history" />
      ) : (
        !!data && (
          <>
            <div className="govuk-grid-row govuk-!-margin-bottom-5 govuk-!-margin-top-5">
              <div className="govuk-grid-column-two-thirds">
                <h1 className="govuk-heading-xl" data-testid="test">
                  Previous payment profiles
                </h1>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-2">{data.providerName}</h2>
                <span className="govuk-caption-m">Specification</span>
                <h3 className="govuk-heading-m">{data.specificationName}</h3>
                <span className="govuk-caption-m">Funding period</span>
                <h3 className="govuk-heading-m">{data.fundingPeriodName}</h3>
                <span className="govuk-caption-m">Funding stream</span>
                <h3 className="govuk-heading-m">{getFundingStreamName()}</h3>
              </div>
            </div>
            <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
              <div className="govuk-accordion__controls">
                <button
                  type="button"
                  onClick={handleExpandClick}
                  className="govuk-accordion__open-all"
                  aria-expanded={allExpanded ? "true" : "false"}
                >
                  {allExpanded ? "Close" : "Open"} all
                  <span className="govuk-visually-hidden"> sections</span>
                </button>
              </div>
              {data.fundingLineChanges.map((_, i) => (
                <AccordionPanel
                  key={`panel-${i}`}
                  id={`panel-${i}`}
                  expanded={false}
                  title={`Profile prior to ${formatDateTime(_.lastUpdatedDate)}`}
                  autoExpand={allExpanded}
                  boldSubtitle={""}
                  subtitle={`Last updated by ${_.lastUpdatedUser.name} on ${formatDateTime(
                    _.lastUpdatedDate
                  )}`}
                >
                  <div
                    id="accordion-default-content-1"
                    className="govuk-accordion__section-content"
                    aria-labelledby="accordion-default-heading-1"
                  >
                    <div className="govuk-grid-row">
                      <div className="govuk-grid-column-two-thirds">
                        <span className="govuk-caption-m">Total allocation</span>
                        <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                          <FormattedNumber value={_.fundingLineTotal} type={NumberType.FormattedMoney} />
                        </h3>
                        <span className="govuk-caption-m">Previous allocation value</span>
                        <h3 className="govuk-heading-m">
                          <FormattedNumber
                            value={_.previousFundingLineTotal}
                            type={NumberType.FormattedMoney}
                          />
                        </h3>
                        <span className="govuk-caption-m">Balance to be carried forward</span>
                        <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                          <FormattedNumber value={_.carryOverAmount} type={NumberType.FormattedMoney} />
                        </h3>
                        <table className="govuk-table govuk-!-margin-top-5">
                          <caption className="govuk-table__caption">Profiling instalments</caption>
                          <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                              <th scope="col" className="govuk-table__header">
                                Instalment
                              </th>
                              <th scope="col" className="govuk-table__header">
                                Payment status
                              </th>
                              <th scope="col" className="govuk-table__header">
                                Instalment number
                              </th>
                              <th scope="col" className="govuk-table__header">
                                Per cent
                              </th>
                              <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="govuk-table__body">
                            {_.profileTotals
                              .sort((a, b) => a.installmentNumber - b.installmentNumber)
                              .map((pt) => (
                                <tr key={`installment-${pt.installmentNumber}`} className="govuk-table__row">
                                  <th scope="row" className="govuk-table__header">
                                    <DateTimeFormatter date={pt.actualDate as Date} />
                                  </th>
                                  <td className="govuk-table__cell" data-testid={`paid-${i}`}>
                                    {pt.isPaid ? <strong className="govuk-tag">Paid</strong> : null}
                                  </td>
                                  <td className="govuk-table__cell">{pt.installmentNumber}</td>
                                  <td className="govuk-table__cell">
                                    <FormattedNumber
                                      value={pt.profileRemainingPercentage}
                                      type={NumberType.FormattedPercentage}
                                    />
                                  </td>
                                  <td className="govuk-table__cell govuk-table__cell--numeric">
                                    <FormattedNumber value={pt.value} type={NumberType.FormattedMoney} />
                                  </td>
                                </tr>
                              ))}
                            <tr className="govuk-table__row">
                              <th scope="row" className="govuk-table__header">
                                Total allocation
                              </th>
                              <td className="govuk-table__cell"></td>
                              <td className="govuk-table__cell"></td>
                              <td className="govuk-table__cell"></td>
                              <td className="govuk-table__cell govuk-table__cell--numeric">
                                <FormattedNumber
                                  value={_.fundingLineTotal}
                                  type={NumberType.FormattedMoney}
                                />
                              </td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th scope="row" className="govuk-table__header">
                                To be carried forward
                              </th>
                              <td className="govuk-table__cell"></td>
                              <td className="govuk-table__cell"></td>
                              <td className="govuk-table__cell"></td>
                              <td className="govuk-table__cell govuk-table__cell--numeric">
                                <FormattedNumber value={_.carryOverAmount} type={NumberType.FormattedMoney} />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </AccordionPanel>
              ))}
            </div>
          </>
        )
      )}
      <ProviderFundingLineProfileLink
        editMode="view"
        {...match.params}
        specCoreProviderVersionId={match.params.providerVersionId}
      >
        Back
      </ProviderFundingLineProfileLink>
    </Main>
  );
}
