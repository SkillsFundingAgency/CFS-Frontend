import {RouteComponentProps, useHistory, useLocation} from "react-router";
import {Header} from "../../components/Header";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {Footer} from "../../components/Footer";
import {Tabs} from "../../components/Tabs";
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
import {
    CollapsibleSteps,
    setCollapsibleStepsAllStepsStatus
} from "../../components/CollapsibleSteps";
import {LoadingStatus} from "../../components/LoadingStatus";
import {FundingLineStep} from "../../components/fundingLineStructure/FundingLineStep";
import {AutoComplete} from "../../components/AutoComplete";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {BackToTop} from "../../components/BackToTop";
import {
    checkIfShouldOpenAllSteps,
    expandCalculationsByName,
    getDistinctOrderedFundingLineCalculations, setExpandStatusByFundingLineName, setInitialExpandedStatus,
    updateFundingLineExpandStatus
} from "../../components/fundingLineStructure/FundingLineStructure";
import {ProfileVariationPointer} from "../../types/Specifications/ProfileVariationPointer";
import {
    refreshFundingService,
} from "../../services/publishService";
import {getDatasetBySpecificationIdService} from "../../services/datasetService";
import {DatasetSummary} from "../../types/DatasetSummary";
import {getCalculationsService} from "../../services/calculationService";
import {getFundingLineStructureService} from "../../services/fundingStructuresService";
import {PublishStatus} from "../../types/PublishStatusModel";
import {FeatureFlagsState} from "../../states/FeatureFlagsState";
import {IStoreState} from "../../reducers/rootReducer";
import {useSelector} from "react-redux";
import {getUserPermissionsService} from "../../services/userService";
import {UserConfirmLeavePageModal} from "../../components/UserConfirmLeavePageModal";
import * as QueryString from "query-string";
import {NoData} from "../../components/NoData";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {ReleaseTimetable} from "./ReleaseTimetable";
import {AdditionalCalculations} from "../../components/Calculations/AdditionalCalculations";

export interface ViewSpecificationRoute {
    specificationId: string;
}

