import {RouteComponentProps, useHistory, useLocation} from "react-router";
import {Header} from "../../components/Header";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import {Footer} from "../../components/Footer";
import {Tabs} from "../../components/Tabs";
import {Details} from "../../components/Details";
import {getSpecificationsSelectedForFundingByPeriodAndStreamService, getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {Section} from "../../types/Sections";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PublishStatus} from "../../types/PublishStatusModel";
import {FeatureFlagsState} from "../../states/FeatureFlagsState";
import {IStoreState} from "../../reducers/rootReducer";
import {useSelector} from "react-redux";
import {ConfirmationModal} from "../../components/ConfirmationModal";
import * as QueryString from "query-string";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {ReleaseTimetable} from "./ReleaseTimetable";
import {AdditionalCalculations} from "../../components/Calculations/AdditionalCalculations";
import {Datasets} from "../../components/Specifications/Datasets";
import {VariationManagement} from "../../components/Specifications/VariationManagement";
import {FundingLineResults} from "../../components/fundingLineStructure/FundingLineResults";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useErrors} from "../../hooks/useErrors";
import {CalculationType} from "../../types/CalculationSearchResponse";
import {CalculationSummary} from "../../types/CalculationDetails";
import {LoadingStatus} from "../../components/LoadingStatus";
import {useSpecificationPermissions} from "../../hooks/Permissions/useSpecificationPermissions";
import {PermissionStatus} from "../../components/PermissionStatus";
import {refreshSpecificationFundingService} from "../../services/publishService";
import {approveAllCalculationsService, getCalculationSummaryBySpecificationId} from "../../services/calculationService";
import {cloneDeep} from "lodash";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {JobProgressNotificationBanner} from "../../components/Jobs/JobProgressNotificationBanner";
import {RunningStatus} from "../../types/RunningStatus";
import {Permission} from "../../types/Permission";
import {Badge} from "../../components/Badge";
import {CalculationErrors} from "../../components/Calculations/CalculationErrors";
import {useCalculationErrors} from "../../hooks/Calculations/useCalculationErrors";
import {useFundingConfiguration} from "../../hooks/useFundingConfiguration";

export interface ViewSpecificationRoute {
    specificationId: string;
}

