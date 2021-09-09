import React, {useState} from "react";
import {RouteComponentProps} from "react-router";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Footer} from "../../components/Footer";
import {useQuery} from 'react-query'
import {getPreviousProfilesForSpecificationForProviderForFundingLine} from "../../services/fundingLineDetailsService";
import {FundingLineChangeViewModel} from "../../types/PublishedProvider/FundingLineProfile";
import {ErrorSummary} from "../../components/ErrorSummary";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import {formatDateTime} from "../../helpers/DateHelper";
import {FormattedNumber, NumberType} from "../../components/FormattedNumber";
import {AccordionPanel} from "../../components/AccordionPanel";
import {Link} from "react-router-dom";
import {BackLink} from "../../components/BackLink";

export interface ProfileHistoryProps {
    providerId: string;
    fundingStreamId: string;
    specificationId: string;
    fundingLineCode: string;
    fundingPeriodId: string;
    providerVersionId: string;
}

export function ProfileHistory({match}: RouteComponentProps<ProfileHistoryProps>) {
    const fundingStreamId = match.params.fundingStreamId;
    const specificationId = match.params.specificationId;
    const fundingLineCode = match.params.fundingLineCode;
    const providerId = match.params.providerId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const providerVersionId = match.params.providerVersionId;
    const [allExpanded, setAllExpanded] = useState<boolean>(false);

    const {data, isLoading, isError, error} =
        useQuery<FundingLineChangeViewModel>(`profile-history-${specificationId}-${providerId}-${fundingStreamId}-${fundingLineCode}`,
            async () => (
                await getPreviousProfilesForSpecificationForProviderForFundingLine(specificationId, providerId, fundingStreamId, fundingLineCode)).data
        );

    const getErrorMessage = () => {
        let message = "Profiling history could not be loaded.";
        if (error) {
            message = message.concat(` ${(error as Error).message}.`);
        }
        if (!data) {
            message = message.concat(` No data available.`);
        }
        return message;
    }

    const getFundingStreamName = () => {
        if (data && data.fundingLineChanges.length > 0) {
            return data.fundingLineChanges[0].fundingStreamName;
        }
        return "Funding stream name could not be found";
    }

    const handleExpandClick = () => {
        setAllExpanded(!allExpanded);
    }

    return (
        <div>
            <Header location={Section.Approvals} />
            <div className="govuk-width-container">
                {isLoading ?
                    <LoadingStatus title="Loading profiling history" /> :
                    <>
                        {isError || !data ? <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <ErrorSummary error="There is a problem"
                                    title={getErrorMessage()}
                                    suggestion="" />
                            </div>
                        </div> :
                            <>
                                <Breadcrumbs>
                                    <Breadcrumb name="Calculate funding" url={"/"} />
                                    <Breadcrumb name="Approvals" />
                                    <Breadcrumb name="Select specification" url={"/Approvals/Select"} />
                                    <Breadcrumb name={"Funding approval results"} url={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`} />
                                    <Breadcrumb name={data.providerName} url={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}`} />
                                    <Breadcrumb name="Profile history" />
                                </Breadcrumbs>
                                <div className="govuk-grid-row govuk-!-margin-bottom-5 govuk-!-margin-top-5">
                                    <div className="govuk-grid-column-two-thirds">
                                        <h1 className="govuk-heading-xl" data-testid="test">Previous payment profiles</h1>
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
                                        <button type="button" onClick={handleExpandClick} className="govuk-accordion__open-all" aria-expanded={allExpanded ? "true" : "false"}>
                                            {allExpanded ? "Close" : "Open"} all<span className="govuk-visually-hidden"> sections</span>
                                        </button>
                                    </div>
                                    {data.fundingLineChanges.map((_, i) => (
                                        <AccordionPanel key={`panel-${i}`} id={`panel-${i}`} expanded={false}
                                                        title={`Profile prior to ${formatDateTime(_.lastUpdatedDate)}`} autoExpand={allExpanded}
                                                        boldSubtitle={""}
                                                        subtitle={`Last updated by ${_.lastUpdatedUser.name} on ${formatDateTime(_.lastUpdatedDate)}`}>
                                            <div id="accordion-default-content-1" className="govuk-accordion__section-content" aria-labelledby="accordion-default-heading-1">
                                                <div className="govuk-grid-row">
                                                    <div className="govuk-grid-column-two-thirds">
                                                        <span className="govuk-caption-m">Total allocation</span>
                                                        <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                                                            <FormattedNumber value={_.fundingLineTotal} type={NumberType.FormattedMoney} />
                                                        </h3>
                                                        <span className="govuk-caption-m">Previous allocation value</span>
                                                        <h3 className="govuk-heading-m">
                                                            <FormattedNumber value={_.previousFundingLineTotal} type={NumberType.FormattedMoney} />
                                                        </h3>
                                                        <span className="govuk-caption-m">Balance to be carried forward</span>
                                                        <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                                                            <FormattedNumber value={_.carryOverAmount} type={NumberType.FormattedMoney} />
                                                        </h3>
                                                        <table className="govuk-table govuk-!-margin-top-5">
                                                            <caption className="govuk-table__caption">Profiling instalments</caption>
                                                            <thead className="govuk-table__head">
                                                                <tr className="govuk-table__row">
                                                                    <th scope="col" className="govuk-table__header">Instalment</th>
                                                                    <th scope="col" className="govuk-table__header">Payment status</th>
                                                                    <th scope="col" className="govuk-table__header">Instalment number</th>
                                                                    <th scope="col" className="govuk-table__header">Per cent</th>
                                                                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">Value</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="govuk-table__body">
                                                                {_.profileTotals
                                                                    .sort((a, b) => a.installmentNumber - b.installmentNumber)
                                                                    .map(pt => (
                                                                        <tr key={`installment-${pt.installmentNumber}`} className="govuk-table__row">
                                                                            <th scope="row" className="govuk-table__header"><DateTimeFormatter date={pt.actualDate as Date} /></th>
                                                                            <td className="govuk-table__cell" data-testid={`paid-${i}`}>{pt.isPaid ? <strong className="govuk-tag">Paid</strong> : null}</td>
                                                                            <td className="govuk-table__cell">{pt.installmentNumber}</td>
                                                                            <td className="govuk-table__cell"><FormattedNumber value={pt.profileRemainingPercentage} type={NumberType.FormattedPercentage} /></td>
                                                                            <td className="govuk-table__cell govuk-table__cell--numeric"><FormattedNumber value={pt.value} type={NumberType.FormattedMoney} /></td>
                                                                        </tr>
                                                                    ))}
                                                                <tr className="govuk-table__row">
                                                                    <th scope="row" className="govuk-table__header">Total allocation</th>
                                                                    <td className="govuk-table__cell"></td>
                                                                    <td className="govuk-table__cell"></td>
                                                                    <td className="govuk-table__cell"></td>
                                                                    <td className="govuk-table__cell govuk-table__cell--numeric">
                                                                        <FormattedNumber value={_.fundingLineTotal} type={NumberType.FormattedMoney} />
                                                                    </td>
                                                                </tr>
                                                                <tr className="govuk-table__row">
                                                                    <th scope="row" className="govuk-table__header">To be carried forward</th>
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
                                <BackLink to={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineCode}/view`}/>
                            </>
                        }
                    </>
                }
            </div>
            <Footer />
        </div>
    );
}
