import React, {useEffect, useRef} from 'react';
import {RouteComponentProps} from "react-router";
import {Footer} from "../components/Footer";
import {Header} from "../components/Header";
import {Banner} from "../components/Banner";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {useDispatch, useSelector} from "react-redux";
import {getProviderByIdAndVersion, getPublishedProviderTransactions} from "../actions/ProviderActions";
import {getSpecification} from "../actions/ViewSpecificationsActions";
import {AppState} from "../states/AppState";
import {ProviderState} from "../states/ProviderState";
import {ViewSpecificationState} from "../states/ViewSpecificationState";
import {Tabs} from "../components/Tabs";
import Pagination from "../components/Pagination";
import {useEffectOnce} from "../hooks/useEffectOnce";

interface ProviderFundingOverviewProps {
    providerFundingId: string
}

export interface ProviderFundingOverviewRoute {
    providerId: string;
    providerVersionId: string;
    specificationId: string;
}

export const ProviderFundingOverview = ({match}: RouteComponentProps<ProviderFundingOverviewRoute>, props: ProviderFundingOverviewProps) => {
    const breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "Funding Approvals",
            url: "/approvals"
        },
        {
            name: "Select specification",
            url: "/app/SelectSpecification"
        },
        {
            name: "Funding approval results",
            url: "/app/ViewFunding"
        },
        {
            name: "Provider funding overview",
            url: null
        }
    ];

    const dispatch = useDispatch();

    useEffectOnce(() => {
        dispatch(getSpecification(match.params.specificationId));
        dispatch(getProviderByIdAndVersion(match.params.providerId, match.params.providerVersionId));
        dispatch(getPublishedProviderTransactions(match.params.providerId, match.params.specificationId));
    });

    let provider: ProviderState = useSelector((state: AppState) => state.provider);
    let specification: ViewSpecificationState = useSelector((state: AppState) => state.viewSpecification);

    return (
        <div>
            <Header/>
            <div className="govuk-width-container">
                <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
                <div className="govuk-grid-row govuk-!-margin-bottom-5">
                    <div className="govuk-grid-column-two-thirds">
                        <span className="govuk-caption-xl">Provider name</span>
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{provider.providerSummary.name}</h1>
                        <span className="govuk-caption-m">Specification</span>
                        <h1 className="govuk-heading-m">{specification.specification.name}</h1>
                        <span className="govuk-caption-m">Funding period</span>
                        <h1 className="govuk-heading-m">{specification.specification.fundingPeriod.name}</h1>
                        <span className="govuk-caption-m">Funding stream</span>
                        <h1 className="govuk-heading-m">{specification.specification.fundingStreams[0].name}</h1>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <div className="funding-status">
                            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"/>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-one-half">
                                    <p className="govuk-body">Latest status: <strong
                                        className="govuk-warning-text">{provider.providerTransactionSummary.latestStatus}</strong></p>
                                </div>
                                <div className="govuk-grid-column-one-half">
                                    <p className="govuk-body">Funding total: <strong
                                        className="govuk-warning-text">{provider.providerTransactionSummary.fundingTotal}</strong></p>
                                </div>
                            </div>
                            <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible govuk-!-margin-bottom-5"/>
                        </div>
                    </div>
                </div>

                <div className="govuk-grid-row govuk-!-padding-top-5">
                    <div className="govuk-grid-column-full">
                        <Tabs initialTab="funding-stream-history">
                            <ul className="govuk-tabs__list">
                                <Tabs.Tab label="funding-stream-history">Funding stream history</Tabs.Tab>
                            </ul>
                            <Tabs.Panel label="funding-stream-history">
                                <section className="govuk-tabs__panel" id="funding-stream-history">
                                    <h2 className="govuk-heading-l">Funding stream history</h2>
                                    <table className="govuk-table">
                                        <caption className="govuk-table__caption">History of status changes</caption>
                                        <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th scope="col" className="govuk-table__header">Status</th>
                                            <th scope="col"
                                                className="govuk-table__header govuk-table__header--numeric">Author
                                            </th>
                                            <th scope="col"
                                                className="govuk-table__header govuk-table__header--numeric">Date/time of change
                                            </th>
                                            <th scope="col"
                                                className="govuk-table__header govuk-table__header--numeric">Funding stream value
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="govuk-table__body">
                                        <tr className="govuk-table__row" hidden={provider.providerTransactionSummary.results.length > 0}><td colSpan={4}>
                                            There are no results that match your search
                                        </td></tr>
                                        {provider.providerTransactionSummary.results.map(fsh =>
                                        <tr className="govuk-table__row">
                                            <th scope="row" className="govuk-table__header">{fsh.status}</th>
                                            <td className="govuk-table__cell govuk-table__cell--numeric">{fsh.author}</td>
                                            <td className="govuk-table__cell govuk-table__cell--numeric">{fsh.dateChanged}</td>
                                            <td className="govuk-table__cell govuk-table__cell--numeric">{fsh.fundingStreamValue}</td>
                                        </tr>)}
                                        </tbody>
                                    </table>
                                </section>
                            </Tabs.Panel>

                        </Tabs>
                    </div>
                </div>
                <div className="govuk-clearfix">

                </div>
            </div>
            <Footer/>
        </div>);

};