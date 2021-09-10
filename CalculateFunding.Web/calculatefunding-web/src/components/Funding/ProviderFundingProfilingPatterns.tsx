﻿import React from "react";
import { Link } from "react-router-dom";

import { ProviderFundingOverviewRoute } from "../../pages/FundingApprovals/ProviderFundingOverview";
import { FundingLineProfile } from "../../types/FundingLineProfile";
import { FormattedNumber, NumberType } from "../FormattedNumber";
import { NoData } from "../NoData";

export interface ProviderFundingProfilingProps {
  routeParams: ProviderFundingOverviewRoute;
  profilingPatterns: FundingLineProfile[];
}

export const ProviderFundingProfilingPatterns = (props: ProviderFundingProfilingProps) => {
  const params = props.routeParams;
  return (
    <section className="govuk-tabs__panel" id="profiling">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Profiling</h2>
          <p className="govuk-body">View and make changes to profile patterns by funding line.</p>

          {(!props.profilingPatterns || props.profilingPatterns.length === 0) && <NoData hidden={false} />}

          {props.profilingPatterns && props.profilingPatterns.length > 0 && (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <table className="govuk-table" data-testid={"profiling-table"}>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header">
                        Funding line
                      </th>
                      <th scope="col" className="govuk-table__header">
                        Pattern type
                      </th>
                      <th scope="col" className="govuk-table__header">
                        Total allocation
                      </th>
                      <th scope="col" className="govuk-table__header">
                        &nbsp;
                      </th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {props.profilingPatterns.map((profile, key) => {
                      return (
                        <tr className="govuk-table__row" key={key}>
                          <th scope="row" className="govuk-table__header">
                            {profile.errors?.length > 0 ? (
                              <div className="govuk-form-group--error">
                                {profile.fundingLineName}
                                <span className="govuk-error-message">
                                  {profile.errors[0].detailedErrorMessage}
                                </span>
                              </div>
                            ) : (
                              profile.fundingLineName
                            )}
                          </th>
                          <td className="govuk-table__cell">
                            {profile.fundingLineAmount !== undefined ? profile.profilePatternName : ""}
                          </td>
                          <td className="govuk-table__cell">
                            {profile.fundingLineAmount !== undefined ? (
                              <FormattedNumber
                                value={profile.fundingLineAmount}
                                type={NumberType.FormattedMoney}
                              />
                            ) : (
                              "Excluded"
                            )}
                          </td>
                          <td className="govuk-table__cell">
                            {profile.fundingLineAmount !== undefined && (
                              <>
                                <Link
                                  className="govuk-link right-align"
                                  to={`/Approvals/ProviderFundingOverview/${params.specificationId}/${params.providerId}/${params.specCoreProviderVersionId}/${params.fundingStreamId}/${params.fundingPeriodId}/${profile.fundingLineCode}/view`}
                                >
                                  View
                                </Link>
                                <span className="govuk-visually-hidden">{profile.fundingLineName}</span>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
