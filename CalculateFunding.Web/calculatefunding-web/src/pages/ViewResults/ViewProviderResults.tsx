import React, {useEffect, useRef, useState} from "react";
import {ProviderDetailsViewModel} from "../../types/Provider/ProviderDetailsViewModel";
import {getProviderByIdAndVersionService, getProviderResultsService} from "../../services/providerService";
import {RouteComponentProps, useLocation} from "react-router";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {SpecificationInformation} from "../../types/Provider/SpecificationInformation";
import {approveFundingLineStructureService, getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {Tabs} from "../../components/Tabs";
import {DateFormatter} from "../../components/DateFormatter";
import {getCalculationsByProviderService} from "../../services/calculationService";
import {Link} from "react-router-dom";
import Pagination from "../../components/Pagination";
import {
    getFundingLineStructureByProviderService
} from "../../services/fundingStructuresService";
import {FundingStructureType, IFundingStructureItem} from "../../types/FundingStructureItem";
import {AutoComplete} from "../../components/AutoComplete";
import {CollapsibleSteps, setCollapsibleStepsAllStepsStatus} from "../../components/CollapsibleSteps";
import {BackToTop} from "../../components/BackToTop";
import {PublishStatus} from "../../types/PublishStatusModel";
import {
    checkIfShouldOpenAllSteps,
    expandCalculationsByName,
    getDistinctOrderedFundingLineCalculations, setExpandStatusByFundingLineName,
    updateFundingLineExpandStatus
} from "../../components/fundingLineStructure/FundingLineStructure";
import {NoData} from "../../components/NoData";
import {FundingLineStepProviderResults} from "../../components/fundingLineStructure/FundingLineStepProviderResults";
import {AdditionalCalculationSearchResultViewModel} from "../../types/Calculations/AdditionalCalculation";
import {Footer} from "../../components/Footer";
import * as QueryString from "query-string";
import {getFundingStreamByIdService} from "../../services/policyService";
import {FundingStream} from "../../types/viewFundingTypes";
import {WarningText} from "../../components/WarningText";

export interface ViewProviderResultsRouteProps {
    providerId: string;
    fundingStreamId: string;
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
        urn: "",
        paymentOrganisationIdentifier: "",
        paymentOrganisationName: ""
    });
    const [providerResults, setProviderResults] = useState<SpecificationInformation[]>([{
        fundingPeriod: "",
        fundingPeriodEnd: new Date(),
        id: "",
        lastEditDate: new Date(),
        name: "",
        fundingStreamIds: []
    }]);
    const [additionalCalculations, setAdditionalCalculations] = useState<AdditionalCalculationSearchResultViewModel>({
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
    });
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
    const [selectedSpecificationId, setSelectedSpecificationId] = useState<string>("");
    const [defaultFundingStreamName, setDefaultFundingStreamName] = useState<string>("");
    const [fundingLines, setFundingLines] = useState<IFundingStructureItem[]>([]);
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLinesOriginalData, setFundingLinesOriginalData] = useState<IFundingStructureItem[]>([]);
    const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState<boolean>();
    const fundingLineStepReactRef = useRef(null);
    const nullReactRef = useRef(null);
    const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
    const [fundingLinePublishStatus, setFundingLinePublishStatus] = useState<PublishStatus>(PublishStatus.Draft);
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState<boolean>();
    const location = useLocation();

    useEffectOnce(() => {
        const providerId = match.params.providerId;
        const querystringParams = QueryString.parse(location.search);

        getProviderResultsService(providerId)
            .then((response) => {
                const specificationInformation = response.data;
                if (specificationInformation && specificationInformation.length > 0) {
                    const selectedSpecification = specificationInformation
                        .find((s) => 
                            s.id === querystringParams.specificationId) ?? specificationInformation[0];

                    let selectedSpecificationId = selectedSpecification.id;

                    if (specificationInformation.some((specInformation)=>
                        specInformation.fundingStreamIds != null)) {
                        let selectSpecificationByFundingStream = false;
                        specificationInformation.map((specInfo) => {
                            return specInfo.fundingStreamIds?.map((fundingStreamId) => {
                                if (fundingStreamId === match.params.fundingStreamId) {
                                    setSelectedSpecificationId(specInfo.id);
                                    selectedSpecificationId = specInfo.id;
                                    selectSpecificationByFundingStream = true;
                                    return;
                                }
                            });
                        });

                        if (!selectSpecificationByFundingStream) {
                            getFundingStreamByIdService(match.params.fundingStreamId)
                                .then((fundingStreamResponse) => {
                                    const fundingStream = fundingStreamResponse.data as FundingStream;
                                    setDefaultFundingStreamName(fundingStream.name);
                                })
                        }
                    }
                    populateSpecification(selectedSpecificationId);

                    setProviderResults(specificationInformation);
                    setIsLoading(prevState => {
                        return {
                            ...prevState,
                            providerResults: false
                        }
                    });
                }
            })
            .catch((e) => {
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
    });

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
        if (!rerenderFundingLineSteps) {
            return
        }
        setFundingLineRenderInternalState(true);
        setRerenderFundingLineSteps(false);
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
                setFundingLineSearchSuggestions(getDistinctOrderedFundingLineCalculations(fundingLines));
                setFundingLinesOriginalData(fundingLines);
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
    }, [specificationSummary.providerVersionId]);

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
        getCalculationsByProviderService({
            specificationId: specificationId,
            status: status,
            pageNumber: pageNumber,
            searchTerm: searchTerm,
            calculationType: "Additional"
        }, match.params.providerId)
            .then((response) => {
                if (response.status === 200) {
                    const result = response.data as AdditionalCalculationSearchResultViewModel;
                    setAdditionalCalculations(result);
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
        approveFundingLineStructureService(specificationId).then((response) => {
            if (response.status === 200) {
                setFundingLinePublishStatus(response.data as PublishStatus)
            }
        });
    }

    let fundingLineStatus = specificationSummary.approvalStatus as PublishStatus;
    if (fundingLines != null)
        fundingLineStatus = fundingLinePublishStatus;

    function openCloseAllFundingLines(isOpen: boolean) {
        setFundingLinesExpandedStatus(isOpen);
        updateFundingLineExpandStatus(fundingLines, isOpen);
    }

    function searchFundingLines(calculationName: string) {
        const fundingLinesCopy: IFundingStructureItem[] = fundingLinesOriginalData as IFundingStructureItem[];
        expandCalculationsByName(fundingLinesCopy, calculationName, fundingLineStepReactRef, nullReactRef);
        setFundingLines(fundingLinesCopy);
        setRerenderFundingLineSteps(true);
        if (checkIfShouldOpenAllSteps(fundingLinesCopy)) {
            openCloseAllFundingLines(true);
        }
    }

    function collapsibleStepsChanged(expanded: boolean, name: string) {
        const fundingLinesCopy: IFundingStructureItem[] = setExpandStatusByFundingLineName(fundingLines, expanded, name);
        setFundingLines(fundingLinesCopy);

        const collapsibleStepsAllStepsStatus = setCollapsibleStepsAllStepsStatus(fundingLinesCopy);
        if (collapsibleStepsAllStepsStatus.openAllSteps){
            openCloseAllFundingLines(true);
        }
        if (collapsibleStepsAllStepsStatus.closeAllSteps){
            openCloseAllFundingLines(false);
        }
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
                setSelectedSpecificationId(result.id);

                setSpecificationSummary(response.data);

                getFundingLineStructureByProviderService(result.id, result.fundingPeriod.id, result.fundingStreams[0].id, match.params.providerId).then((response) => {
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
                    <span className="govuk-caption-m govuk-!-margin-bottom-4">UKPRN: <strong>{providerDetails.ukprn}</strong></span>
                </div>
            </div>
            <WarningText text={`There are no specifications for ${defaultFundingStreamName}`} hidden={defaultFundingStreamName === "" || isLoading.providerDetails} />
            <NoData hidden={isLoading.providerResults || specificationSummary.id !== "" || isLoading.providerDetails}/>
            <div className="govuk-grid-row govuk-!-margin-bottom-6" hidden={specificationSummary.id === "" || isLoading.providerDetails}>
                <div className="govuk-grid-column-two-thirds">
                    <div className="govuk-form-group">
                        <h3 className="govuk-heading-m govuk-!-margin-bottom-1">Specification</h3>
                        <span className="govuk-caption-m govuk-!-margin-bottom-2">Available specifications for all funding streams will be displayed here.</span>
                        <select className="govuk-select" id="sort" name="sort" 
                                onChange={setSelectedSpecification} 
                                value={selectedSpecificationId !== "" ?  selectedSpecificationId : specificationSummary.id}>
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
            <div className="govuk-grid-row" hidden={specificationSummary.id === "" || isLoading.providerDetails}>
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
                                    <div className="govuk-grid-column-full">
                                        <h2 className="govuk-heading-l">Funding line structure</h2>
                                    </div>
                                </div>
                                <div className="govuk-grid-row" hidden={isLoading.fundingLineStructure}>
                                    <div className="govuk-grid-column-full">
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
                                                    onClick={(e)=>openCloseAllFundingLines(true)}
                                                    hidden={fundingLinesExpandedStatus}>Open all<span
                                                className="govuk-visually-hidden"> sections</span></button>
                                            <button type="button" className="govuk-accordion__open-all"
                                                    aria-expanded="true"
                                                    onClick={(e)=>openCloseAllFundingLines(false)}
                                                    hidden={!fundingLinesExpandedStatus}>Close all<span
                                                className="govuk-visually-hidden"> sections</span></button>
                                        </div>
                                        <ul className="collapsible-steps">
                                            {
                                                fundingLines.map((f, index) => {
                                                    let linkValue = '';
                                                    if (f.calculationId != null && f.calculationId !== '') {
                                                        linkValue = `/app/viewcalculationresults/${f.calculationId}`;
                                                    }
                                                    return <li key={"collapsible-steps-top" + index} className="collapsible-step step-is-shown"><CollapsibleSteps
                                                        customRef={f.customRef}
                                                        key={"collapsible-steps" + index}
                                                        uniqueKey={index.toString()}
                                                        title={FundingStructureType[f.type]}
                                                        calculationType={f.calculationType != null ? f.calculationType : ""}
                                                        value={f.value != null ? f.value : ""}
                                                        description={f.name}
                                                        status={(f.calculationPublishStatus != null && f.calculationPublishStatus !== '') ?
                                                            f.calculationPublishStatus : ""}
                                                        step={f.level.toString()}
                                                        expanded={fundingLinesExpandedStatus || f.expanded}
                                                        link={linkValue}
                                                        hasChildren={f.fundingStructureItems != null}
                                                        callback={collapsibleStepsChanged}>
                                                        <FundingLineStepProviderResults key={f.name.replace(" ", "") + index}
                                                                                        expanded={fundingLinesExpandedStatus}
                                                                                        fundingStructureItem={f}
                                                                                        callback={collapsibleStepsChanged}/>
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
                                        <th scope="col" className="govuk-table__header">Type</th>
                                        <th scope="col" className="govuk-table__header">Value</th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    {additionalCalculations.results.map((ac, index) =>
                                        <tr className="govuk-table__row" key={index}>
                                            <td className="govuk-table__cell text-overflow">
                                                <Link to={`/Specifications/EditAdditionalCalculation/${ac.id}`}>{ac.name}</Link>
                                            </td>
                                            <td className="govuk-table__cell">{ac.valueType != null && ac.value != null ? ac.valueType : ""}</td>
                                            <td className="govuk-table__cell">{ac.value}</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>

                                <div className="govuk-warning-text" hidden={additionalCalculations.totalCount > 0}>
                                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                                    <strong className="govuk-warning-text__text">
                                        <span className="govuk-warning-text__assistive">Warning</span>
                                        No additional calculations available.&nbsp;
                                        <Link to={`/Specifications/CreateAdditionalCalculation/${specificationSummary.id}`}>
                                            Create a calculation
                                        </Link>
                                    </strong>
                                </div>
                                {additionalCalculations.totalResults > 0 &&
                                <nav className="govuk-!-margin-top-9" role="navigation" aria-label="Pagination">
                                    <div className="pagination__summary">
                                        <p className="govuk-body right-align">
                                            Showing
                                            {additionalCalculations.startItemNumber} - {additionalCalculations.endItemNumber}
                                            of {additionalCalculations.totalResults} calculations
                                        </p>
                                    </div>
                                    <Pagination currentPage={additionalCalculations.currentPage}
                                                lastPage={additionalCalculations.lastPage}
                                                callback={movePage}/>
                                </nav>}
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
                                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"/>
                                <h4 className="govuk-heading-m">Payment organisation details</h4>
                                <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Name
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.paymentOrganisationName}
                                        </dd>
                                    </div>
                                    <div className="govuk-summary-list__row">
                                        <dt className="govuk-summary-list__key">
                                            Identifier
                                        </dt>
                                        <dd className="govuk-summary-list__value">
                                            {providerDetails.paymentOrganisationIdentifier}
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </div>
        </div>
        &nbsp;
        <Footer/>
    </div>
}