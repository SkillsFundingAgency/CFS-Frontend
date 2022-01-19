import React from "react";
import { useSelector } from "react-redux";
import { IStoreState } from "reducers/rootReducer";
import { FeatureFlagsState } from "states/FeatureFlagsState";

import { convertCamelCaseToSpaceDelimited } from "../../helpers/stringHelper";
import { ProviderTransactionSummary } from "../../types/ProviderSummary";

export interface ProviderFundingStreamHistoryProps {
  transactions: ProviderTransactionSummary;
}

export const ProviderFundingStreamHistory = (props: ProviderFundingStreamHistoryProps) => {
  const { transactions } = props;
  const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(
    (state) => state.featureFlags
  );

  return (
    <section className="govuk-tabs__panel" id="funding-stream-history">
      <h2 className="govuk-heading-l">Funding stream history</h2>
      {featureFlagsState.enableNewFundingManagement ? (
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
            <tr className="govuk-table__row" hidden={transactions.results?.length > 0}>
              <td colSpan={4}>There are no results that match your search</td>
            </tr>
            {transactions.results &&
              transactions.results.map((transaction, i) => (
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
      ) : (
        <table className="govuk-table">
          <caption className="govuk-table__caption">History of status changes</caption>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">
                Status
              </th>
              <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                Author
              </th>
              <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                Date/time of change
              </th>
              <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                Variation reason
              </th>
              <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                Funding stream value
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            <tr className="govuk-table__row" hidden={transactions.results?.length > 0}>
              <td colSpan={4}>There are no results that match your search</td>
            </tr>
            {transactions.results &&
              transactions.results.map((transaction, i) => (
                <tr className="govuk-table__row" key={`transaction-${i}`}>
                  <th scope="row" className="govuk-table__header">
                    {transaction.status}
                  </th>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{transaction.author}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{transaction.dateChanged}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {transaction.variationReasons?.map((vr) => (
                      <span key={vr}>
                        {convertCamelCaseToSpaceDelimited(vr)}
                        <br />
                      </span>
                    ))}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{transaction.totalFunding}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
