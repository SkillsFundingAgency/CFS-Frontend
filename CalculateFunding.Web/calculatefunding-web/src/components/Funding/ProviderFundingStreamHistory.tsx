import React from "react";

import { convertCamelCaseToSpaceDelimited } from "../../helpers/stringHelper";
import { ProviderTransactionSummary } from "../../types/ProviderSummary";

export interface ProviderFundingStreamHistoryProps {
  transactions: ProviderTransactionSummary;
}

export const ProviderFundingStreamHistory = (props: ProviderFundingStreamHistoryProps) => {
  return (
    <section className="govuk-tabs__panel" id="funding-stream-history">
      <h2 className="govuk-heading-l">Funding stream history</h2>
      <table className="govuk-table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              Status
            </th>
            <th scope="col" className="govuk-table__header">
              Version
            </th>
            <th scope="col" className="govuk-table__header">
              Date, time, author
            </th>
            <th scope="col" className="govuk-table__header govuk-table__header--numeric">
              Funding total
            </th>
            <th scope="col" className="govuk-table__header">
              Variation reasons
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row" hidden={props.transactions.results?.length > 0}>
            <td colSpan={4}>There are no results that match your search</td>
          </tr>
          {props.transactions.results &&
            props.transactions.results.map((transaction, i) => (
              <tr className="govuk-table__row" key={`transaction-${i}`}>
                <td className="govuk-table__cell">{transaction.status}</td>
                <td className="govuk-table__cell">
                  v{transaction.majorVersion}.{transaction.minorVersion}
                </td>
                <td className="govuk-table__cell">
                  {transaction.dateChanged} by {transaction.author}
                </td>
                <td className="govuk-table__cell govuk-table__cell--numeric">{transaction.totalFunding}</td>
                <td className="govuk-table__cell">
                  <details className="govuk-details">
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text">Show variation reasons</span>
                    </summary>
                    <div className="govuk-details__text">
                      <ul className="govuk-list govuk-list--bullet">
                        {transaction.variationReasons?.map((vr) => (
                          <li key={vr}>{convertCamelCaseToSpaceDelimited(vr)}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
};
