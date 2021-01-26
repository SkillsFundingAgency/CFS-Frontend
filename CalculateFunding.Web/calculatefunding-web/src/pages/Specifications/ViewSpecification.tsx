import {RouteComponentProps, useHistory, useLocation} from "react-router";
import {Header} from "../../components/Header";
import * as React from "react";
import {useEffect, useState} from "react";
import {Footer} from "../../components/Footer";
import {Tabs} from "../../components/Tabs";
import {Details} from "../../components/Details";
import {
    getSpecificationsSelectedForFundingByPeriodAndStreamService,
    getSpecificationSummaryService
} from "../../services/specificationService";
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
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";
import {PermissionStatus} from "../../components/PermissionStatus";
import {refreshSpecificationFundingService} from "../../services/publishService";
import {approveAllCalculationsService, getCalculationSummaryBySpecificationId} from "../../services/calculationService";
import {cloneDeep} from "lodash";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {JobProgressNotificationBanner} from "../../components/Jobs/JobProgressNotificationBanner";

export interface ViewSpecificationRoute {
    specificationId: string;
}

export function ViewSpecification({match}: RouteComponentProps<ViewSpecificationRoute>) {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
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
        providerVersionId: "",
        dataDefinitionRelationshipIds: [],
        templateIds: {}
    };
    const [specification, setSpecification] = useState<SpecificationSummary>(initialSpecification);
    const specificationId = match.params.specificationId;

    const {errors, addErrorMessage, addError, clearErrorMessages} = useErrors();
    const [selectedForFundingSpecId, setSelectedForFundingSpecId] = useState<string | undefined>();
    const [isApprovingAllCalculations, setIsApprovingAllCalculations] = useState(false);
    const [displayApproveAllJobStatus, setDisplayApproveAllJobStatus] = useState<boolean>(false);
    const [isLoadingSelectedForFunding, setIsLoadingSelectedForFunding] = useState(true);
    const [initialTab, setInitialTab] = useState<string>("");
    const {canApproveAllCalculations, canChooseFunding, missingPermissions} =
        useSpecificationPermissions(specificationId,
            [SpecificationPermissions.ApproveAllCalculations, SpecificationPermissions.ChooseFunding]);
    const history = useHistory();
    const location = useLocation();

    const {hasJob, latestJob: approveAllCalculationsJob, isCheckingForJob} =
        useLatestSpecificationJobWithMonitoring(specificationId,
            [JobType.ApproveAllCalculationsJob],
            err => addError({error: err, description: "Error while checking for approve all calculation job"}));

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
                    const selectedSpecs = (await getSpecificationsSelectedForFundingByPeriodAndStreamService(spec.fundingPeriod.id, stream.id)).data;
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
                ConfirmationModal(<div className="govuk-row govuk-!-width-full">Are you sure you want to choose this specification?</div>,
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
                if (response.status === 200) {
                    history.push(`/Approvals/SpecificationFundingApproval/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${specificationId}`);
                } else {
                    addErrorMessage("A problem occurred while refreshing funding");
                }
            } catch (err) {
                addErrorMessage("A problem occurred while refreshing funding: " + err);
            }
        }
    }

    async function isUserAllowedToChooseSpecification(specificationId: string) {
        if (!canChooseFunding) {
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
        <Header location={Section.Specifications} />
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"} />
                <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
                <Breadcrumb name={specification.name} />
            </Breadcrumbs>

            <PermissionStatus requiredPermissions={missingPermissions} hidden={isApprovingAllCalculations} />

            <MultipleErrorSummary errors={errors} />

            <LoadingStatus title={"Checking calculations"}
                hidden={!isApprovingAllCalculations}
                subTitle={"Please wait, this could take several minutes"}
                description={"Please do not refresh the page, you will be redirected automatically"} />

            {(isCheckingForJob || hasJob) &&
                <div className="govuk-form-group">
                    <LoadingFieldStatus title={"Checking for running jobs..."} hidden={!isCheckingForJob} />
                    {hasJob && !isApprovingAllCalculations && <JobProgressNotificationBanner
                        job={approveAllCalculationsJob} displaySuccessfulJob={displayApproveAllJobStatus} />}
                </div>}

            <div className="govuk-grid-row" hidden={isApprovingAllCalculations}>
                <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-1">{specification.name}</h1>
                    <span className="govuk-caption-l">{specification.fundingStreams[0].name} for {specification.fundingPeriod.name}</span>
                    {!isLoadingSelectedForFunding && specification.isSelectedForFunding &&
                        <strong className="govuk-tag govuk-!-margin-bottom-5">Chosen for funding</strong>
                    }
                </div>
                <div className="govuk-grid-column-two-thirds">
                    <Details title={`What is ${specification.name}`} body={specification.description} />
                </div>
                <div className="govuk-grid-column-one-third">
                    <ul className="govuk-list">
                        <li>
                            <Link to={`/Specifications/EditSpecification/${specificationId}`} className="govuk-link">Edit specification</Link>
                        </li>
                        <li>
                            <Link to={`/Specifications/CreateAdditionalCalculation/${specificationId}`} className="govuk-link">Create additional
                                calculation</Link>
                        </li>
                        <li>
                            <button type="button" className="govuk-link" onClick={approveAllCalculations}>Approve all calculations</button>
                        </li>
                        <li>
                            <Link to={`/Datasets/CreateDataset/${specificationId}`} className="govuk-link">Create dataset</Link>
                        </li>
                        {isLoadingSelectedForFunding &&
                            <LoadingFieldStatus title={"checking funding status..."} />
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
            {initialTab.length > 0 && !isApprovingAllCalculations && specification.id.length > 0 &&
                <div className="govuk-main-wrapper  govuk-!-padding-top-2">
                    <div className="govuk-grid-row" data-testid="hi">
                        <Tabs initialTab={"fundingline-structure"}>
                            <ul className="govuk-tabs__list">
                                <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                                <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                                <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
                                <Tabs.Tab label="release-timetable">Release timetable</Tabs.Tab>
                                <Tabs.Tab hidden={!specification.isSelectedForFunding} data-testid={"variation-management-tab"} label="variation-management">Variation Management</Tabs.Tab>
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
                                    showApproveButton={true} />
                            </Tabs.Panel>
                            <Tabs.Panel label="additional-calculations">
                                <AdditionalCalculations
                                    specificationId={specificationId}
                                    addError={addErrorMessage}
                                    showCreateButton={true} />
                            </Tabs.Panel>
                            <Tabs.Panel label="datasets">
                                <Datasets specificationId={specificationId} />
                            </Tabs.Panel>
                            <Tabs.Panel label="release-timetable">
                                <section className="govuk-tabs__panel">
                                    <ReleaseTimetable specificationId={specificationId}
                                        addErrorMessage={addErrorMessage}
                                        clearErrorMessages={clearErrorMessages}
                                        errors={errors} />
                                </section>
                            </Tabs.Panel>
                            <Tabs.Panel hidden={!specification.isSelectedForFunding} label={"variation-management"}>
                                <VariationManagement specificationId={specificationId} />
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                </div>}
        </div>
        &nbsp;
        <Footer />
    </div>
}