export function ViewSpecification({match}: RouteComponentProps<ViewSpecificationRoute>) {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
    const [releaseTimetableIsEnabled, setReleaseTimetableIsEnabled] = useState(false);
    const initialSpecification: SpecificationSummary = {
        coreProviderVersionUpdates: undefined,
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
        providerVersionId: "",
        dataDefinitionRelationshipIds: [],
        templateIds: {}
    };
    const [specification, setSpecification] = useState<SpecificationSummary>(initialSpecification);
    const specificationId = match.params.specificationId;

    const {errors, addErrorMessage, addError, clearErrorMessages} = useErrors();
    const [selectedForFundingSpecId, setSelectedForFundingSpecId] = useState<string | undefined>();
    const [isApprovingAllCalculations, setIsApprovingAllCalculations] = useState(false);
    const [isRefreshFundingInProgress, setIsRefreshFundingInProgress] = useState(false);
    const [displayApproveAllJobStatus, setDisplayApproveAllJobStatus] = useState<boolean>(false);
    const [isLoadingSelectedForFunding, setIsLoadingSelectedForFunding] = useState(true);
    const [initialTab, setInitialTab] = useState<string>("");
    const {missingPermissions, hasPermission, isPermissionsFetched} =
        useSpecificationPermissions(match.params.specificationId, [Permission.CanApproveSpecification, Permission.CanChooseFunding, Permission.CanApproveAllCalculations]);
    const canApproveAllCalculations: boolean = useMemo(() => 
        (hasPermission !== undefined && hasPermission(Permission.CanApproveAllCalculations)) === true, [isPermissionsFetched]);
    const canApproveSpecifications: boolean = useMemo(() => 
        hasPermission(Permission.CanApproveSpecification) === true, [isPermissionsFetched]);
    const canChooseForFunding: boolean = useMemo(() => 
        hasPermission(Permission.CanChooseFunding) === true, [isPermissionsFetched]);
    const [initiatedRefreshFundingJobId, setInitiatedRefreshFundingJobId] = useState<string>("");
    const history = useHistory();
    const location = useLocation();

    const {hasJob, latestJob: approveAllCalculationsJob, isCheckingForJob} =
        useLatestSpecificationJobWithMonitoring(specificationId,
            [JobType.ApproveAllCalculationsJob],
            err => addError({error: err, description: "Error while checking for approve all calculation job"}));

    const {latestJob: refreshFundingJob} =
        useLatestSpecificationJobWithMonitoring(specificationId,
            [JobType.RefreshFundingJob],
            err => addError({error: err, description: "Error while checking for refresh funding job"}));

    const {latestJob: converterWizardJob, isCheckingForJob: isCheckingForConverterWizardJob, hasJob: hasConverterWizardJob} =
        useLatestSpecificationJobWithMonitoring(specificationId,
            [JobType.RunConverterDatasetMergeJob],
            err => addError({error: err, description: "Error while checking for converter wizard running jobs"}));

    const {
        calculationErrors,
        isLoadingCalculationErrors,
        calculationErrorCount
    } = useCalculationErrors(specificationId, err => {addError({error:err, description: "Error while checking for calculation errors"})})

    const {fundingConfiguration} =
        useFundingConfiguration(specification.fundingStreams[0].id, specification.fundingPeriod.id,
            err => addError({error: err, description: `Error while loading funding configuration`}));

    useEffect(() => {
        if (!refreshFundingJob || refreshFundingJob.jobId !== initiatedRefreshFundingJobId) return;
        clearErrorMessages();
        if (refreshFundingJob.runningStatus === RunningStatus.Completed) {
            if (refreshFundingJob.isSuccessful) {
                setIsRefreshFundingInProgress(false);
                history.push(`/Approvals/SpecificationFundingApproval/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${specificationId}`);
            } else {
                setIsRefreshFundingInProgress(false);
                addError({error: "Error while choosing specification for funding"});
            }
        }
    }, [refreshFundingJob]);

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
        setReleaseTimetableIsEnabled(featureFlagsState.releaseTimetableVisible);
    }, [featureFlagsState.releaseTimetableVisible]);

    useEffect(() => {
        document.title = "Specification Results - Calculate funding";
        clearErrorMessages();
        fetchData();
    }, [specificationId]);

    const fetchData = async () => {
        try {
            const spec: SpecificationSummary = (await getSpecificationSummaryService(specificationId)).data;
            setSpecification(spec);

            if (spec.isSelectedForFunding) {
                setSelectedForFundingSpecId(spec.id);
            } else {
                await spec.fundingStreams.some(async (stream) => {
                    const result = await getSpecificationsSelectedForFundingByPeriodAndStreamService(spec.fundingPeriod.id, stream.id);
                    const selectedSpecs = result.data;
                    const hasAnySelectedForFunding = selectedSpecs !== null && selectedSpecs.length > 0;
                    if (hasAnySelectedForFunding) {
                        setSelectedForFundingSpecId(selectedSpecs[0].id);
                    }
                    return hasAnySelectedForFunding;
                });
            }
        } finally {
            setIsLoadingSelectedForFunding(false);
        }
    };

    async function approveAllCalculations() {
        try {
            clearErrorMessages();
            const isAllowed: boolean = await isUserAllowedToApproveAllCalculations();
            if (isAllowed) {
                ConfirmationModal("Are you sure you want to approve all calculations?",
                    submitApproveAllCalculations, "Confirm", "Cancel");
            }
        } catch (e) {
            addErrorMessage("A problem occurred while getting user permissions");
        }
    }

    async function submitApproveAllCalculations(confirm: boolean) {
        if (confirm) {
            setDisplayApproveAllJobStatus(true);
            setIsApprovingAllCalculations(true);
            try {
                const response = await approveAllCalculationsService(specificationId);
                if (response.status !== 200) {
                    addErrorMessage("A problem occurred while approving all calculations");
                }
            } catch (err) {
                addErrorMessage("A problem occurred while approving all calculations: " + err);
            } finally {
                setIsApprovingAllCalculations(false);
            }
        }
    }

    async function chooseForFunding() {
        try {
            clearErrorMessages();
            const isAllowed: boolean = await isUserAllowedToChooseSpecification(specificationId);
            if (isAllowed) {
                ConfirmationModal(<div className="govuk-row govuk-!-width-full">Are you sure you want to choose this
                        specification?</div>,
                    refreshFunding, "Confirm", "Cancel");
            }
        } catch (e) {
            addErrorMessage("A problem occurred while getting user permissions");
        }
    }

    async function refreshFunding(confirm: boolean) {
        if (confirm) {
            try {
                const response = await refreshSpecificationFundingService(specificationId);
                const jobId = response.data as string;
                if (jobId != null && jobId !== "") {
                    setInitiatedRefreshFundingJobId(jobId);
                    setIsRefreshFundingInProgress(true);
                } else {
                    addErrorMessage("A problem occurred while refreshing funding");
                    setIsRefreshFundingInProgress(false);
                }
            } catch (err) {
                addErrorMessage("A problem occurred while refreshing funding: " + err);
                setIsRefreshFundingInProgress(false);
            }
        }
    }

    async function isUserAllowedToChooseSpecification(specificationId: string) {
        if (!canChooseForFunding) {
            addErrorMessage("You do not have permissions to choose this specification for funding");
            return false;
        }
        if (specification.approvalStatus !== PublishStatus.Approved) {
            addErrorMessage("Specification must be approved before the specification can be chosen for funding.");
            return false;
        }
        try {
            const calcs: CalculationSummary[] = (await getCalculationSummaryBySpecificationId(specificationId)).data;
            if (calcs.filter(calc => calc.calculationType === CalculationType.Template)
                .some(calc => calc.status !== PublishStatus.Approved)) {
                addErrorMessage("Template calculations must be approved before the specification can be chosen for funding.");
                return false;
            }
        } catch (err) {
            addErrorMessage("A problem occurred while choosing specification");
            return false;
        }
        return true;
    }

    async function isUserAllowedToApproveAllCalculations() {
        if (!canApproveAllCalculations) {
            addErrorMessage("You don't have permission to approve calculations");
            return false;
        }
        try {
            const calcs: CalculationSummary[] = (await getCalculationSummaryBySpecificationId(specificationId)).data;
            if (!calcs.some(calc => calc.calculationType === CalculationType.Template
                && calc.status !== PublishStatus.Approved)) {
                addErrorMessage("All calculations have already been approved");
                return false;
            }
        } catch (err) {
            addErrorMessage("Approve all calculations failed - try again");
            return false;
        }
        return true;
    }

    const setApprovalStatusToApproved = () => {
        const updatedSpecification = cloneDeep(specification);
        updatedSpecification.approvalStatus = PublishStatus.Approved;
        setSpecification(updatedSpecification);
    }

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"View specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specification.name}/>
            </Breadcrumbs>

            <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />

            <MultipleErrorSummary errors={errors}/>

            <LoadingStatus title={"Checking calculations"}
                           hidden={!isApprovingAllCalculations && !isRefreshFundingInProgress}
                           subTitle={"Please wait, this could take several minutes"}
                           description={"Please do not refresh the page, you will be redirected automatically"}/>

            {(isCheckingForJob || hasJob || isCheckingForConverterWizardJob || hasConverterWizardJob) &&
            <div className="govuk-form-group">
                <LoadingFieldStatus title={"Checking for running jobs..."} hidden={!isCheckingForJob}/>
                {hasJob && !isApprovingAllCalculations && <JobProgressNotificationBanner
                    job={approveAllCalculationsJob} displaySuccessfulJob={displayApproveAllJobStatus}/>}
                {hasConverterWizardJob && <JobProgressNotificationBanner job={converterWizardJob} />}
            </div>}

            <div className="govuk-grid-row" hidden={isApprovingAllCalculations || isRefreshFundingInProgress}>
                <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-1">{specification.name}</h1>
                    <span
                        className="govuk-caption-l">{specification.fundingStreams[0].name} for {specification.fundingPeriod.name}</span>
                    {!isLoadingSelectedForFunding && specification.isSelectedForFunding &&
                    <strong className="govuk-tag govuk-!-margin-bottom-5">Chosen for funding</strong>
                    }
                    {fundingConfiguration && fundingConfiguration.enableConverterDataMerge &&
                    <p className="govuk-body govuk-!-margin-top-2">
                        <strong className="govuk-tag govuk-tag--green">In year opener enabled</strong>
                    </p>
                    }
                </div>
                <div className="govuk-grid-column-two-thirds">
                    <Details title={`What is ${specification.name}`} body={specification.description}/>
                </div>
                <div className="govuk-grid-column-one-third">
                    <ul className="govuk-list">
                        <li>
                            <Link to={`/Specifications/EditSpecification/${specificationId}`} className="govuk-link">Edit
                                specification</Link>
                        </li>

                        <li>
                            <button type="button" className="govuk-link" onClick={approveAllCalculations}
                                    data-testid="approve-calculations">Approve all calculations
                            </button>
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
                                <button type="button" className="govuk-link" onClick={chooseForFunding}
                                        data-testid="choose-for-funding">Choose for funding</button>
                            }
                        </li>
                        }
                    </ul>
                </div>
            </div>
            {initialTab.length > 0 && !isApprovingAllCalculations && specification.id.length > 0 && !isRefreshFundingInProgress &&
            <div className="govuk-main-wrapper  govuk-!-padding-top-2">
                <div className="govuk-grid-row" data-testid="hi">
                    <Tabs initialTab={"fundingline-structure"}>
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                            {isLoadingCalculationErrors || calculationErrorCount === 0 ? "" : <Tabs.Tab label="calculation-errors">Calculations errors<Badge errorCount={calculationErrorCount} /></Tabs.Tab>}
                            <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
                            <Tabs.Tab label="release-timetable">Release timetable</Tabs.Tab>
                            <Tabs.Tab hidden={!specification.isSelectedForFunding} data-testid={"variations-tab"}
                                      label="variations">Variations</Tabs.Tab>
                        </ul>
                        <Tabs.Panel label="fundingline-structure">
                            <FundingLineResults
                                specificationId={specification.id}
                                fundingStreamId={specification.fundingStreams[0].id}
                                fundingPeriodId={specification.fundingPeriod.id}
                                status={specification.approvalStatus as PublishStatus}
                                addError={addError}
                                clearErrorMessages={clearErrorMessages}
                                setStatusToApproved={setApprovalStatusToApproved}
                                refreshFundingLines={approveAllCalculationsJob?.isSuccessful}
                                showApproveButton={true}
                                useCalcEngine={true}
                                jobTypes={[JobType.AssignTemplateCalculationsJob]}/>
                        </Tabs.Panel>
                        <Tabs.Panel label="additional-calculations">
                            <AdditionalCalculations
                                specificationId={specificationId}
                                addError={addErrorMessage}
                                showCreateButton={true}/>
                        </Tabs.Panel>
                        <Tabs.Panel label="calculation-errors">
                            <CalculationErrors calculationErrors={calculationErrors}/>
                        </Tabs.Panel>
                        <Tabs.Panel label="datasets">
                            <Datasets specificationId={specificationId}/>
                        </Tabs.Panel>
                        <Tabs.Panel label="release-timetable">
                            <section className="govuk-tabs__panel">
                                <ReleaseTimetable specificationId={specificationId}
                                                  addErrorMessage={addErrorMessage}
                                                  clearErrorMessages={clearErrorMessages}
                                                  errors={errors}/>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel hidden={!specification.isSelectedForFunding} label={"variations"}>
                            <VariationManagement
                                specificationId={specificationId}
                                addError={addError}
                                clearErrorMessages={clearErrorMessages}/>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </div>}
        </div>
        &nbsp;
        <Footer/>
    </div>
}
