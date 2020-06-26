import {RouteComponentProps} from "react-router";
import {Header} from "../../components/Header";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {Footer} from "../../components/Footer";
import {Tabs} from "../../components/Tabs";
import {SaveReleaseTimetableViewModel} from "../../types/SaveReleaseTimetableViewModel";
import {DateInput} from "../../components/DateInput";
import {TimeInput} from "../../components/TimeInput";
import Pagination from "../../components/Pagination";
import {Details} from "../../components/Details";
import {FundingStructureType, IFundingStructureItem} from "../../types/FundingStructureItem";
import {ApproveStatusButton} from "../../components/ApproveStatusButton";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {changeFundingLineStateService, getProfileVariationPointersService, getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {Section} from "../../types/Sections";
import {DateFormatter} from "../../components/DateFormatter";
import {CollapsibleSteps} from "../../components/CollapsibleSteps";
import {LoadingStatus} from "../../components/LoadingStatus";
import {FundingLineStep} from "../../components/fundingLineStructure/FundingLineStep";
import {AutoComplete} from "../../components/AutoComplete";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {BackToTop} from "../../components/BackToTop";
import {expandCalculationsByName, getDistinctOrderedFundingLineCalculations, updateFundingLineExpandStatus} from "../../components/fundingLineStructure/FundingLineStructure";
import {ProfileVariationPointer} from "../../types/Specifications/ProfileVariationPointer";
import {getReleaseTimetableForSpecificationService, saveReleaseTimetableForSpecificationService} from "../../services/publishService";
import {ReleaseTimetableSummary, ReleaseTimetableViewModel} from "../../types/ReleaseTimetableSummary";
import {getDatasetBySpecificationIdService} from "../../services/datasetService";
import {DatasetSummary} from "../../types/DatasetSummary";
import {getCalculationsService} from "../../services/calculationService";
import {getFundingLineStructureService} from "../../services/fundingStructuresService";
import {CalculationSummary} from "../../types/CalculationSummary";
import {PublishStatus} from "../../types/PublishStatusModel";
import {FeatureFlagsState} from "../../states/FeatureFlagsState";
import {IStoreState} from "../../reducers/rootReducer";
import {useSelector} from "react-redux";

export interface ViewSpecificationRoute {
    specificationId: string;
}

export function ViewSpecification({match}: RouteComponentProps<ViewSpecificationRoute>) {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
    const [additionalCalculationsSearchTerm,] = useState('');
    const [statusFilter] = useState("");
    const [navisionDate, setNavisionDate] = useState();
    const [releaseDate, setReleaseDate] = useState();
    const [navisionTime, setNavisionTime] = useState();
    const [releaseTime, setReleaseTime] = useState();
    const [canTimetableBeUpdated, setCanTimetableBeUpdated] = useState(true);
    const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
    const [releaseTimetableIsEnabled, setReleaseTimetableIsEnabled] = useState(false);
    const initialSpecification: SpecificationSummary = {
        name: "",
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
        providerVersionId: ""
    };
    const [specification, setSpecification] = useState<SpecificationSummary>(initialSpecification);
    let specificationId = match.params.specificationId;
    let saveReleaseTimetable: SaveReleaseTimetableViewModel;
    const [isLoading, setIsLoading] = useState({
        fundingLineStructure: true,
        additionalCalculations: true,
        datasets: true
    });
    const [fundingLines, setFundingLines] = useState<IFundingStructureItem[]>([]);
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLinesOriginalData, setFundingLinesOriginalData] = useState<IFundingStructureItem[]>([]);
    const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState();
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState();
    const fundingLineStepReactRef = useRef(null);

    const [profileVariationPointers, setProfileVariationPointers] = useState<ProfileVariationPointer[]>([]);
    const [releaseTimetable, setReleaseTimetable] = useState<ReleaseTimetableViewModel>({
        navisionDate: {
            time:"00:00",
            year:"2000",
            month:"1",
            day:"1"
        },
        releaseDate:{
            time:"00:00",
            year:"2000",
            month:"1",
            day:"1"
        }
    });
    const [datasets, setDatasets] = useState<DatasetSummary>({
        content:[],
        statusCode:0
    });
    const [additionalCalculations, setAdditionalCalculations] = useState<CalculationSummary>({
        results: [],
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        lastPage: 0,
        pagerState: {
            lastPage: 0,
            currentPage: 0,
            pages: [],
            displayNumberOfPages: 0,
            nextPage: 0,
            previousPage: 0
        },
        startItemNumber: 0,
        totalCount: 0,
        totalErrorResults: 0,
        totalResults: 0
    });
    const [fundingLinePublishStatus, setFundingLinePublishStatus] = useState<PublishStatus>(PublishStatus.Draft);

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
        if (datasets.content.length === 0) {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    datasets: false
                }
            });
        }
    }, [fundingLines]);

    useEffect(() => {
        setReleaseTimetableIsEnabled(featureFlagsState.releaseTimetableVisible);
    }, [featureFlagsState.releaseTimetableVisible]);

    useEffect(() => {
        document.title = "Specification Results - Calculate funding";

        populateAdditionalCalculations(specificationId, statusFilter, 1, additionalCalculationsSearchTerm);

        getDatasetBySpecificationIdService(specificationId).then((result) => {
            const response = result;
            if (response.status === 200) {
                setDatasets(response.data as DatasetSummary);
            }
        });

        getReleaseTimetableForSpecificationService(specificationId).then((response) => {
            if (response.status === 200) {
                const result  =  response.data as ReleaseTimetableSummary;

                let request : ReleaseTimetableViewModel = {
                    releaseDate:
                        {
                            day: result.content.earliestPaymentAvailableDate != null ? new Date(result.content.earliestPaymentAvailableDate).getDate().toString() : "1",
                            month: result.content.earliestPaymentAvailableDate != null ? new Date(result.content.earliestPaymentAvailableDate).getMonth().toString()  : "1",
                            year: result.content.earliestPaymentAvailableDate != null ? new Date(result.content.earliestPaymentAvailableDate).getFullYear().toString()  : "2000",
                            time: result.content.earliestPaymentAvailableDate != null ? new Date(result.content.earliestPaymentAvailableDate).getTime().toString()  : "00:00",

                        },
                    navisionDate:
                        {
                            day: result.content.externalPublicationDate != null ? new Date(result.content.externalPublicationDate).getDate().toString() : "1",
                            month: result.content.externalPublicationDate != null ? new Date(result.content.externalPublicationDate).getMonth().toString()  : "1",
                            year: result.content.externalPublicationDate != null ? new Date(result.content.externalPublicationDate).getFullYear().toString()  : "2000",
                            time: result.content.externalPublicationDate != null ? new Date(result.content.externalPublicationDate).getTime().toString()  : "00:00",

                        }
                }

                setReleaseTimetable(request);
            }
        })

        getProfileVariationPointersService(specificationId).then((result) => {
            const response = result;
            if (response.status === 200) {
                setProfileVariationPointers(response.data as ProfileVariationPointer[]);
            }
        })

    }, [specificationId]);

    useEffectOnce(() => {
        getSpecificationSummaryService(specificationId).then((response) => {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    fundingLineStructure: true
                }
            })
            if (response.status === 200) {
                const result = response.data as SpecificationSummary;
                setSpecification(response.data);

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
                    })
                });
            }
        });
    });

    useEffect(() => {
        return () => setCanTimetableBeUpdated(true);
    }, [specification]);

    function confirmChanges() {
        setCanTimetableBeUpdated(false);
        let navDateAndTime2 = updateDateWithTime(navisionDate, navisionTime);
        let releaseDate2 = updateDateWithTime(releaseDate, releaseTime);
        saveReleaseTimetable = {
            specificationId: specification.id,
            statementDate: navDateAndTime2,
            fundingDate: releaseDate2
        };

        saveReleaseTimetableForSpecificationService(saveReleaseTimetable).then((response) => {
            if (response.status === 200) {
                const result = response.data as ReleaseTimetableViewModel;
                setReleaseTimetable(result);
            }
        })
    }

    function updateDateWithTime(date: Date, time: string) {
        let timeParts = time.match(/(\d+):(\d+)/);
        if (timeParts !== null) {
            let hours = timeParts[1];
            let minutes = timeParts[2];
            if (hours !== null && minutes !== null) {
                date.setHours(hours as unknown as number);
                date.setMinutes(minutes as unknown as number);
            }
        }
        return date;
    }

    function updateNavisionDate(e: Date) {
        setNavisionDate(e);
    }

    function updateReleaseDate(e: Date) {
        setReleaseDate(e);
    }

    function updateNavisionTime(e: string) {
        setNavisionTime(e);
    }

    function updateReleaseTime(e: string) {
        setReleaseTime(e);
    }

    function movePage(pageNumber: number) {
        populateAdditionalCalculations(specificationId, statusFilter, pageNumber, additionalCalculationsSearchTerm);
    }

    function updateFundingLineState(specificationId: string) {
        changeFundingLineStateService(specificationId).then((response) =>{
            if(response.status===200)
            {
setFundingLinePublishStatus(response.data as PublishStatus)
            }
        });
    }

    let fundingLineStatus = specification.approvalStatus;
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

    function populateAdditionalCalculations(specificationId: string, status: string, pageNumber: number, searchTerm: string) {
        getCalculationsService({specificationId: specificationId, status: status, pageNumber: pageNumber, searchTerm: additionalCalculationsSearchTerm, calculationType: "Additional"}).then((response) => {
            if (response.status === 200) {
                const result = response.data as CalculationSummary;
                setAdditionalCalculations(result)
            }
        })
    }

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"View specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specification.name}/>
            </Breadcrumbs>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-l">Specification Name</span>
                    <h2 className="govuk-heading-l">{specification.name}</h2>
                    <span className="govuk-caption-m">Funding period</span>
                    <h3 className="govuk-heading-m">{specification.fundingPeriod.name}</h3>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-m">Funding streams</span>
                    <h3 className="govuk-heading-m">{specification.fundingStreams[0].name}</h3>
                </div>
                <div className="govuk-grid-column-one-third">
                    <ul className="govuk-list">
                        <li>
                            <Link to={`/specifications/editspecification/${specificationId}`} className="govuk-link">Edit specification</Link>
                        </li>
                        <li>
                            <Link to={`/specifications/createadditionalcalculation/${specificationId}`} className="govuk-link">Create additional calculation</Link>
                        </li>
                        <li>
                            <Link to={`/Datasets/CreateDataset/${specificationId}`} className="govuk-link">Create dataset</Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <Details title={`What is ${specification.name}`} body={specification.description}/>
                    <Tabs initialTab="fundingline-structure">
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                            <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
                            <Tabs.Tab hidden={!releaseTimetableIsEnabled} label="release-timetable">Release timetable</Tabs.Tab>
                        </ul>
                        <Tabs.Panel label="fundingline-structure">
                            <section className="govuk-tabs__panel" id="fundingline-structure">
                                <LoadingStatus title={"Loading funding line structure"}
                                               hidden={!isLoading.fundingLineStructure}
                                               description={"Please wait whilst funding line structure is loading"}/>
                                <div className="govuk-grid-row" hidden={isLoading.fundingLineStructure}>
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Funding line structure</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <ApproveStatusButton id={specification.id}
                                                             status={fundingLineStatus}
                                                             callback={updateFundingLineState}/>
                                    </div>
                                    <div className="govuk-grid-column-two-thirds">
                                        <div className="govuk-form-group search-container">
                                            <label className="govuk-label">
                                                Search by calculation
                                            </label>
                                            <AutoComplete suggestions={fundingLineSearchSuggestions} callback={searchFundingLines}/>
                                        </div>
                                    </div>
                                </div>
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
                                                   name="event-name" type="text"/>
                                        </div>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <button className="govuk-button" type="submit">Search</button>
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
                                        No additional calculations available.
                                        <Link to={`/specifications/createadditionalcalculation/${specificationId}`}>
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
                        <Tabs.Panel label="datasets">
                            <section className="govuk-tabs__panel" id="datasets">
                                <LoadingStatus title={"Loading datasets"}
                                               hidden={!isLoading.datasets}
                                               description={"Please wait whilst datasets are loading"}/>
                                <div className="govuk-grid-row" hidden={isLoading.datasets}>
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Datasets</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <Link to={`/datasets/specificationrelationships?specificationId=${specificationId}`}
                                              id={"dataset-specification-relationship-button"}
                                              className="govuk-link govuk-button" data-module="govuk-button">
                                            Map data source file to data set</Link>
                                    </div>
                                </div>
                                <table className="govuk-table">
                                    <caption className="govuk-table__caption">Dataset and schemas</caption>
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header govuk-!-width-one-half">Dataset
                                        </th>
                                        <th scope="col" className="govuk-table__header govuk-!-width-one-half">Data
                                            schema
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    {datasets.content.map(ds =>
                                        <tr className="govuk-table__row" key={ds.id}>
                                            <td scope="row" className="govuk-table__cell">{ds.name}
                                                <div className="govuk-!-margin-top-2">
                                                    <details className="govuk-details govuk-!-margin-bottom-0"
                                                             data-module="govuk-details">
                                                        <summary className="govuk-details__summary">
                                                        <span
                                                            className="govuk-details__summary-text">Dataset Description</span>
                                                        </summary>
                                                        <div className="govuk-details__text">
                                                            {ds.relationshipDescription}
                                                        </div>
                                                    </details>
                                                </div>
                                            </td>
                                            <td className="govuk-table__cell">{ds.definition.name}</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel hidden={!releaseTimetableIsEnabled} label="release-timetable">
                            <section className="govuk-tabs__panel">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-full">
                                        <h2 className="govuk-heading-l">Release timetable</h2>
                                    </div>
                                </div>
                                <div className="govuk-form-group">
                                    <fieldset className="govuk-fieldset" role="group"
                                              aria-describedby="passport-issued-hint">
                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                            <h3 className="govuk-heading-m">Release date of funding to Navison?</h3>
                                        </legend>
                                        <span id="passport-issued-hint"
                                              className="govuk-hint">Set the date and time that the statement will be
                                            published externally for this funding stream. <br/>For example, 12 11 2019</span>
                                        <DateInput year={parseInt(releaseTimetable.navisionDate.year)}
                                                   month={parseInt(releaseTimetable.navisionDate.month)}
                                                   day={parseInt(releaseTimetable.navisionDate.day)}
                                                   callback={updateNavisionDate}/>
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={releaseTimetable.navisionDate.time}
                                               callback={updateNavisionTime}/>
                                </div>
                                <div className="govuk-form-group">
                                    <fieldset className="govuk-fieldset" role="group"
                                              aria-describedby="passport-issued-hint">
                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                            <h3 className="govuk-heading-m">Release date of statement to providers?</h3>
                                        </legend>
                                        <span id="passport-issued-hint"
                                              className="govuk-hint">Set the date and time that the statement will be published externally for this funding stream. <br/>For example, 12 11 2019</span>
                                        <DateInput year={parseInt(releaseTimetable.releaseDate.year)}
                                                   month={parseInt(releaseTimetable.releaseDate.month)}
                                                   day={parseInt(releaseTimetable.releaseDate.day)}
                                                   callback={updateReleaseDate}/>
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={releaseTimetable.releaseDate.time}
                                               callback={updateReleaseTime}/>
                                </div>
                                <div className="govuk-form-group">
                                    <button className="govuk-button" onClick={confirmChanges} disabled={!canTimetableBeUpdated}>Confirm changes</button>
                                </div>
                                {
                                    (profileVariationPointers != null
                                        && profileVariationPointers.length > 0) ?
                                        <div className="govuk-grid-row">
                                            <div className="govuk-grid-column-full">
                                                <h2 className="govuk-heading-l">Point of variation</h2>
                                                <p className="govuk-body">Set the installment from which a variation
                                                    should take effect.</p>
                                            </div>
                                            <div className="govuk-grid-column-two-thirds">
                                                {
                                                    profileVariationPointers.map((f, index) => {
                                                        return (
                                                            <dl key={index} className="govuk-summary-list">
                                                                <div className="govuk-summary-list__row">
                                                                    <dt className="govuk-summary-list__key">
                                                                        {f.fundingLineId}
                                                                    </dt>
                                                                    <dd className="govuk-summary-list__value">
                                                                        {f.typeValue} {f.year} <br/>
                                                                        Installment {f.occurrence}
                                                                    </dd>
                                                                    <dd className="govuk-summary-list__actions">
                                                                        <Link to={`/specifications/EditVariationPoints/${specificationId}`} className="govuk-link">
                                                                            Change<span className="govuk-visually-hidden"> {f.periodType}</span>
                                                                        </Link>
                                                                    </dd>
                                                                </div>
                                                            </dl>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                        : null
                                }
                            </section>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}

