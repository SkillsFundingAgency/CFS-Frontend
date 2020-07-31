import React, {useEffect, useRef, useState} from "react";
import {ProviderDetailsViewModel} from "../../types/Provider/ProviderDetailsViewModel";
import {getProviderByIdAndVersionService, getProviderResultsService} from "../../services/providerService";
import {RouteComponentProps} from "react-router";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {SpecificationInformation} from "../../types/Provider/SpecificationInformation";
import {changeFundingLineStateService, getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {Tabs} from "../../components/Tabs";
import {DateFormatter} from "../../components/DateFormatter";
import {CalculationSummary} from "../../types/CalculationSummary";
import {getCalculationsService} from "../../services/calculationService";
import {Link} from "react-router-dom";
import Pagination from "../../components/Pagination";
import {getFundingLineStructureService} from "../../services/fundingStructuresService";
import {FundingStructureType, IFundingStructureItem} from "../../types/FundingStructureItem";
import {ApproveStatusButton} from "../../components/ApproveStatusButton";
import {AutoComplete} from "../../components/AutoComplete";
import {CollapsibleSteps} from "../../components/CollapsibleSteps";
import {FundingLineStep} from "../../components/fundingLineStructure/FundingLineStep";
import {BackToTop} from "../../components/BackToTop";
import {PublishStatus} from "../../types/PublishStatusModel";
import {expandCalculationsByName, getDistinctOrderedFundingLineCalculations, updateFundingLineExpandStatus} from "../../components/fundingLineStructure/FundingLineStructure";
import {NoData} from "../../components/NoData";
import {isMainThread} from "worker_threads";

export interface ViewProviderResultsRouteProps {
    providerId: string;
}

export function ViewProviderResults({match}: RouteComponentProps<ViewProviderResultsRouteProps>) {
    const [providerDetails, setProviderDetails] = useState<ProviderDetailsViewModel>({
        authority: "",
        countryCode: "",
        countryName: "",
        crmAccountId: "",
        dateClosed: new Date(),
        dateOpened: new Date(),
        dfeEstablishmentNumber: "",
        establishmentNumber: "",
        id: "",
        laCode: "",
        legalName: "",
        localGovernmentGroupTypeCode: "",
        localGovernmentGroupTypeName: "",
        name: "",
        navVendorNo: "",
        phaseOfEducation: "",
        postcode: "",
        providerId: "",
        providerProfileIdType: "",
        providerSubType: "",
        providerType: "",
        providerVersionId: "",
        reasonEstablishmentClosed: "",
        reasonEstablishmentOpened: "",
        rscRegionCode: "",
        rscRegionName: "",
        status: "",
        successor: "",
        town: "",
        trustCode: "",
        trustName: "",
        trustStatus: "",
        ukprn: "",
        upin: "",
        urn: ""
    });
    const [providerResults, setProviderResults] = useState<SpecificationInformation[]>([{
        fundingPeriod: "",
        fundingPeriodEnd: new Date(),
        id: "",
        lastEditDate: new Date(),
        name: ""
    }])
    const [additionalCalculations, setAdditionalCalculations] = useState<CalculationSummary>({
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        lastPage: 0,
        pagerState: {
            currentPage: 0,
            lastPage: 0,
            pages: [],
            displayNumberOfPages: 0,
            nextPage: 0,
            previousPage: 0
        },
        results: [],
        startItemNumber: 0,
        totalCount: 0,
        totalErrorResults: 0,
        totalResults: 0
    })
    const [additionalCalculationsSearchTerm, setAdditionalCalculationsSearchTerm] = useState("");
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>({
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [{
            name: "",
            id: ""
        }],
        id: "",
        isSelectedForFunding: false,
        name: "",
        providerVersionId: ""
    })

    const [isLoading, setIsLoading] = useState({
        fundingLineStructure: true,
        additionalCalculations: true,
        providerData: true,
        providerResults: true,
        providerDetails: true
    });
    const [fundingLines, setFundingLines] = useState<IFundingStructureItem[]>([]);
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLinesOriginalData, setFundingLinesOriginalData] = useState<IFundingStructureItem[]>([]);
    const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState();
    const fundingLineStepReactRef = useRef(null);
    const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
    const [fundingLinePublishStatus, setFundingLinePublishStatus] = useState<PublishStatus>(PublishStatus.Draft);
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState();

    useEffectOnce(() => {
        const providerId = match.params.providerId;

        getProviderResultsService(providerId).then((response) => {
            if (response.status === 200) {
                const specificationInformation = response.data as SpecificationInformation[];
                populateSpecification(specificationInformation[0].id);
                setProviderResults(specificationInformation);
                setIsLoading(prevState => {
                    return {
                        ...prevState,
                        providerResults: false
                    }
                })
            }
        }).catch((e) => {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    providerDetails: false,
                    providerResults: false,
                    providerData: false,
                    additionalCalculations: false,
                    fundingLineStructure: false
                }
            })
        });


    })

    useEffect(() => {
        if (!fundingLineRenderInternalState) {
            return
        }
        if (fundingLineStepReactRef !== null && fundingLineStepReactRef.current !== null) {
            // @ts-ignore
            fundingLineStepReactRef.current.scrollIntoView({behavior: 'smooth', block: 'start'})
        }
        setFundingLineRenderInternalState(false);
    }, [fundingLineRenderInternalState]);

    useEffect(() => {
        setFundingLineRenderInternalState(true);
    }, [rerenderFundingLineSteps]);

    useEffect(() => {
        setFundingLineRenderInternalState(true);
    }, [fundingLines]);

    useEffect(() => {
        if (additionalCalculations.currentPage !== 0) {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    additionalCalculations: false
                }
            });
        }
    }, [additionalCalculations.results]);

    useEffect(() => {
        if (fundingLines.length !== 0) {
            if (fundingLinesOriginalData.length === 0) {

                setFundingLineSearchSuggestions(getDistinctOrderedFundingLineCalculations(fundingLines));
                setFundingLinesOriginalData(fundingLines);
            }
        }
    }, [fundingLines]);

    useEffect(() => {
        if (fundingLines.length !== 0) {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    fundingLineStructure: false
                }
            });
        }
    }, [fundingLines]);

    useEffect(() => {
        if (specificationSummary.providerVersionId !== "") {
            populateProviderResults(specificationSummary.providerVersionId);
        }
    }, [specificationSummary.providerVersionId])

    function populateProviderResults(providerVersion: string) {
        getProviderByIdAndVersionService(match.params.providerId, providerVersion).then((response) => {
            if (response.status === 200) {
                setProviderDetails(response.data as ProviderDetailsViewModel);
                setIsLoading(prevState => {
                    return {
                        ...prevState,
                        providerDetails: false
                    }
                })
            }
        }).catch((e) => {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    providerDetails: false
                }
            })
        });
    }

    function populateAdditionalCalculations(specificationId: string, status: string, pageNumber: number, searchTerm: string) {
        getCalculationsService({specificationId: specificationId, status: status, pageNumber: pageNumber, searchTerm: searchTerm, calculationType: "Additional"}).then((response) => {
            if (response.status === 200) {
                const result = response.data as CalculationSummary;
                setAdditionalCalculations(result)
                setIsLoading(prevState => {
                    return {
                        ...prevState,
                        additionalCalculations: false
                    }
                })
            }
        }).catch((e) => {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    additionalCalculations: false,
                }
            });
        })
    }

    function movePage(pageNumber: number) {
        populateAdditionalCalculations(specificationSummary.id, "", pageNumber, additionalCalculationsSearchTerm);
    }

    function updateFundingLineState(specificationId: string) {
        changeFundingLineStateService(specificationId).then((response) => {
            if (response.status === 200) {
                setFundingLinePublishStatus(response.data as PublishStatus)
            }
        });
    }

    let fundingLineStatus = specificationSummary.approvalStatus;
    if (fundingLines != null)
        fundingLineStatus = fundingLinePublishStatus;

    function openCloseAllFundingLines() {
        setFundingLinesExpandedStatus(!fundingLinesExpandedStatus);
        updateFundingLineExpandStatus(fundingLines, !fundingLinesExpandedStatus);
    }

    function searchFundingLines(calculationName: string) {
        const fundingLinesCopy: IFundingStructureItem[] = fundingLinesOriginalData as IFundingStructureItem[];
        expandCalculationsByName(fundingLinesCopy, calculationName, fundingLineStepReactRef);
        setFundingLines(fundingLinesCopy);
        setRerenderFundingLineSteps(true);
    }

    function searchAdditionalCalculations() {
        populateAdditionalCalculations(specificationSummary.id, "", 1, additionalCalculationsSearchTerm);
    }

    function setSelectedSpecification(e: React.ChangeEvent<HTMLSelectElement>) {
        const specificationId = e.target.value;
        populateSpecification(specificationId);
    }

    function populateSpecification(specificationId: string) {
        getSpecificationSummaryService(specificationId).then((response) => {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    fundingLineStructure: true
                }
            });
            if (response.status === 200) {
                const result = response.data as SpecificationSummary;
                setSpecificationSummary(response.data);

                getFundingLineStructureService(result.id, result.fundingPeriod.id, result.fundingStreams[0].id).then((response) => {
                    if (response.status === 200) {
                        const result = response.data as IFundingStructureItem[];
                        setFundingLines(result);

                    }
                    setIsLoading(prevState => {
                        return {
                            ...prevState,
                            fundingLineStructure: false
                        }
                    });
                }).catch((e) => {
                    setIsLoading(prevState => {
                        return {
                            ...prevState,
                            fundingLineStructure: false
                        }
                    });
                });

                populateAdditionalCalculations(result.id, "", 1, additionalCalculationsSearchTerm);
            }
        }).catch((e) => {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    fundingLineStructure: false,
                    additionalCalculations: false,
                    providerData: false
                }
            });
        });
    }

    return <div>
        <Header location={Section.Results}/>
        <div className="govuk-width-container">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full" hidden={providerDetails.name === ""}>
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"}/>
                        <Breadcrumb name={"View results"} url={"/Results"}/>
                        <Breadcrumb name={"Select funding stream"} url={"/ViewResults/ViewProvidersFundingStreamSelection"}/>
                        <Breadcrumb name={"View provider results"} goBack={true}/>
                        <Breadcrumb name={providerDetails.name}/>
                    </Breadcrumbs>
                </div>
            </div>
            <div className="govuk-grid-row" hidden={!isLoading.providerDetails}>
                <div className="govuk-grid-column-full">
                    <LoadingStatus title={"Loading provider details"}/>
                </div>
            </div>
            <div className="govuk-grid-row" hidden={isLoading.providerDetails}>
                <div className="govuk-grid-column-full">
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">{providerDetails.name}</h1>
                    <span className="govuk-caption-m govuk-!-margin-bottom-8">UKPRN: <strong>{providerDetails.ukprn}</strong></span>
                </div>

            </div>
            <NoData hidden={isLoading.providerResults || specificationSummary.id !== ""}/>
            <div className="govuk-grid-row govuk-!-margin-bottom-6" hidden={specificationSummary.id === ""}>
                <div className="govuk-grid-column-two-thirds">
                    <div className="govuk-form-group">
                        <h3 className="govuk-heading-m govuk-!-margin-bottom-1">Specification</h3>
                        <span className="govuk-caption-m">Select a specification for the provider</span>
                        <select className="govuk-select" id="sort" name="sort" onChange={(e) => setSelectedSpecification(e)}>
                            {providerResults.map(p =>
                                <option key={p.id} value={p.id}>{p.name}
                                </option>
                            )}
                        </select>
                    </div>
                    <p className="govuk-body">Funding stream:<span className="govuk-!-margin-left-2 govuk-!-font-weight-bold">{specificationSummary.fundingStreams[0].name}</span>
                    </p>
                    <p className="govuk-body">Funding period:<span className="govuk-!-margin-left-2 govuk-!-font-weight-bold">{specificationSummary.fundingPeriod.name}</span>
                    </p>
                </div>
            </div>
            <div className="govuk-grid-row" hidden={specificationSummary.id === ""}>
                <div className="govuk-grid-column-full">
                    <Tabs initialTab={"funding-line-structure"}>
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="funding-line-structure">Funding line structure</Tabs.Tab>
                            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                            <Tabs.Tab label="provider-data">Provider data</Tabs.Tab>
                        </ul>
                        <Tabs.Panel label={"funding-line-structure"}>
                            <section className="govuk-tabs__panel" id="fundingline-structure">
                                <LoadingStatus title={"Loading funding line structure"}
                                               hidden={!isLoading.fundingLineStructure}
                                               description={"Please wait whilst funding line structure is loading"}/>
                                <div className="govuk-grid-row" hidden={isLoading.fundingLineStructure}>
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Funding line structure</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <ApproveStatusButton id={specificationSummary.id}
                                                             status={fundingLineStatus}
                                                             callback={updateFundingLineState}/>
                                    </div>
                                </div>
                                <div className="govuk-grid-row" hidden={isLoading.fundingLineStructure}>
                                    <div className="govuk-grid-column-two-thirds">
                                        <div className="govuk-form-group search-container">
                                            <label className="govuk-label">
                                                Search by calculation
                                            </label>
                                            <AutoComplete suggestions={fundingLineSearchSuggestions} callback={searchFundingLines}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="govuk-grid-row" hidden={isLoading.fundingLineStructure}>
                                    <div className="govuk-grid-column-full">
                                        <div className="govuk-accordion__controls" hidden={isLoading.fundingLineStructure}>
                                            <button type="button" className="govuk-accordion__open-all"
                                                    aria-expanded="false"
                                                    onClick={openCloseAllFundingLines}
                                                    hidden={fundingLinesExpandedStatus}>Open all<span
                                                className="govuk-visually-hidden"> sections</span></button>
                                            <button type="button" className="govuk-accordion__open-all"
                                                    aria-expanded="true"
                                                    onClick={openCloseAllFundingLines}
                                                    hidden={!fundingLinesExpandedStatus}>Close all<span
                                                className="govuk-visually-hidden"> sections</span></button>
                                        </div>
                                        <ul className="collapsible-steps">
                                            {
                                                fundingLines.map((f, index) => {
                                                    let linkValue = '';
                                                    if (f.calculationId != null && f.calculationId !== '') {
                                                        linkValue = `/app/Specifications/EditTemplateCalculation/${f.calculationId}`;
                                                    }
                                                    return <li key={"collapsible-steps-top" + index} className="collapsible-step step-is-shown"><CollapsibleSteps
                                                        customRef={f.customRef}
                                                        key={"collapsible-steps" + index}
                                                        uniqueKey={index.toString()}
                                                        title={FundingStructureType[f.type]}
                                                        description={f.name}
                                                        status={(f.calculationPublishStatus != null && f.calculationPublishStatus !== '') ?
                                                            f.calculationPublishStatus : ""}
                                                        step={f.level.toString()}
                                                        expanded={fundingLinesExpandedStatus || f.expanded}
                                                        link={linkValue}
                                                        hasChildren={f.fundingStructureItems != null}>
                                                        <FundingLineStep key={f.name.replace(" ", "") + index}
                                                                         expanded={fundingLinesExpandedStatus}
                                                                         fundingStructureItem={f}/>
                                                    </CollapsibleSteps>
                                                    </li>
                                                })}
                                        </ul>
                                        <BackToTop id={"fundingline-structure"} hidden={fundingLines == null ||
                                        fundingLines.length === 0}/>
                                    </div>
                                </div>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="additional-calculations">
                            <section className="govuk-tabs__panel" id="additional-calculations">
                                <LoadingStatus title={"Loading additional calculations"}
                                               hidden={!isLoading.additionalCalculations}
                                               description={"Please wait whilst additional calculations are loading"}/>
                                <div className="govuk-grid-row" hidden={isLoading.additionalCalculations}>
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Additional calculations</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third ">
                                        <p className="govuk-body right-align"
                                           hidden={additionalCalculations.totalResults === 0}>
                                            Showing {additionalCalculations.startItemNumber} - {additionalCalculations.endItemNumber}
                                            of {additionalCalculations.totalResults}
                                            calculations
                                        </p>
                                    </div>
                                </div>
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <div className="govuk-form-group search-container">
                                            <input className="govuk-input input-search" id="event-name"
                                                   name="event-name" type="text" onChange={(e) => setAdditionalCalculationsSearchTerm(e.target.value)}/>
                                        </div>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <button className="govuk-button" type="submit" onClick={() => searchAdditionalCalculations()}>Search</button>
                                    </div>
                                </div>
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header">Additional calculation name</th>
                                        <th scope="col" className="govuk-table__header">Status</th>
                                        <th scope="col" className="govuk-table__header">Value type</th>
                                        <th scope="col" className="govuk-table__header">Last edited date</th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    {additionalCalculations.results.map((ac, index) =>
                                        <tr className="govuk-table__row" key={index}>
                                            <td className="govuk-table__cell text-overflow">
                                                <Link to={`/Specifications/EditAdditionalCalculation/${ac.id}`}>{ac.name}</Link>
                                            </td>
                                            <td className="govuk-table__cell">{ac.status}</td>
                                            <td className="govuk-table__cell">{ac.valueType}</td>
                                            <td className="govuk-table__cell"><DateFormatter date={ac.lastUpdatedDate}
                                                                                             utc={false}/></td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>

                                <div className="govuk-warning-text"
                                     hidden={additionalCalculations.totalCount > 0}>
                                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                                    <strong className="govuk-warning-text__text">
                                        <span className="govuk-warning-text__assistive">Warning</span>
                                        No additional calculations available.&nbsp;
                                        <Link to={`/Specifications/CreateAdditionalCalculation/${specificationSummary.id}`}>
                                            Create a calculation
                                        </Link>
                                    </strong>
                                </div>
                                <nav className="govuk-!-margin-top-9" role="navigation" aria-label="Pagination">
                                    <div className="pagination__summary">
                                        <p className="govuk-body right-align"
                                           hidden={additionalCalculations.totalResults === 0}>
                                            Showing
                                            {additionalCalculations.startItemNumber} - {additionalCalculations.endItemNumber}
                                            of {additionalCalculations.totalResults} calculations
                                        </p>
                                    </div>
                                    <Pagination currentPage={additionalCalculations.currentPage}
                                                lastPage={additionalCalculations.lastPage}
                                                callback={movePage}/>
                                </nav>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label={"provider-data"}>
                            <section className="govuk-tabs__panel" id="provider-data">
                                <h2 className="govuk-heading-l">Provider data</h2>
                                <div className="govuk-warning-text">
                                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                                    <strong className="govuk-warning-text__text">
                                        <span className="govuk-warning-text__assistive">Warning</span>
                                        You are using {providerDetails.name} from the master version.
                                    </strong>
                                </div>
                                <h4 className="govuk-heading-m">Establishment details</h4>
                                <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Name
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.name}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Number
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.establishmentNumber}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            UKPRN
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.ukprn}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            UPIN
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.upin}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            URN
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.urn}
                                        </dd>
                                    </div>
                                </dl>
                                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"/>
                                <h4 className="govuk-heading-m">Provider details</h4>
                                <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Type
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.providerType}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Sub type
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.providerSubType}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Phase of education
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.phaseOfEducation}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Provider profile type
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.providerType}
                                        </dd>
                                    </div>
                                </dl>
                                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"/>
                                <h4 className="govuk-heading-m">Location details</h4>
                                <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Local authority
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.authority}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Local authority code
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.laCode}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Town
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.town}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Postcode
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.postcode}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Region
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.rscRegionName}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Region code
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.rscRegionCode}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Local government group type
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.localGovernmentGroupTypeName}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Local government group type code
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.localGovernmentGroupTypeCode}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Country
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.countryName}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Country code
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.localGovernmentGroupTypeCode}
                                        </dd>
                                    </div>
                                </dl>
                                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"/>
                                <h4 className="govuk-heading-m">Status details</h4>
                                <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Status
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.status}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Date opened
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {(providerDetails !== undefined) ?
                                                <DateFormatter date={providerDetails.dateOpened} utc={false}/> : "Unknown"}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Date closed
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {(providerDetails !== undefined) ?
                                                <DateFormatter date={providerDetails.dateClosed} utc={false}/> : "Unknown"}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Reason establishment opened
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.reasonEstablishmentOpened}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Reason establishment closed
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.reasonEstablishmentClosed}
                                        </dd>
                                    </div>
                                </dl>
                                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"/>
                                <h4 className="govuk-heading-m">Trust details</h4>
                                <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Status
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.trustStatus}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Name
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.trustName}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Code
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.trustCode}
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </div>
        </div>
    </div>
}