import React, {useEffect, useState} from 'react';
import {RouteComponentProps, useHistory, useLocation} from "react-router";
import {Footer} from "../components/Footer";
import {Header} from "../components/Header";
import {useDispatch, useSelector} from "react-redux";
import {getProfiling, getProviderByIdAndVersion, getPublishedProviderTransactions} from "../actions/ProviderActions";
import {getSpecification} from "../actions/ViewSpecificationsActions";
import {AppState} from "../states/AppState";
import {Tabs} from "../components/Tabs";
import {useEffectOnce} from "../hooks/useEffectOnce";
import {FormattedNumber, NumberType} from "../components/FormattedNumber";
import {Section} from "../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../components/Breadcrumbs";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {FeatureFlagsState} from "../states/FeatureFlagsState";
import {IStoreState} from "../reducers/rootReducer";
import {Link} from "react-router-dom";
import {ProviderSummary, ProviderTransactionSummary} from "../types/ProviderSummary";
import {Profiling} from "../types/Profiling";
import {GetCurrentProfileConfigService} from "../services/fundingLineDetailsService";
import {FundingLineProfile} from "../types/FundingLineProfile";
import {LoadingStatus} from "../components/LoadingStatus";
import {ErrorMessage} from "../types/ErrorMessage";
import * as QueryString from "query-string";

interface ProviderFundingOverviewProps {
    providerFundingId: string
}

export interface ProviderFundingOverviewRoute {
    providerId: string;
    providerVersionId: string;
    specificationId: string;
    fundingStreamId: string;
    fundingPeriodId: string;
}

