import * as React from "react"
import {useEffect, useState} from "react"
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {Tabs} from "../../components/Tabs";
import {RouteComponentProps} from "react-router";
import {
    getAdditionalCalculations,
    getSpecificationSummary,
    getTemplateCalculations
} from "../../actions/ViewSpecificationResultsActions";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../states/AppState";
import {ViewSpecificationResultsState} from "../../states/ViewSpecificationResultsState";
import Pagination from "../../components/Pagination";
import {Section} from "../../types/Sections";
import {
    getDownloadableReportsService
} from "../../services/specificationService";
import {ReportMetadataViewModel} from "../../types/Specifications/ReportMetadataViewModel";
import {DateFormatter} from "../../components/DateFormatter";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {AutoComplete} from "../../components/AutoComplete";
import {CollapsibleSteps, setCollapsibleStepsAllStepsStatus} from "../../components/CollapsibleSteps";
import {FundingStructureType, IFundingStructureItem} from "../../types/FundingStructureItem";
import {FundingLineStep} from "../../components/fundingLineStructure/FundingLineStep";
import {BackToTop} from "../../components/BackToTop";
import {useRef} from "react";
import {
    checkIfShouldOpenAllSteps,
    expandCalculationsByName, getDistinctOrderedFundingLineCalculations, setExpandStatusByFundingLineName,
    updateFundingLineExpandStatus
} from "../../components/fundingLineStructure/FundingLineStructure";
import {
    getFundingStructuresWithCalculationResultService
} from "../../services/fundingStructuresService";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {ErrorMessage} from "../../types/ErrorMessage";

export interface ViewSpecificationResultsRoute {
    specificationId: string
}

