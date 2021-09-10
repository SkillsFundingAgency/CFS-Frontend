import React from "react";
import { Link } from "react-router-dom";

import { ProviderFundingOverviewRoute } from "../../pages/FundingApprovals/ProviderFundingOverview";
import { ProviderProfileTotalsForStreamAndPeriod } from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { FormattedNumber, NumberType } from "../FormattedNumber";

export interface ProviderFundingProfilingSummaryProps {
  routeParams: ProviderFundingOverviewRoute;
  profileTotals: ProviderProfileTotalsForStreamAndPeriod;
  specification: SpecificationSummary;
}

export const ProviderFundingProfilingSummary = (props: ProviderFundingProfilingSummaryProps) => {
  return (
    <section className="govuk-tabs__panel" id="profiling">
      <h2 className="govuk-heading-l">Profiling</h2>

      <span className="govuk-caption-m">Total allocation for {props.specification.fundingPeriod?.name}</span>
      <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
        <FormattedNumber value={props.profileTotals.totalAllocation} type={NumberType.FormattedMoney} />
      </h3>
      <span className="govuk-caption-m">Previous allocation value</span>
      <h3 className="govuk-heading-m">
        <FormattedNumber value={props.profileTotals.previousAllocation} type={NumberType.FormattedMoney} />
      </h3>
      <table className="govuk-table">
        <caption className="govuk-table__caption">Profiling installments</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              Installment month
            </th>
            <th scope="col" className="govuk-table__header">
              Installment number
            </th>
            <th scope="col" className="govuk-table__header govuk-table__header--numeric">
              Value
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {props.profileTotals.profilingInstallments &&
            props.profileTotals.profilingInstallments.map((p) => (
              <tr className="govuk-table__row" key={p.installmentNumber}>
                <th scope="row" className="govuk-table__header">
                  {p.installmentYear} {p.installmentMonth}
                  &nbsp;{p.isPaid ? <strong className="govuk-tag">Paid</strong> : ""}
                </th>
                <td className="govuk-table__cell">{p.installmentNumber}</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  <FormattedNumber value={p.installmentValue} type={NumberType.FormattedMoney} />
                </td>
              </tr>
            ))}
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              Total
            </th>
            <td className="govuk-table__cell"></td>
            <td className="govuk-table__cell govuk-table__cell--numeric">
              <FormattedNumber value={props.profileTotals.totalAllocation} type={NumberType.FormattedMoney} />
            </td>
          </tr>
        </tbody>
      </table>
      <h3 className="govuk-heading-m">Previous profiles</h3>
      {props.specification &&
        props.specification.fundingStreams &&
        props.specification.fundingStreams.length > 0 && (
          <p className="govuk-body">
            History of previous{" "}
            <Link
              to={`/Approvals/ProfilingHistory/${props.routeParams.specificationId}/${props.routeParams.providerId}/${props.routeParams.specCoreProviderVersionId}/${props.routeParams.fundingStreamId}/${props.routeParams.fundingPeriodId}`}
              className="govuk-button"
              data-module="govuk-button"
            >
              profiles
            </Link>
          </p>
        )}
    </section>
  );
};
