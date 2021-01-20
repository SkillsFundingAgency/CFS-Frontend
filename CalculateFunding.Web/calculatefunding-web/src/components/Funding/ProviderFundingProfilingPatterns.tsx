import {Link} from "react-router-dom";
import React from "react";
import {FundingLineProfile} from "../../types/FundingLineProfile";
import {ProviderFundingOverviewRoute} from "../../pages/FundingApprovals/ProviderFundingOverview";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {NoData} from "../NoData";


export interface ProviderFundingProfilingProps {
    routeParams: ProviderFundingOverviewRoute,
    profilingPatterns: FundingLineProfile[]
}

export const ProviderFundingProfilingPatterns = (props: ProviderFundingProfilingProps) => {
    const params = props.routeParams;
    return <section className="govuk-tabs__panel" id="profiling">
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
                <h2 className="govuk-heading-l">
                    Profiling
                </h2>
                <p className="govuk-body">
                    View and make changes to profile patterns by funding line.
                </p>

                {(!props.profilingPatterns || props.profilingPatterns.length === 0) &&
                <NoData hidden={false}/>
                }

                {props.profilingPatterns && props.profilingPatterns.length > 0 &&
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <table className="govuk-table" data-testid={"profiling-table"}>
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th scope="col" className="govuk-table__header">Funding line</th>
                                <th scope="col" className="govuk-table__header">Pattern type</th>
                                <th scope="col" className="govuk-table__header">Total allocation</th>
                                <th scope="col" className="govuk-table__header">&nbsp; </th>
                            </tr>
                            </thead>
                            <tbody className="govuk-table__body">
                            {props.profilingPatterns.map((profile, key) => {
                                return <tr className="govuk-table__row" key={key}>
                                    <th scope="row" className="govuk-table__header">
                                        {profile.fundingLineName}
                                    </th>
                                    <td className="govuk-table__cell">
                                        {profile.totalAllocation ? profile.profilePatternName : ""}
                                    </td>
                                    <td className="govuk-table__cell">
                                        {profile.totalAllocation ?
                                            <FormattedNumber value={profile.totalAllocation} type={NumberType.FormattedMoney}/>
                                            : "Excluded"}
                                    </td>
                                    <td className="govuk-table__cell">
                                        {profile.totalAllocation &&
                                        <>
                                            <Link className="govuk-link right-align"
                                                  to={`/Approvals/ProviderFundingOverview/${params.specificationId}/${params.providerId}/${params.specCoreProviderVersionId}/${params.fundingStreamId}/${params.fundingPeriodId}/${profile.fundingLineCode}`}>
                                                View
                                            </Link>
                                            <span className="govuk-visually-hidden">{profile.fundingLineName}</span>
                                        </>
                                        }
                                    </td>
                                </tr>
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
                }

            </div>
        </div>
    </section>
}