export function ViewSpecificationResults({match}: RouteComponentProps<ViewSpecificationResultsRoute>) {
    const dispatch = useDispatch();
    const [additionalCalculationsSearchTerm, setAdditionalCalculationsSearchTerm] = useState('');
    const [templateCalculationsSearchTerm] = useState('');
    const [additionalStatusFilter, setAdditionalStatusFilter] = useState("All");
    const [downloadableReports, setDownloadableReports] = useState<ReportMetadataViewModel[]>([]);
    const [isLoadingFundingLineStructure, setIsLoadingFundingLineStructure] = useState(false);
    const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
    const [fundingLines, setFundingLines] = useState<IFundingStructureItem[]>([]);
    const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState<boolean>();
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState<boolean>();
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLinesOriginalData, setFundingLinesOriginalData] = useState<IFundingStructureItem[]>([]);
    const [fundingLineStructureError, setFundingLineStructureError] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const fundingLineStepReactRef = useRef(null);
    const nullReactRef = useRef(null);

    const specificationResults: ViewSpecificationResultsState = useSelector((state: AppState) => state.viewSpecificationResults);

    const specificationId = match.params.specificationId;

    useEffect(() => {
        document.title = "Specification Results - Calculate funding";
        dispatch(getSpecificationSummary(specificationId));
        dispatch(getTemplateCalculations(specificationId, "All", 1, templateCalculationsSearchTerm));
        dispatch(getAdditionalCalculations(specificationId, "All", 1, additionalCalculationsSearchTerm));

        getDownloadableReportsService(specificationId)
            .then((result) => {
                    const response = result.data as ReportMetadataViewModel[];
                    setDownloadableReports(response);
            });
    }, [specificationId]);

    useEffect(() => {
        if (specificationResults.specification &&
            specificationResults.specification.fundingPeriod &&
            specificationResults.specification.fundingStreams[0]) {
            fetchData();
        }
    }, [specificationResults.specification]);

    useEffect(() => {
        if (!rerenderFundingLineSteps) {
            return
        }
        setFundingLineRenderInternalState(true);
        setRerenderFundingLineSteps(false);
    }, [rerenderFundingLineSteps]);

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

    function updateAdditionalCalculations(event: React.ChangeEvent<HTMLSelectElement>) {
        const filter = event.target.value;
        setAdditionalStatusFilter(filter);
        dispatch(getAdditionalCalculations(specificationId, filter, 1, additionalCalculationsSearchTerm));
    }

    function searchAdditionalCalculations() {
        dispatch(getAdditionalCalculations(specificationId, additionalStatusFilter, 1, additionalCalculationsSearchTerm));
    }

    function additionalCalculationsSearch(e: React.ChangeEvent<HTMLInputElement>) {
        setAdditionalCalculationsSearchTerm(e.target.value);
    }

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

    useEffect(() => {
        if (fundingLines.length !== 0) {
            if (fundingLinesOriginalData.length === 0) {
                setFundingLineSearchSuggestions(getDistinctOrderedFundingLineCalculations(fundingLines));
                setFundingLinesOriginalData(fundingLines);
            }
            setIsLoadingFundingLineStructure(false);
        }
    }, [fundingLines]);

    const fetchData = async () => {
        if (specificationResults.specification &&
            specificationResults.specification.fundingPeriod &&
            specificationResults.specification.fundingStreams[0]) {
            try {
                setIsLoadingFundingLineStructure(true);
                const fundingLineStructureResponse = await getFundingStructuresWithCalculationResultService(
                    specificationResults.specification.id,
                    specificationResults.specification.fundingPeriod.id,
                    specificationResults.specification.fundingStreams[0].id);
                const fundingStructureItem = fundingLineStructureResponse.data as IFundingStructureItem[];
                setFundingLines(fundingStructureItem);
            } catch (err) {
                setFundingLineStructureError(true);
                addErrorMessage(`A problem occurred while loading funding line structure: ${err}`);
            } finally {
                setIsLoadingFundingLineStructure(false);
            }
        }
    };

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    return <div>
        <Header location={Section.Results}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"View results"} url={"/results"}/>
                <Breadcrumb name={"Select specification"} url={"/SelectSpecification"}/>
                <Breadcrumb name={specificationResults.specification.name}/>
            </Breadcrumbs>
            
            <MultipleErrorSummary errors={errors} />
            
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl">{specificationResults.specification.name}</h1>
                        <h2 className="govuk-caption-xl">{specificationResults.specification.fundingPeriod.name}</h2>
                    </div>
                </div>
                <div className="govuk-grid-row govuk-!-padding-top-5">
                    <div className="govuk-grid-column-full">
                        <Tabs initialTab="fundingline-structure">
                            <ul className="govuk-tabs__list">
                                <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                                <Tabs.Tab label="additional-calculations">Additional Calculations</Tabs.Tab>
                                <Tabs.Tab label="downloadable-reports">Downloadable Reports</Tabs.Tab>
                            </ul>
                            <Tabs.Panel label="fundingline-structure">
                                <section className="govuk-tabs__panel" id="fundingline-structure">
                                    <LoadingStatus title={"Loading funding line structure"}
                                                   hidden={!isLoadingFundingLineStructure}
                                                   description={"Please wait whilst funding line structure is loading"}/>
                                    <div className="govuk-grid-row" hidden={!fundingLineStructureError}>
                                        <div className="govuk-grid-column-two-thirds">
                                            <p className="govuk-error-message">An error has occurred. Please see above for details.</p>
                                        </div>
                                    </div>
                                    <div className="govuk-grid-row" hidden={isLoadingFundingLineStructure || fundingLineStructureError}>
                                        <div className="govuk-grid-column-full">
                                            <h2 className="govuk-heading-l">Funding line structure</h2>
                                        </div>
                                        <div className="govuk-grid-column-full">
                                            <div className="govuk-form-group search-container">
                                                <label className="govuk-label">
                                                    Search by calculation
                                                </label>
                                                <AutoComplete suggestions={fundingLineSearchSuggestions} callback={searchFundingLines}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="govuk-accordion__controls" hidden={isLoadingFundingLineStructure || fundingLineStructureError}>
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
                                                    linkValue = `/ViewCalculationResults/${f.calculationId}`;
                                                }
                                                return <li key={"collapsible-steps-top" + index} className="collapsible-step step-is-shown">
                                                    <CollapsibleSteps
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
                                                        hasChildren={f.fundingStructureItems != null}
                                                        lastUpdatedDate={f.lastUpdatedDate}
                                                        callback={collapsibleStepsChanged}>
                                                        <FundingLineStep key={f.name.replace(" ", "") + index}
                                                                         expanded={fundingLinesExpandedStatus}
                                                                         fundingStructureItem={f}
                                                                         showResults={true}
                                                                         callback={collapsibleStepsChanged}/>
                                                    </CollapsibleSteps>
                                                </li>
                                            })}
                                    </ul>
                                    <BackToTop id={"fundingline-structure"} hidden={fundingLines == null ||
                                    fundingLines.length === 0}/>
                                </section>
                            </Tabs.Panel>
                            <Tabs.Panel label="additional-calculations">
                                <section className="govuk-tabs__panel"
                                         id="additional-calculations">
                                    <h2 className="govuk-heading-l">Additional calculations</h2>
                                    <input className="govuk-input govuk-!-width-three-quarters govuk-!-margin-right-1"
                                           type="text" onChange={(e) => additionalCalculationsSearch(e)}/>
                                    <button className="govuk-button" onClick={searchAdditionalCalculations}>Search
                                    </button>
                                    <p className="govuk-body">
                                        Filter by calculation status
                                    </p>
                                    <select name="calculationStatus" id="calculationStatus" className="govuk-select"
                                            onChange={(e) => {
                                                updateAdditionalCalculations(e)
                                            }}>
                                        <option value="All">All</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Updated">Updated</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                    <table className="govuk-table">
                                        <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th scope="col" className="govuk-table__header">Calculation Name</th>
                                            <th scope="col" className="govuk-table__header">Status</th>
                                            <th scope="col" className="govuk-table__header">Updated</th>
                                        </tr>
                                        </thead>
                                        <tbody className="govuk-table__body">
                                        {specificationResults.additionalCalculations.results.map(tc =>
                                            <tr className="govuk-table__row">
                                                <td className="govuk-table__cell">
                                                    <Link to={`/ViewCalculationResults/${tc.id}`}>{tc.name}</Link>
                                                </td>
                                                <td className="govuk-table__cell">{tc.status}</td>
                                                <td className="govuk-table__cell">
                                                    <DateFormatter date={tc.lastUpdatedDate} utc={false}/>
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="govuk-table__row"
                                            hidden={specificationResults.additionalCalculations.totalCount > 0}>
                                            <td className="govuk-table__cell" colSpan={3}>No results were found.</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    {specificationResults.additionalCalculations.totalResults > 0 &&
                                    <div className="govuk-grid-row">
                                        <div className="govuk-grid-column-two-thirds">
                                            <Pagination
                                                currentPage={specificationResults.additionalCalculations.currentPage}
                                                lastPage={specificationResults.additionalCalculations.lastPage}
                                                callback={() => {
                                                }}/>
                                        </div>
                                        <div className="govuk-grid-column-one-third govuk-body govuk-!-padding-top-4">
                                            Showing {specificationResults.additionalCalculations.startItemNumber} - {specificationResults.additionalCalculations.endItemNumber} of {specificationResults.additionalCalculations.totalResults} results
                                        </div>
                                    </div>}
                                </section>
                            </Tabs.Panel>
                            <Tabs.Panel label="downloadable-reports">
                                <section className="govuk-tabs__panel" id="downloadable-reports">
                                    <h2 className="govuk-heading-l">Downloadable reports</h2>
                                    <div className="govuk-grid-row">
                                        <div className="govuk-grid-column-full">
                                            <div className="govuk-body-l" hidden={downloadableReports.length > 0}>
                                                There are no reports available for this Specification
                                            </div>
                                            <div hidden={downloadableReports.filter(dr => dr.category === "Live").length === 0}>
                                                <h3 className="govuk-heading-m govuk-!-margin-top-5">Live reports</h3>
                                                {downloadableReports.filter(dr => dr.category === "Live").map(dlr => <div>
                                                        <div className="attachment__thumbnail">
                                                            <a href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`} className="govuk-link" target="_self"
                                                               aria-hidden="true">
                                                                <svg
                                                                    className="attachment__thumbnail-image thumbnail-image-small "
                                                                    version="1.1" viewBox="0 0 99 140" width="99"
                                                                    height="140"
                                                                    aria-hidden="true">
                                                                    <path
                                                                        d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z"
                                                                        stroke-width="0"></path>
                                                                    <path
                                                                        d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z"
                                                                        stroke-width="0"></path>
                                                                    <path
                                                                        d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5"
                                                                        fill="none" stroke-miterlimit="10"
                                                                        stroke-width="2"></path>
                                                                </svg>
                                                            </a>
                                                        </div>
                                                        <div className="attachment__details">
                                                            <h4 className="govuk-heading-s">
                                                                <a className="govuk-link" target="_self"
                                                                   href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`}>{dlr.name}</a>
                                                            </h4>
                                                            <p className="govuk-body-s">
                                                                <span>{dlr.format}</span>, <span>{dlr.size}</span>, Updated: <span><DateFormatter
                                                                utc={false} date={dlr.lastModified}/></span>
                                                            </p>
                                                        </div>
                                                        <div className="govuk-clearfix"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div hidden={downloadableReports.filter(dr => dr.category === "History").length === 0}>
                                                <h3 className="govuk-heading-m govuk-!-margin-top-5">Published reports</h3>
                                                {downloadableReports.filter(dr => dr.category === "History").map(dlr =>
                                                    <div>
                                                        <div className="attachment__thumbnail">
                                                            <a href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`} className="govuk-link" target="_self"
                                                               aria-hidden="true">
                                                                <svg
                                                                    className="attachment__thumbnail-image thumbnail-image-small "
                                                                    version="1.1" viewBox="0 0 99 140" width="99"
                                                                    height="140"
                                                                    aria-hidden="true">
                                                                    <path
                                                                        d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z"
                                                                        stroke-width="0"></path>
                                                                    <path
                                                                        d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z"
                                                                        stroke-width="0"></path>
                                                                    <path
                                                                        d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5"
                                                                        fill="none" stroke-miterlimit="10"
                                                                        stroke-width="2"></path>
                                                                </svg>
                                                            </a>
                                                        </div>
                                                        <div className="attachment__details">
                                                            <h4 className="govuk-heading-s">
                                                                <a className="govuk-link" target="_self"
                                                                   href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`}>{dlr.name}</a>
                                                            </h4>
                                                            <p className="govuk-body-s">
                                                                <span>{dlr.format}</span>, <span>{dlr.size}</span>, Updated: <span><DateFormatter
                                                                utc={false} date={dlr.lastModified}/></span>
                                                            </p>
                                                        </div>
                                                        <div className="govuk-clearfix"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
        &nbsp;
        <Footer/>
    </div>
}