import {Link} from "react-router-dom";
import React from "react";
import {FundingLineProfile} from "../../types/FundingLineProfile";
import {ProviderFundingOverviewRoute} from "../../pages/FundingApprovals/ProviderFundingOverview";


export interface ProviderFundingProfilingProps {
    routeParams: ProviderFundingOverviewRoute,
    profilingPatterns: FundingLineProfile[];
}

export const ProviderFundingProfilingPatterns = (props: ProviderFundingProfilingProps) => {
    return <section className="govuk-tabs__panel" id="profiling">
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <h2 className="govuk-heading-l">
                    Profiling
                </h2>
                <p className="govuk-body">
                    View and makes changes to profile patterns by funding line.
                </p>
                <dl className="govuk-summary-list">
                    {
                        props.profilingPatterns.map((p, key) => {
                            return <div className="govuk-summary-list__row" key={key}>
                                <dt className="govuk-summary-list__key">
                                    {p.fundingLineName}
                                </dt>
                                <dd className="govuk-summary-list__value">
                                    {p.profilePatternName}
                                </dd>
                                <dd className="govuk-summary-list__actions">
                                    <Link
                                        to={`/Approvals/ProviderFundingOverview/${props.routeParams.specificationId}/${props.routeParams.providerId}/${props.routeParams.providerVersionId}/${props.routeParams.fundingStreamId}/${props.routeParams.fundingPeriodId}/${p.fundingLineCode}`}>
                                        Change
                                    </Link>
                                </dd>
                            </div>
                        })
                    }
                </dl>
            </div>
        </div>
    </section>
}