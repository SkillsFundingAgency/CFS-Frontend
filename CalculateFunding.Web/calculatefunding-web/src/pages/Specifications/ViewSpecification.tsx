import {RouteComponentProps} from "react-router";
import {Header} from "../../components/Header";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {Footer} from "../../components/Footer";
import {Tabs} from "../../components/Tabs";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../states/AppState";
import {
    changeFundingLineState,
    confirmTimetableChanges,
    getAdditionalCalculations,
    getDatasetBySpecificationId,
    getFundingLineStructure, getProfileVariationPointers, getReleaseTimetable
} from "../../actions/ViewSpecificationsActions";
import {ViewSpecificationState} from "../../states/ViewSpecificationState";
import {SaveReleaseTimetableViewModel} from "../../types/SaveReleaseTimetableViewModel";
import {DateInput} from "../../components/DateInput";
import {TimeInput} from "../../components/TimeInput";
import Pagination from "../../components/Pagination";
import {Details} from "../../components/Details";
import {FundingStructureType, IFundingStructureItem} from "../../types/FundingStructureItem";
import {ApproveStatusButton} from "../../components/ApproveStatusButton";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getSpecificationSummaryService} from "../../services/specificationService";
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
import {
    expandCalculationsByName,
    getDistinctOrderedFundingLineCalculations, updateFundingLineExpandStatus
} from "../../components/fundingLineStructure/FundingLineStructure";

export interface ViewSpecificationRoute {
    specificationId: string;
}

