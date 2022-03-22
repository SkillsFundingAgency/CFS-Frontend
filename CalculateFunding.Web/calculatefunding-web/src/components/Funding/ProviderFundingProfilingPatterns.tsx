import React from "react";

import { isNumber } from "../../helpers/numberHelper";
import { FundingLineProfile } from "../../types/FundingLineProfile";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { FormattedNumber, NumberType } from "../FormattedNumber";
import { NoData } from "../NoData";
import { ProviderFundingLineProfileLink } from "./ProviderFundingLineProfileLink";

export interface ProviderFundingProfilingPatternsProps {
  actionType?: FundingActionType;
  profilingPatterns: FundingLineProfile[];
  specification: SpecificationSummary;
  providerId: string;
  specCoreProviderVersionId?: string;
}

export const ProviderFundingProfilingPatterns = ({
  actionType = FundingActionType.Approve,
  profilingPatterns,
  specification,
  providerId,
  specCoreProviderVersionId,
}: ProviderFundingProfilingPatternsProps): JSX.Element => {
  return (
    <section className="govuk-tabs__panel" id="profiling">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Profiling</h2>
          <p className="govuk-body">View and make changes to profile patterns by funding line.</p>

          {(!profilingPatterns || profilingPatterns.length === 0) && <NoData hidden={false} />}

          {profilingPatterns && profilingPatterns.length > 0 && (
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
                    {profilingPatterns.map((profile, key) => (
                      <tr className="govuk-table__row" key={key}>
                        <th scope="row" className="govuk-table__header">
                          <FundingLineProfileNameContainer
                            actionType={actionType}
                            profile={profile}
                            specificationId={specification.id}
                            providerId={providerId}
                            specCoreProviderVersionId={specCoreProviderVersionId}
                            fundingStreamId={specification.fundingStreams[0].id}
                            fundingPeriodId={specification.fundingPeriod.id}
                          />
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

const FundingLineProfileNameContainer = (props: {
  actionType: FundingActionType;
  profile: FundingLineProfile;
  specificationId: string;
  providerId: string;
  specCoreProviderVersionId?: string;
  fundingStreamId: string;
  fundingPeriodId: string;
}) => {
  const fundingLineTitle = `${props.profile.fundingLineName} (${props.profile.fundingLineCode})`;

  const FundingLineProfileLinkOrNot = () =>
    isNumber(props.profile.fundingLineAmount) ? (
      <ProviderFundingLineProfileLink
        editMode="view"
        {...props}
        fundingLineCode={props.profile.fundingLineCode}
      >
        {fundingLineTitle}
      </ProviderFundingLineProfileLink>
    ) : (
      <>{fundingLineTitle}</>
    );

  return props.profile.errors?.length > 0 ? (
    <div className="govuk-form-group--error">
      <FundingLineProfileLinkOrNot />
      <span className="govuk-error-message">{props.profile.errors[0].detailedErrorMessage}</span>
    </div>
  ) : (
    <FundingLineProfileLinkOrNot />
  );
};
