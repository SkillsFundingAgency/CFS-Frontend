import React from "react";

import { isNumber } from "../../helpers/numberHelper";
import { ProviderFundingOverviewRoute } from "../../pages/FundingApprovals/ProviderFundingOverview";
import { FundingLineProfile } from "../../types/FundingLineProfile";
import { FormattedNumber, NumberType } from "../FormattedNumber";
import { NoData } from "../NoData";
import { TextLink } from "../TextLink";

export interface ProviderFundingProfilingProps {
  routeParams: ProviderFundingOverviewRoute;
  profilingPatterns: FundingLineProfile[];
}

export const ProviderFundingProfilingPatterns = (props: ProviderFundingProfilingProps): JSX.Element => {
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
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {props.profilingPatterns.map((profile, key) => (
                      <tr className="govuk-table__row" key={key}>
                        <th scope="row" className="govuk-table__header">
                          {profile.errors?.length > 0 ? (
                            <div className="govuk-form-group--error">
                              <ProviderFundingOverviewLink profile={profile} params={params} />
                              <span className="govuk-error-message">
                                {profile.errors[0].detailedErrorMessage}
                              </span>
                            </div>
                          ) : (
                            <ProviderFundingOverviewLink profile={profile} params={params} />
                          )}
                        </th>
                        <td className="govuk-table__cell">
                          {isNumber(profile.fundingLineAmount) ? profile.profilePatternName : ""}
                        </td>
                        <td className="govuk-table__cell">
                          {isNumber(profile.fundingLineAmount) ? (
                            <FormattedNumber
                              value={profile.fundingLineAmount}
                              type={NumberType.FormattedMoney}
                            />
                          ) : (
                            "Excluded"
                          )}
                        </td>
                      </tr>
                    ))}
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

const ProviderFundingOverviewLink = ({
  profile,
  params,
}: {
  profile: FundingLineProfile;
  params: ProviderFundingOverviewRoute;
}) => {
  const { specificationId, providerId, specCoreProviderVersionId, fundingStreamId, fundingPeriodId } = params;
  const fundingLineTitle = `${profile.fundingLineName} (${profile.fundingLineCode})`;
  return isNumber(profile.fundingLineAmount) ? (
    <TextLink
      to={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${specCoreProviderVersionId}/${fundingStreamId}/${fundingPeriodId}/${profile.fundingLineCode}/view`}
    >
      {fundingLineTitle}
    </TextLink>
  ) : (
    <>{fundingLineTitle}</>
  );
};