export function ViewSpecification({match}: RouteComponentProps<ViewSpecificationRoute>) {
    const dispatch = useDispatch();
    const [additionalCalculationsSearchTerm,] = useState('');
    const [statusFilter] = useState("");
    const [navisionDate, setNavisionDate] = useState();
    const [releaseDate, setReleaseDate] = useState();
    const [navisionTime, setNavisionTime] = useState();
    const [releaseTime, setReleaseTime] = useState();
    const [canTimetableBeUpdated, setCanTimetableBeUpdated] = useState(true);
    const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
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
    let viewSpecification: ViewSpecificationState = useSelector((state: AppState) => state.viewSpecification);
    let specificationId = match.params.specificationId;
    let saveReleaseTimetable: SaveReleaseTimetableViewModel;
    const [isLoading, setIsLoading] = useState({
        fundingLineStructure: true,
        additionalCalculations: true,
        datasets:true
    });
    const [fundingLines, setFundingLines] = useState<IFundingStructureItem[]>([]);
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLinesOriginalData, setFundingLinesOriginalData] = useState<IFundingStructureItem[]>([]);
    const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState();
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState();
    const fundingLineStepReactRef = useRef(null);
    
    useEffect(() => {
        if (!fundingLineRenderInternalState) {
            return
        }
        if (fundingLineStepReactRef != null && fundingLineStepReactRef.current != null) {
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
        if (viewSpecification.additionalCalculations.currentPage !== 0) {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    additionalCalculations: false
                }
            });
        }
    }, [viewSpecification.additionalCalculations.results]);

    useEffect(() => {
        if (viewSpecification.fundingLineStructureResult.length !== 0) {
            if (fundingLinesOriginalData.length === 0) {
                setFundingLines(viewSpecification.fundingLineStructureResult);
                setFundingLineSearchSuggestions(getDistinctOrderedFundingLineCalculations(viewSpecification.fundingLineStructureResult));
                setFundingLinesOriginalData(JSON.parse(JSON.stringify(viewSpecification.fundingLineStructureResult)));
            }
        }
    }, [viewSpecification.fundingLineStructureResult]);

    useEffect(() => {
        if (viewSpecification.fundingLineStructureResult.length !== 0) {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    fundingLineStructure: false
                }
            });
        }
    }, [viewSpecification.fundingLineStructureResult]);

    useEffect(() => {
        if (viewSpecification.datasets.content.length === 0) {
            setIsLoading(prevState => {
                return {
                    ...prevState,
                    datasets: false
                }
            });
        }
    }, [viewSpecification.fundingLineStructureResult]);

    useEffect(() => {
        document.title = "Specification Results - Calculate funding";
        dispatch(getAdditionalCalculations(specificationId, statusFilter, 1, additionalCalculationsSearchTerm));
        dispatch(getDatasetBySpecificationId(specificationId));
        dispatch(getReleaseTimetable(specificationId));
        dispatch(getProfileVariationPointers(specificationId));
    }, [specificationId]);

    useEffectOnce(() => {
        const getSpecification = async () => {
            const specificationResult = await getSpecificationSummaryService(specificationId);
            setSpecification(specificationResult.data);
            return specificationResult;
        };
        getSpecification().then((result) => {
            if (result.status === 200) {
                const response = result.data as SpecificationSummary;
                dispatch(getFundingLineStructure(response.id, response.fundingPeriod.id, response.fundingStreams[0].id));
            }
            return true;
        });
    });

    useEffect(() => {
        return () => setCanTimetableBeUpdated(true);
    }, [viewSpecification]);

    function confirmChanges() {
        setCanTimetableBeUpdated(false);
        let navDateAndTime2 = updateDateWithTime(navisionDate, navisionTime);
        let releaseDate2 = updateDateWithTime(releaseDate, releaseTime);
        saveReleaseTimetable = {
            specificationId: specification.id,
            statementDate: navDateAndTime2,
            fundingDate: releaseDate2
        };
        dispatch(confirmTimetableChanges(saveReleaseTimetable));
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
        dispatch(getAdditionalCalculations(specificationId, statusFilter, pageNumber, additionalCalculationsSearchTerm));
    }

    function updateFundingLineState(specificationId: string) {
        dispatch(changeFundingLineState(specificationId));
    }

    let fundingLineStatus = specification.approvalStatus;
    if (viewSpecification.fundingLineStatusResult != null && viewSpecification.fundingLineStatusResult !== "")
        fundingLineStatus = viewSpecification.fundingLineStatusResult;

    function openCloseAllFundingLines()
    {
        setFundingLinesExpandedStatus(!fundingLinesExpandedStatus);
        updateFundingLineExpandStatus(fundingLines, !fundingLinesExpandedStatus);
    }

    function searchFundingLines(calculationName: string) {
        const fundingLinesCopy: IFundingStructureItem[] = JSON.parse(JSON.stringify(fundingLinesOriginalData));
        expandCalculationsByName(fundingLinesCopy, calculationName, fundingLineStepReactRef);
        setFundingLines(fundingLinesCopy);
        setRerenderFundingLineSteps(true);
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
                            <Tabs.Tab label="release-timetable">Release timetable</Tabs.Tab>
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
                                            return <li key={"collapsible-steps-top"+index} className="collapsible-step step-is-shown"><CollapsibleSteps
                                                customRef={f.customRef}
                                                key={"collapsible-steps"+ index}
                                                uniqueKey={index.toString()}
                                                title={FundingStructureType[f.type]}
                                                description={f.name}
                                                status={(f.calculationPublishStatus != null && f.calculationPublishStatus !== '') ?
                                                    f.calculationPublishStatus: ""}
                                                step={f.level.toString()}
                                                expanded={fundingLinesExpandedStatus || f.expanded}
                                                link={linkValue}
                                                hasChildren={f.fundingStructureItems != null}>
                                                    <FundingLineStep key={f.name.replace(" ", "") + index}
                                                                            expanded={fundingLinesExpandedStatus}
                                                                            fundingStructureItem={f} />
                                            </CollapsibleSteps>
                                            </li>
                                        })}
                                </ul>
                                <BackToTop id={"fundingline-structure"} hidden={viewSpecification.fundingLineStructureResult == null ||
                                viewSpecification.fundingLineStructureResult.length === 0}/>
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
                                           hidden={viewSpecification.additionalCalculations.totalResults === 0}>
                                            Showing {viewSpecification.additionalCalculations.startItemNumber} - {viewSpecification.additionalCalculations.endItemNumber}
                                            of {viewSpecification.additionalCalculations.totalResults}
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
                                    {viewSpecification.additionalCalculations.results.map((ac, index) =>
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
                                     hidden={viewSpecification.additionalCalculations.totalCount > 0}>
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
                                           hidden={viewSpecification.additionalCalculations.totalResults === 0}>
                                            Showing
                                            {viewSpecification.additionalCalculations.startItemNumber} - {viewSpecification.additionalCalculations.endItemNumber}
                                            of {viewSpecification.additionalCalculations.totalResults} calculations
                                        </p>
                                    </div>
                                    <Pagination currentPage={viewSpecification.additionalCalculations.currentPage}
                                                lastPage={viewSpecification.additionalCalculations.lastPage}
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
                                    {viewSpecification.datasets.content.map(ds =>
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
                        <Tabs.Panel label="release-timetable">
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
                                        <DateInput year={parseInt(viewSpecification.releaseTimetable.navisionDate.year)}
                                                   month={parseInt(viewSpecification.releaseTimetable.navisionDate.month)}
                                                   day={parseInt(viewSpecification.releaseTimetable.navisionDate.day)}
                                                   callback={updateNavisionDate}/>
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={viewSpecification.releaseTimetable.navisionDate.time}
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
                                        <DateInput year={parseInt(viewSpecification.releaseTimetable.releaseDate.year)}
                                                   month={parseInt(viewSpecification.releaseTimetable.releaseDate.month)}
                                                   day={parseInt(viewSpecification.releaseTimetable.releaseDate.day)}
                                                   callback={updateReleaseDate}/>
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={viewSpecification.releaseTimetable.releaseDate.time}
                                               callback={updateReleaseTime}/>
                                </div>
                                <div className="govuk-form-group">
                                    <button className="govuk-button" onClick={confirmChanges} disabled={!canTimetableBeUpdated}>Confirm changes</button>
                                </div>
                                {
                                    (viewSpecification.profileVariationPointerResult != null
                                        && viewSpecification.profileVariationPointerResult.length > 0) ?
                                        <div className="govuk-grid-row">
                                            <div className="govuk-grid-column-full">
                                                <h2 className="govuk-heading-l">Point of variation</h2>
                                                <p className="govuk-body">Set the installment from which a variation
                                                    should take effect.</p>
                                            </div>
                                            <div className="govuk-grid-column-two-thirds">
                                                {
                                                    viewSpecification.profileVariationPointerResult.map((f, index) => {
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

