import {RouteComponentProps, useHistory, useLocation} from "react-router";
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
import {
    approveFundingLineStructureService,
    getProfileVariationPointersService,
    getSpecificationsSelectedForFundingByPeriodAndStreamService,
    getSpecificationSummaryService
} from "../../services/specificationService";
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
    getDistinctOrderedFundingLineCalculations,
    updateFundingLineExpandStatus
} from "../../components/fundingLineStructure/FundingLineStructure";
import {ProfileVariationPointer} from "../../types/Specifications/ProfileVariationPointer";
import {
    getReleaseTimetableForSpecificationService,
    refreshFundingService,
    saveReleaseTimetableForSpecificationService
} from "../../services/publishService";
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
import {getUserPermissionsService} from "../../services/userService";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";
import {Specification} from "../../types/viewFundingTypes";
import {UserConfirmLeavePageModal} from "../../components/UserConfirmLeavePageModal";
import * as QueryString from "query-string";

export interface ViewSpecificationRoute {
    specificationId: string;
}

export function ViewSpecification({match}: RouteComponentProps<ViewSpecificationRoute>) {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
    const [additionalCalculationsSearchTerm,] = useState('');
    const [statusFilter] = useState("");
    const [navisionDate, setNavisionDate] = useState<Date>(new Date());
    const [releaseDate, setReleaseDate] = useState<Date>(new Date());
    const [navisionTime, setNavisionTime] = useState<string>("");
    const [releaseTime, setReleaseTime] = useState<string>("");
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
    const [fundingLines, setFundingLines] = useState<IFundingStructureItem[]>([]);
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLinesOriginalData, setFundingLinesOriginalData] = useState<IFundingStructureItem[]>([]);
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState<boolean>();
    const [errors, setErrors] = useState<string[]>([]);
    const [fundingLineStructureError, setFundingLineStructureError] = useState<boolean>(false);
    const fundingLineStepReactRef = useRef(null);
    const [profileVariationPointers, setProfileVariationPointers] = useState<ProfileVariationPointer[]>([]);
    const [releaseTimetable, setReleaseTimetable] = useState<ReleaseTimetableViewModel>({
        navisionDate: {
            time: "00:00",
            year: "2000",
            month: "1",
            day: "1"
        },
        releaseDate: {
            time: "00:00",
            year: "2000",
            month: "1",
            day: "1"
        }
    });
    const [datasets, setDatasets] = useState<DatasetSummary>({
        content: [],
        statusCode: 0
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
    const [fundingLinePublishStatus, setFundingLinePublishStatus] = useState<string>(PublishStatus.Draft.toString());
    const [selectedSpecificationForFunding, setSelectedSpecificationForFunding] = useState<Specification>({
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [{
            name: "",
            id: ""
        }],
        providerVersionId: "",
        description: "",
        isSelectedForFunding: false,
        approvalStatus: "",
        publishedResultsRefreshedAt: null,
        lastCalculationUpdatedAt: null,
        templateIds: {"": [""]},
        id: "",
        name: "",
        lastEditedDate: new Date(),
        dataDefinitionRelationshipIds: [],
    });
    const [isLoadingFundingLineStructure, setIsLoadingFundingLineStructure] = useState(true);
    const [isLoadingAdditionalCalculations, setIsLoadingAdditionalCalculations] = useState(true);
    const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
    const [isLoadingSelectedForFunding, setIsLoadingSelectedForFunding] = useState(true);
    const [initialTab, setInitialTab] = useState<string>("");

    let history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const params = QueryString.parse(location.search);
        if (params.showDatasets) {
            setInitialTab("datasets");
        } else {
            setInitialTab("fundingline-structure")
        }
    }, [location]);

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
        if (additionalCalculations.currentPage !== 0) {
            setIsLoadingAdditionalCalculations(false);
        }
    }, [additionalCalculations.results]);

    useEffect(() => {
        setFundingLineRenderInternalState(true);
        if (fundingLines.length !== 0) {
            if (fundingLinesOriginalData.length === 0) {
                setFundingLineSearchSuggestions(getDistinctOrderedFundingLineCalculations(fundingLines));
                setFundingLinesOriginalData(fundingLines);
            }
            setIsLoadingFundingLineStructure(false);
        }
        if (datasets.content.length === 0) {
            setIsLoadingDatasets(false);
        }
    }, [fundingLines]);

    useEffect(() => {
        setReleaseTimetableIsEnabled(featureFlagsState.releaseTimetableVisible);
    }, [featureFlagsState.releaseTimetableVisible]);

    useEffect(() => {
        document.title = "Specification Results - Calculate funding";
        resetErrors();

        fetchData();

        populateAdditionalCalculations(specificationId, statusFilter, 1, additionalCalculationsSearchTerm);

        getDatasetBySpecificationIdService(specificationId)
            .then((result) => {
                const response = result;
                if (response.status === 200) {
                    setDatasets(response.data as DatasetSummary);
                }
            });

        getReleaseTimetableForSpecificationService(specificationId)
            .then((response) => {
                if (response.status === 200) {
                    const result = response.data as ReleaseTimetableSummary;

                    let request: ReleaseTimetableViewModel = {
                        releaseDate:
                        {
                            day: result.content.earliestPaymentAvailableDate != null ? new Date(result.content.earliestPaymentAvailableDate).getDate().toString() : "1",
                            month: result.content.earliestPaymentAvailableDate != null ? new Date(result.content.earliestPaymentAvailableDate).getMonth().toString() : "1",
                            year: result.content.earliestPaymentAvailableDate != null ? new Date(result.content.earliestPaymentAvailableDate).getFullYear().toString() : "2000",
                            time: result.content.earliestPaymentAvailableDate != null ? new Date(result.content.earliestPaymentAvailableDate).getTime().toString() : "00:00",

                        },
                        navisionDate:
                        {
                            day: result.content.externalPublicationDate != null ? new Date(result.content.externalPublicationDate).getDate().toString() : "1",
                            month: result.content.externalPublicationDate != null ? new Date(result.content.externalPublicationDate).getMonth().toString() : "1",
                            year: result.content.externalPublicationDate != null ? new Date(result.content.externalPublicationDate).getFullYear().toString() : "2000",
                            time: result.content.externalPublicationDate != null ? new Date(result.content.externalPublicationDate).getTime().toString() : "00:00",

                        }
                    };

                    setReleaseTimetable(request);
                }
            });

        getProfileVariationPointersService(specificationId).then((result) => {
            const response = result;
            if (response.status === 200) {
                setProfileVariationPointers(response.data as ProfileVariationPointer[]);
            }
        })
    }, [specificationId]);

    useEffect(() => {
        if (specification != null && specification.fundingPeriod.id !== "" && specification.fundingStreams[0].id !== "") {
            getSpecificationsSelectedForFundingByPeriodAndStreamService(specification.fundingPeriod.id, specification.fundingStreams[0].id)
                .then((selectedSpecificationResponse) => {
                    setIsLoadingSelectedForFunding(false);
                    if (selectedSpecificationResponse.status === 200) {
                        const selectedSpecification = selectedSpecificationResponse.data as Specification[];
                        if (selectedSpecification.length > 0) {
                            setSelectedSpecificationForFunding(selectedSpecification[0]);
                        }
                    }
                }).finally(() => setIsLoadingSelectedForFunding(false));
        }
    }, [specification]);

    const resetErrors = () => {
        setFundingLineStructureError(false);
        setErrors([]);
    };

    const fetchData = async () => {
        try {
            const specificationSummaryResponse = await getSpecificationSummaryService(specificationId);
            const specificationSummary = specificationSummaryResponse.data as SpecificationSummary;
            setSpecification(specificationSummary);

            setCanTimetableBeUpdated(true);
            const fundingLineStructureResponse = await getFundingLineStructureService(specificationSummary.id,
                specificationSummary.fundingPeriod.id, specificationSummary.fundingStreams[0].id);
            const fundingStructureItem = fundingLineStructureResponse.data as IFundingStructureItem[];
            setFundingLines(fundingStructureItem);
            setFundingLinePublishStatus(specificationSummary.approvalStatus as PublishStatus);
        } catch (err) {
            setFundingLineStructureError(true);
            setErrors(errors => [...errors, `A problem occurred while loading funding line structure: ${err.message}`]);
        } finally {
            setIsLoadingFundingLineStructure(false);
        }
    };

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

    const handleApproveFundingLineStructure = async (specificationId: string) => {
        const response = await approveFundingLineStructureService(specificationId);
        if (response.status === 200) {
            setFundingLinePublishStatus(PublishStatus.Approved);
        } else {
            setErrors(errors => [...errors, `Error whilst approving funding line structure: ${response.statusText} ${response.data}`]);
            setFundingLinePublishStatus(specification.approvalStatus as PublishStatus);
        }
    };

    function openCloseAllFundingLines() {
        setFundingLinesExpandedStatus(!fundingLinesExpandedStatus);
        updateFundingLineExpandStatus(fundingLines, !fundingLinesExpandedStatus);
    }

    function searchFundingLines(calculationName: string) {
        const fundingLinesCopy: IFundingStructureItem[] = fundingLinesOriginalData as IFundingStructureItem[];
        expandCalculationsByName(fundingLinesCopy, calculationName, fundingLineStepReactRef);
        setFundingLines(fundingLinesCopy);
        setFundingLineRenderInternalState(true);
    }

    function populateAdditionalCalculations(specificationId: string, status: string, pageNumber: number, searchTerm: string) {
        getCalculationsService({
            specificationId: specificationId,
            status: status,
            pageNumber: pageNumber,
            searchTerm: additionalCalculationsSearchTerm,
            calculationType: "Additional"
        }).then((response) => {
            if (response.status === 200) {
                const result = response.data as CalculationSummary;
                setAdditionalCalculations(result)
            }
        }).finally(() => setIsLoadingAdditionalCalculations(false));
    }

    function chooseForFunding() {
        setErrors([]);
        getUserPermissionsService(specificationId).then((result) => {
            if (isUserAllowedToChooseSpecification(result.data as EffectiveSpecificationPermission)) {
                UserConfirmLeavePageModal("Are you sure you want to choose this specification?",
                    refreshFunding, "Confirm", "Cancel");
            }
        }).catch(() => setErrors(errors => [...errors, "A problem occurred while getting user permissions"]));
    }

    function refreshFunding(confirm: boolean) {
        if (confirm) {
            refreshFundingService(specificationId).then((response) => {
                if (response.status === 200) {
                    getSpecificationSummaryService(specificationId).then(() => {
                        history.push(`/ViewSpecificationResults/${specificationId}`);
                    });
                } else {
                    setErrors(errors => [...errors, "A problem occurred while choosing specification"]);
                }
            }).catch(() => {
                setErrors(errors => [...errors, "A problem occurred while choosing specification"]);
            });
        }
    }

    function isUserAllowedToChooseSpecification(specificationPermissions: EffectiveSpecificationPermission) {
        let errors: string[] = [];
        if (!specificationPermissions.canChooseFunding) {
            errors.push("You do not have permissions to choose this specification for funding");
        }
        if (specification.approvalStatus.toLowerCase() !== PublishStatus.Approved.toLowerCase()) {
            errors.push("Specification must be approved before the specification can be chosen for funding.");
        }
        getCalculationsService({
            specificationId: specificationId,
            status: "",
            pageNumber: 1,
            searchTerm: "",
            calculationType: "Template"
        }).then((response) => {
            if (response.status === 200) {
                const calculationSummary = response.data as CalculationSummary;
                const calculationsWithUnapprovedStatus = calculationSummary.results.filter(calc => calc.status.toLowerCase() !== PublishStatus.Approved.toLowerCase())
                if (calculationsWithUnapprovedStatus.length > 0) {
                    errors.push("Template calculations must be approved before the specification can be chosen for funding.");
                    setErrors(errors);
                    return false;
                }
            } else {
                errors.push("A problem occurred while choosing specification");
                setErrors(errors);
                return false;
            }
        }).catch(() => {
            errors.push("A problem occurred while choosing specification");
            setErrors(errors);
            return false;
        });

        return errors.length > 0;
    }

    return <div>
        <Header location={Section.Specifications} />
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"} />
                <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
                <Breadcrumb name={specification.name} />
            </Breadcrumbs>
            {errors.length > 0 &&
                <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}
                    data-module="govuk-error-summary">
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
            }
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-l">Specification Name</span>
                    <h2 className={`govuk-heading-l ${(!specification.isSelectedForFunding || isLoadingSelectedForFunding) ? "" : "govuk-!-margin-bottom-2"}`}>{specification.name}</h2>
                    {
                        (!(selectedSpecificationForFunding.id === specification.id) || isLoadingSelectedForFunding) ?
                            "" : <strong className="govuk-tag govuk-!-margin-bottom-5">Chosen for funding</strong>
                    }

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
                            <Link to={`/specifications/createadditionalcalculation/${specificationId}`} className="govuk-link">Create additional
                                calculation</Link>
                        </li>
                        <li>
                            <Link to={`/Datasets/CreateDataset/${specificationId}`} className="govuk-link">Create dataset</Link>
                        </li>
                        {!isLoadingSelectedForFunding &&
                        <li>
                            {specification.isSelectedForFunding ?
                                <Link className="govuk-link" 
                                      to={`/Approvals/FundingApprovalResults/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${specificationId}`}>
                                    View funding
                                </Link>
                                :
                                <button type="button" className="govuk-link" onClick={chooseForFunding}>Choose for funding</button>
                            }
                        </li>
                        }
                    </ul>
                </div>
            </div>
            {initialTab.length > 0 && <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <Details title={`What is ${specification.name}`} body={specification.description} />
                    <Tabs initialTab={initialTab}>
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                            <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
                            <Tabs.Tab hidden={!releaseTimetableIsEnabled} label="release-timetable">Release timetable</Tabs.Tab>
                        </ul>
                        <Tabs.Panel label="fundingline-structure">
                            <section className="govuk-tabs__panel" id="fundingline-structure">
                                <LoadingStatus title={"Loading funding line structure"}
                                    hidden={!isLoadingFundingLineStructure}
                                    description={"Please wait whilst funding line structure is loading"} />
                                <div className="govuk-grid-row" hidden={!fundingLineStructureError}>
                                    <div className="govuk-grid-column-two-thirds">
                                        <p className="govuk-error-message">An error has occurred. Please see above for details.</p>
                                    </div>
                                </div>
                                <div className="govuk-grid-row" hidden={isLoadingFundingLineStructure || fundingLineStructureError}>
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Funding line structure</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <ApproveStatusButton id={specification.id}
                                            status={fundingLinePublishStatus}
                                            callback={handleApproveFundingLineStructure} />
                                    </div>
                                    <div className="govuk-grid-column-two-thirds">
                                        <div className="govuk-form-group search-container">
                                            <label className="govuk-label">
                                                Search by calculation
                                            </label>
                                            <AutoComplete suggestions={fundingLineSearchSuggestions} callback={searchFundingLines} />
                                        </div>
                                    </div>
                                </div>
                                <div className="govuk-accordion__controls" hidden={isLoadingFundingLineStructure || fundingLineStructureError}>
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
                                            return <li key={"collapsible-steps-top" + index} className="collapsible-step step-is-shown">
                                                <CollapsibleSteps
                                                    customRef={f.customRef}
                                                    key={"collapsible-steps" + index}
                                                    uniqueKey={index.toString()}
                                                    title={FundingStructureType[f.type]}
                                                    description={f.name}
                                                    status={(f.calculationPublishStatus && f.calculationPublishStatus !== '') ? f.calculationPublishStatus : ""}
                                                    step={f.level.toString()}
                                                    expanded={fundingLinesExpandedStatus || f.expanded}
                                                    link={linkValue}
                                                    hasChildren={f.fundingStructureItems != null}>
                                                    <FundingLineStep key={f.name.replace(" ", "") + index}
                                                                     showResults={false}
                                                                     expanded={fundingLinesExpandedStatus}
                                                                     fundingStructureItem={f} />
                                                </CollapsibleSteps>
                                            </li>
                                        })}
                                </ul>
                                <BackToTop id={"fundingline-structure"} hidden={fundingLines.length === 0} />
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="additional-calculations">
                            <section className="govuk-tabs__panel" id="additional-calculations">
                                <LoadingStatus title={"Loading additional calculations"}
                                    hidden={!isLoadingAdditionalCalculations}
                                    description={"Please wait whilst additional calculations are loading"} />
                                <div className="govuk-grid-row" hidden={isLoadingAdditionalCalculations}>
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
                                                name="event-name" type="text" />
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
                                                    utc={false} /></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div className="govuk-warning-text"
                                    hidden={additionalCalculations.totalCount > 0}>
                                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                                    <strong className="govuk-warning-text__text">
                                        <span className="govuk-warning-text__assistive">Warning</span>
                                        No additional calculations available. &nbsp;
                                        <Link to={`/specifications/createadditionalcalculation/${specificationId}`}>
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
                                            callback={movePage} />
                                    </nav>}
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="datasets">
                            <section className="govuk-tabs__panel" id="datasets">
                                <LoadingStatus title={"Loading datasets"}
                                    hidden={!isLoadingDatasets}
                                    description={"Please wait whilst datasets are loading"} />
                                <div className="govuk-grid-row" hidden={isLoadingDatasets}>
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Datasets</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <Link to={`/Datasets/DataRelationships/${specificationId}`}
                                            id={"dataset-specification-relationship-button"}
                                            className="govuk-link govuk-button" data-module="govuk-button">
                                            Map data source file to data set</Link>
                                    </div>
                                </div>
                                <table className="govuk-table">
                                    <caption className="govuk-table__caption">Dataset and schemas</caption>
                                    <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th scope="col" className="govuk-table__header govuk-!-width-one-half">Dataset</th>
                                            <th scope="col" className="govuk-table__header govuk-!-width-one-half">Data schema</th>
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
                                        <span id="passport-issued-hint" className="govuk-hint">
                                            Set the date and time that the statement will be published externally for this funding stream. <br />
                                            For example, 12 11 2019</span>
                                        <DateInput year={parseInt(releaseTimetable.navisionDate.year)}
                                            month={parseInt(releaseTimetable.navisionDate.month)}
                                            day={parseInt(releaseTimetable.navisionDate.day)}
                                            callback={updateNavisionDate} />
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={releaseTimetable.navisionDate.time}
                                        callback={updateNavisionTime} />
                                </div>
                                <div className="govuk-form-group">
                                    <fieldset className="govuk-fieldset" role="group" aria-describedby="passport-issued-hint">
                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                            <h3 className="govuk-heading-m">Release date of statement to providers?</h3>
                                        </legend>
                                        <span id="passport-issued-hint" className="govuk-hint">
                                            Set the date and time that the statement will be published externally for this funding stream. <br />
                                            For example, 12 11 2019</span>
                                        <DateInput year={parseInt(releaseTimetable.releaseDate.year)}
                                            month={parseInt(releaseTimetable.releaseDate.month)}
                                            day={parseInt(releaseTimetable.releaseDate.day)}
                                            callback={updateReleaseDate} />
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={releaseTimetable.releaseDate.time} callback={updateReleaseTime} />
                                </div>
                                <div className="govuk-form-group">
                                    <button className="govuk-button" onClick={confirmChanges} disabled={!canTimetableBeUpdated}>Confirm changes
                                    </button>
                                </div>
                                {
                                    (profileVariationPointers != null && profileVariationPointers.length > 0) ?
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
                                                                        {f.typeValue} {f.year} <br />
                                                                        Installment {f.occurrence}
                                                                    </dd>
                                                                    <dd className="govuk-summary-list__actions">
                                                                        <Link to={`/specifications/EditVariationPoints/${specificationId}`}
                                                                            className="govuk-link">
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
            </div>}
        </div>
        &nbsp;
        <Footer />
    </div>
}