export function ViewSpecification({match}: RouteComponentProps<ViewSpecificationRoute>) {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
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

    const [fundingLines, setFundingLines] = useState<IFundingStructureItem[]>([]);
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLinesOriginalData, setFundingLinesOriginalData] = useState<IFundingStructureItem[]>([]);
    const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState<boolean>();
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState<boolean>();
    const [errors, setErrors] = useState<string[]>([]);
    const [fundingLineStructureError, setFundingLineStructureError] = useState<boolean>(false);
    const fundingLineStepReactRef = useRef(null);
    const nullReactRef = useRef(null);
    const [profileVariationPointers, setProfileVariationPointers] = useState<ProfileVariationPointer[]>([]);

    const [datasets, setDatasets] = useState<DatasetSummary>({
        content: [],
        statusCode: 0
    });

    const [fundingLinePublishStatus, setFundingLinePublishStatus] = useState<string>(PublishStatus.Draft.toString());
    const [selectedForFundingSpecId, setSelectedForFundingSpecId] = useState<string | undefined>();
    const [isLoadingFundingLineStructure, setIsLoadingFundingLineStructure] = useState(true);
    const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
    const [isLoadingSelectedForFunding, setIsLoadingSelectedForFunding] = useState(true);
    const [isLoadingVariationManagement, setIsLoadingVariationManagement] = useState(true);
    const [initialTab, setInitialTab] = useState<string>("");

    let history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const params = QueryString.parse(location.search);

        if (params.showDatasets) {
            setInitialTab("datasets");
        } else if (params.showVariationManagement) {
            setInitialTab("variation-management");
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
        if (!rerenderFundingLineSteps) {
            return
        }
        setFundingLineRenderInternalState(true);
        setRerenderFundingLineSteps(false);
    }, [rerenderFundingLineSteps]);

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

        getDatasetBySpecificationIdService(specificationId)
            .then((result) => {
                const response = result;
                if (response.status === 200) {
                    setDatasets(response.data as DatasetSummary);
                }
            });

        getProfileVariationPointersService(specificationId).then((result) => {
            const response = result;
            if (response.status === 200) {
                setProfileVariationPointers(response.data as ProfileVariationPointer[]);
            }
        }).finally(() => {
            setIsLoadingVariationManagement(false);
        });
    }, [specificationId]);

    const fetchData = async () => {
        try {
            const spec: SpecificationSummary = (await getSpecificationSummaryService(specificationId)).data;
            setSpecification(spec);

            if (spec.isSelectedForFunding) {
                setSelectedForFundingSpecId(spec.id);
            } else {
                await spec.fundingStreams.some(async (stream) => {
                    const selectedSpecs = (await getSpecificationsSelectedForFundingByPeriodAndStreamService(spec.fundingPeriod.id, stream.id)).data;
                    const hasAnySelectedForFunding = selectedSpecs !== null && selectedSpecs.length > 0;
                    if (hasAnySelectedForFunding) {
                        setSelectedForFundingSpecId(selectedSpecs[0].id);
                    }
                    return hasAnySelectedForFunding;
                });
            }

            //setCanTimetableBeUpdated(true);

            const fundingStructureItem = (await getFundingLineStructureService(spec.id, spec.fundingPeriod.id, spec.fundingStreams[0].id)).data;
            setInitialExpandedStatus(fundingStructureItem, false);
            setFundingLines(fundingStructureItem);
            setFundingLinePublishStatus(spec.approvalStatus as PublishStatus);
        } catch (err) {
            setFundingLineStructureError(true);
            setErrors(errors => [...errors, `A problem occurred while loading funding line structure: ${err.message}`]);
        } finally {
            setIsLoadingFundingLineStructure(false);
            setIsLoadingSelectedForFunding(false);
        }
    };

    const handleApproveFundingLineStructure = async (specificationId: string) => {
        const response = await approveFundingLineStructureService(specificationId);
        if (response.status === 200) {
            setFundingLinePublishStatus(PublishStatus.Approved);
        } else {
            setErrors(errors => [...errors, `Error whilst approving funding line structure: ${response.statusText} ${response.data}`]);
            setFundingLinePublishStatus(specification.approvalStatus as PublishStatus);
        }
    };

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

    async function chooseForFunding() {
        setErrors([]);
        try {
            const isAllowed: boolean = await isUserAllowedToChooseSpecification(specificationId);
            if (isAllowed) {
                UserConfirmLeavePageModal("Are you sure you want to choose this specification?",
                    refreshFunding, "Confirm", "Cancel");
            }
        } catch (e) {
            setErrors(errors => [...errors, "A problem occurred while getting user permissions"]);
        }
    }

    async function refreshFunding(confirm: boolean) {
        if (confirm) {
            try {
                const response = await refreshFundingService(specificationId);
                if (response.status === 200) {
                    history.push(`/Approvals/SpecificationFundingApproval/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${specificationId}`);
                } else {
                    setErrors(errors => [...errors, "A problem occurred while refreshing funding"]);
                }
            } catch (err) {
                setErrors(errors => [...errors, "A problem occurred while refreshing funding: " + err]);
            }
        }
    }

    async function isUserAllowedToChooseSpecification(specificationId: string) {
        const permissions = (await getUserPermissionsService(specificationId)).data;
        let errors: string[] = [];
        if (!permissions.canChooseFunding) {
            errors.push("You do not have permissions to choose this specification for funding");
        }
        if (specification.approvalStatus.toLowerCase() !== PublishStatus.Approved.toLowerCase()) {
            errors.push("Specification must be approved before the specification can be chosen for funding.");
        }
        try {
            const calc = (await getCalculationsService({
                specificationId: specificationId,
                status: "",
                pageNumber: 1,
                searchTerm: "",
                calculationType: "Template"
            })).data;
            if (calc.results.some(calc => calc.status.toLowerCase() !== PublishStatus.Approved.toLowerCase())) {
                errors.push("Template calculations must be approved before the specification can be chosen for funding.");
                setErrors(errors);
            }
        } catch (err) {
            errors.push("A problem occurred while choosing specification");
            setErrors(errors);
        }
        return errors.length === 0;
    }

    const resetErrors = () => {
        setFundingLineStructureError(false);
        setErrors([]);
    };

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"View specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specification.name}/>
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
                <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-4">
                    <span className="govuk-caption-l">Specification Name</span>
                    <h2 className="govuk-heading-l govuk-!-margin-bottom-2">{specification.name}</h2>
                    {!isLoadingSelectedForFunding && specification.isSelectedForFunding &&
                    <strong className="govuk-tag govuk-!-margin-bottom-5">Chosen for funding</strong>
                    }
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <div>
                        <span className="govuk-caption-m">Funding streams</span>
                        <h3 className="govuk-heading-m">{specification.fundingStreams[0].name}</h3>
                    </div>
                    <div>
                        <span className="govuk-caption-m">Funding period</span>
                        <h3 className="govuk-heading-m">{specification.fundingPeriod.name}</h3>
                    </div>
                    <Details title={`What is ${specification.name}`} body={specification.description}/>
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
                        {isLoadingSelectedForFunding &&
                        <LoadingFieldStatus title={"checking funding status..."}/>
                        }
                        {!isLoadingSelectedForFunding &&
                        <li>
                            {specification.isSelectedForFunding || selectedForFundingSpecId ?
                                <Link className="govuk-link govuk-link--no-visited-state"
                                      to={`/Approvals/SpecificationFundingApproval/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${selectedForFundingSpecId}`}>
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
            {initialTab.length > 0 && <div className="govuk-main-wrapper  govuk-!-padding-top-2">
                <div className="govuk-grid-row">
                    <Tabs initialTab={"fundingline-structure"}>
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                            <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
                            <Tabs.Tab label="release-timetable">Release timetable</Tabs.Tab>
                            <Tabs.Tab label="variation-management">Variation Management</Tabs.Tab>
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
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Funding line structure</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <ApproveStatusButton id={specification.id}
                                                             status={fundingLinePublishStatus}
                                                             callback={handleApproveFundingLineStructure}/>
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
                                                    hasChildren={f.fundingStructureItems != null}
                                                    callback={collapsibleStepsChanged}>
                                                    <FundingLineStep key={f.name.replace(" ", "") + index}
                                                                     showResults={false}
                                                                     expanded={fundingLinesExpandedStatus}
                                                                     fundingStructureItem={f}
                                                                     callback={collapsibleStepsChanged}/>
                                                </CollapsibleSteps>
                                            </li>
                                        })}
                                </ul>
                                <BackToTop id={"fundingline-structure"} hidden={fundingLines.length === 0}/>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="additional-calculations">
                            <AdditionalCalculations specificationId={specificationId} />
                        </Tabs.Panel>
                        <Tabs.Panel label="datasets">
                            <section className="govuk-tabs__panel" id="datasets">
                                <LoadingStatus title={"Loading datasets"}
                                               hidden={!isLoadingDatasets}
                                               description={"Please wait whilst datasets are loading"}/>
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
                        <Tabs.Panel label="release-timetable">
                            <section className="govuk-tabs__panel">
                                <ReleaseTimetable specificationId={specificationId}/>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label={"variation-management"}>
                            <section className="govuk-tabs__panel" id="variation-management">
                                <LoadingStatus title={"Loading variation management"}
                                               hidden={!isLoadingVariationManagement}
                                               description={"Please wait whilst variation management is loading"}/>
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-full">
                                        <NoData hidden={profileVariationPointers.length > 0 || isLoadingVariationManagement}/>
                                    </div>
                                    <div className="govuk-grid-column-full" hidden={profileVariationPointers.length === 0}>
                                        <h2 className="govuk-heading-l">Variation Management</h2>
                                        <p className="govuk-body">Set the installment from which a variation should take effect.</p>
                                    </div>
                                    <div className="govuk-grid-column-two-thirds">
                                        {
                                            profileVariationPointers.map((f, index) =>
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
                                                            <Link to={`/Specifications/EditVariationPoints/${specificationId}`}
                                                                  className="govuk-link">
                                                                Change<span className="govuk-visually-hidden"> {f.periodType}</span>
                                                            </Link>
                                                        </dd>
                                                    </div>
                                                </dl>
                                            )
                                        }
                                    </div>
                                </div>
                            </section>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </div>}
        </div>
        &nbsp;
        <Footer/>
    </div>
}