export function ProviderFundingOverview({match}: RouteComponentProps<ProviderFundingOverviewRoute>, props: ProviderFundingOverviewProps) {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
    const [initialTab, setInitialTab] = useState<string>("");
    const dispatch = useDispatch();
    let history = useHistory();

    const location = useLocation();

    useEffect(() => {
        const params = QueryString.parse(location.search);

        if (params.showProfiling) {
            setInitialTab("profiling");
        } else {
            setInitialTab("funding-stream-history")
        }
    }, [location]);

    useEffectOnce(() => {
        dispatch(getSpecification(match.params.specificationId));
        dispatch(getProviderByIdAndVersion(match.params.providerId, match.params.providerVersionId));
        dispatch(getPublishedProviderTransactions(match.params.providerId, match.params.specificationId));
    });
    const [isLoading, setIsLoading] = useState({
        specification: true,
        profiling: true
    });
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const profilingPatternsInitialState =
        [{
            fundingLineCode: "",
            fundingLineName: "",
            totalAllocation: 0,
            amountAlreadyPaid: 0,
            remainingAmount: 0,
            carryOverAmount: 0,
            providerName: "",
            profilePatternKey: "",
            profilePatternName: "",
            profilePatternDescription: "",
            lastUpdatedUser: {id: "", name: ""},
            name: "",
            lastUpdatedDate: new Date(),
            profileTotalAmount: 0,
            profileTotals: []
        }];
    const [profilingPatterns, setProfilingPatterns] = useState<FundingLineProfile[]>(profilingPatternsInitialState);
    const [displayProfilingPattern, setDisplayProfilingPattern] = useState(false);

    useEffect(() => {
        setDisplayProfilingPattern(featureFlagsState.profilingPatternVisible);
    }, [featureFlagsState.profilingPatternVisible]);

    useEffectOnce(() => {
        try {
            GetCurrentProfileConfigService(
                match.params.specificationId,
                match.params.providerId,
                match.params.fundingStreamId
            ).then((profilingPatternResult) => {
                const profilingPatterns = profilingPatternResult.data as FundingLineProfile[];
                if (profilingPatterns !== null && profilingPatterns.length > 0) {
                    setProfilingPatterns(profilingPatterns);
                }
                setIsLoading(prevState => {
                    return {
                        ...prevState,
                        profiling: false
                    }
                })
            });
        } catch (err) {
            if (err.response != null) {
                addErrorMessage(`A problem occurred while loading profiling: ${err.message}`);
            }
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    profiling: false
                }
            })
        }
    });

    let provider: ProviderSummary = useSelector((state: AppState) => state.provider.providerSummary);
    let transaction: ProviderTransactionSummary = useSelector((state: AppState) => state.provider.providerTransactionSummary);
    let profiling: Profiling = useSelector((state: AppState) => state.provider.profiling);
    let specification: SpecificationSummary = useSelector((state: AppState) => state.viewSpecification.specification);

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    useEffect(() => {
        dispatch(getProfiling(match.params.fundingStreamId, match.params.fundingPeriodId, match.params.providerId));
    }, [match.params.fundingPeriodId, match.params.fundingStreamId]);

    return <div>
        <Header location={Section.Approvals} />
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"} />
                <Breadcrumb name={"Approvals"} />
                <Breadcrumb name={"Select specification"} url={"/Approvals/Select"} />
                <Breadcrumb name={"Funding approval results"} url={`/Approvals/SpecificationFundingApproval/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${specification.id}`} />
                <Breadcrumb name={"Provider funding overview"} />
            </Breadcrumbs>
            {errors.length > 0 &&
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column">
                        <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                            <h2 className="govuk-error-summary__title" id="error-summary-title">
                                There is a problem
                        </h2>
                            <div className="govuk-error-summary__body">
                                <ul className="govuk-list govuk-error-summary__list">
                                    {errors.map((error, i) =>
                                        <li key={i}>{error}</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            }
            <div className="govuk-grid-row govuk-!-margin-bottom-5">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-xl">Provider name</span>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{provider.name}</h1>
                    <span className="govuk-caption-m">Specification</span>
                    <h1 className="govuk-heading-m">{specification.name}</h1>
                    <span className="govuk-caption-m">Funding period</span>
                    <h1 className="govuk-heading-m">{specification.fundingPeriod?.name}</h1>
                    <span className="govuk-caption-m">Funding stream</span>
                    <h1 className="govuk-heading-m">{specification.fundingStreams?.length > 0 ? specification.fundingStreams[0].name : ""}</h1>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <div className="funding-status">
                        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-one-half">
                                <p className="govuk-body">Latest status: <strong
                                    className="govuk-warning-text">{transaction.latestStatus}</strong></p>
                            </div>
                            <div className="govuk-grid-column-one-half">
                                <p className="govuk-body">Funding total: <strong
                                    className="govuk-warning-text">{transaction.fundingTotal}</strong></p>
                            </div>
                        </div>
                        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible govuk-!-margin-bottom-5" />
                    </div>
                </div>
            </div>
            {initialTab.length > 0 &&
                <div className="govuk-grid-row govuk-!-padding-top-5">
                    <div className="govuk-grid-column-full">
                        <Tabs initialTab={initialTab}>
                            <ul className="govuk-tabs__list">
                                <Tabs.Tab label="funding-stream-history">Funding stream history</Tabs.Tab>
                                <Tabs.Tab label="profiling">Profiling</Tabs.Tab>
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
                                            <tr className="govuk-table__row" hidden={transaction.results?.length > 0}>
                                                <td colSpan={4}>
                                                    There are no results that match your search
                                        </td>
                                            </tr>
                                            {transaction.results && transaction.results.map((fsh, i) =>
                                                <tr className="govuk-table__row" key={`transaction-${i}`}>
                                                    <th scope="row" className="govuk-table__header">{fsh.status}</th>
                                                    <td className="govuk-table__cell govuk-table__cell--numeric">{fsh.author}</td>
                                                    <td className="govuk-table__cell govuk-table__cell--numeric">{fsh.dateChanged}</td>
                                                    <td className="govuk-table__cell govuk-table__cell--numeric">{fsh.fundingStreamValue}</td>
                                                </tr>)}
                                        </tbody>
                                    </table>
                                </section>
                            </Tabs.Panel>
                            <Tabs.Panel hidden={displayProfilingPattern} label="profiling">
                                <section className="govuk-tabs__panel" id="profiling">
                                    <h2 className="govuk-heading-l">Profiling</h2>

                                    <span className="govuk-caption-m">Total allocation for {specification.fundingPeriod?.name}</span>
                                    <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                                        <FormattedNumber value={profiling.totalAllocation} type={NumberType.FormattedMoney} />
                                    </h3>
                                    <span className="govuk-caption-m">Previous allocation value</span>
                                    <h3 className="govuk-heading-m">
                                        <FormattedNumber value={profiling.previousAllocation} type={NumberType.FormattedMoney} />
                                    </h3>
                                    <table className="govuk-table">
                                        <caption className="govuk-table__caption">Profiling installments</caption>
                                        <thead className="govuk-table__head">
                                            <tr className="govuk-table__row">
                                                <th scope="col" className="govuk-table__header">Installment month</th>
                                                <th scope="col" className="govuk-table__header">Installment number</th>
                                                <th scope="col"
                                                    className="govuk-table__header govuk-table__header--numeric">Value
                                        </th>
                                            </tr>
                                        </thead>
                                        <tbody className="govuk-table__body">
                                            {profiling.profilingInstallments && profiling.profilingInstallments.map(p =>
                                                <tr className="govuk-table__row" key={p.installmentNumber}>
                                                    <th scope="row" className="govuk-table__header">{p.installmentYear} {p.installmentMonth}
                                                &nbsp;{p.isPaid ? <strong className="govuk-tag">Paid</strong> : ""}
                                                    </th>
                                                    <td className="govuk-table__cell">{p.installmentNumber}</td>
                                                    <td className="govuk-table__cell govuk-table__cell--numeric">
                                                        <FormattedNumber value={p.installmentValue} type={NumberType.FormattedMoney} />
                                                    </td>
                                                </tr>)}
                                            <tr className="govuk-table__row">
                                                <th scope="row" className="govuk-table__header">Total
                                        </th>
                                                <td className="govuk-table__cell"></td>
                                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                                    <FormattedNumber value={profiling.totalAllocation} type={NumberType.FormattedMoney} />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <h3 className="govuk-heading-m">Previous profiles</h3>
                                    {specification && specification.fundingStreams && specification.fundingStreams.length > 0 &&
                                        <p className="govuk-body">History of previous <Link
                                            to={`/Approvals/ProfilingArchive/${match.params.specificationId}/${match.params.providerId}/${match.params.providerVersionId}/${match.params.fundingStreamId}/${match.params.fundingPeriodId}`}
                                            className="govuk-button"
                                            data-module="govuk-button">profiles</Link>
                                        </p>
                                    }
                                </section>
                            </Tabs.Panel>
                            <Tabs.Panel hidden={!displayProfilingPattern} label="profiling">
                                <div className="govuk-grid-row" hidden={!isLoading.profiling}>
                                    <div className="govuk-grid-column-full">
                                        <LoadingStatus title={"Loading profiling"} />
                                    </div>
                                </div>
                                <section className="govuk-tabs__panel" id="profiling" hidden={isLoading.profiling}>
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
                                                    profilingPatterns.map((p, key) => {
                                                        return <div className="govuk-summary-list__row" key={key}>
                                                            <dt className="govuk-summary-list__key">
                                                                {p.fundingLineName}
                                                            </dt>
                                                            <dd className="govuk-summary-list__value">
                                                                {p.profilePatternName}
                                                            </dd>
                                                            <dd className="govuk-summary-list__actions">
                                                                <Link
                                                                    to={`/Approvals/ProviderFundingOverview/${match.params.specificationId}/${match.params.providerId}/${match.params.providerVersionId}/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${p.fundingLineCode}`}>
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
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                </div>}
            <div className="govuk-clearfix"></div>
            <a href="#" className="govuk-back-link" onClick={history.goBack}>Back</a>
        </div>
        <Footer />
    </div>;
};
