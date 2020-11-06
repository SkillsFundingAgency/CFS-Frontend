import {RouteComponentProps, useHistory, useLocation} from "react-router";
import {Header} from "../../components/Header";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
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
import {
    refreshFundingService,
} from "../../services/publishService";
import {getCalculationSummaryBySpecificationId} from "../../services/calculationService";
import {PublishStatus} from "../../types/PublishStatusModel";
import {FeatureFlagsState} from "../../states/FeatureFlagsState";
import {IStoreState} from "../../reducers/rootReducer";
import {useSelector} from "react-redux";
import {getUserPermissionsService} from "../../services/userService";
import {UserConfirmLeavePageModal} from "../../components/UserConfirmLeavePageModal";
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
    let specificationId = match.params.specificationId;

    const {errors, addErrorMessage, clearErrorMessages} = useErrors();
    const [selectedForFundingSpecId, setSelectedForFundingSpecId] = useState<string | undefined>();
    const [isLoadingSelectedForFunding, setIsLoadingSelectedForFunding] = useState(true);
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

    async function chooseForFunding() {
        try {
            clearErrorMessages();
            const isAllowed: boolean = await isUserAllowedToChooseSpecification(specificationId);
            if (isAllowed) {
                UserConfirmLeavePageModal("Are you sure you want to choose this specification?",
                    refreshFunding, "Confirm", "Cancel");
            }
        } catch (e) {
            addErrorMessage("A problem occurred while getting user permissions");
        }
    }

    async function refreshFunding(confirm: boolean) {
        if (confirm) {
            try {
                const response = await refreshFundingService(specificationId);
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
        const permissions = (await getUserPermissionsService(specificationId)).data;
        if (!permissions.canChooseFunding) {
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
                .some(calc => calc.publishStatus !== PublishStatus.Approved)) {
                addErrorMessage("Template calculations must be approved before the specification can be chosen for funding.");
                return false;
            }
        } catch (err) {
            addErrorMessage("A problem occurred while choosing specification");
            return false;
        }
        return true;
    }

    return <div>
        <Header location={Section.Specifications} />
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"} />
                <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
                <Breadcrumb name={specification.name} />
            </Breadcrumbs>

            <MultipleErrorSummary errors={errors} />

            <div className="govuk-grid-row">
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
            {initialTab.length > 0 && <div className="govuk-main-wrapper  govuk-!-padding-top-2">
                <div className="govuk-grid-row">
                    <Tabs initialTab={"fundingline-structure"}>
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                            <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
                            <Tabs.Tab label="release-timetable">Release timetable</Tabs.Tab>
                            <Tabs.Tab hidden={!specification.isSelectedForFunding} data-testid={"variation-management-tab"} label="variation-management">Variation Management</Tabs.Tab>
                        </ul>
                        <Tabs.Panel label="fundingline-structure">
                            <FundingLineResults specificationId={specification.id} fundingStreamId={specification.fundingStreams[0].id} fundingPeriodId={specification.fundingPeriod.id} approvalStatus={specification.approvalStatus as PublishStatus} />
                        </Tabs.Panel>
                        <Tabs.Panel label="additional-calculations">
                            <AdditionalCalculations specificationId={specificationId} addError={addErrorMessage} />
                        </Tabs.Panel>
                        <Tabs.Panel label="datasets">
                            <Datasets specificationId={specificationId} />
                        </Tabs.Panel>
                        <Tabs.Panel label="release-timetable">
                            <section className="govuk-tabs__panel">
                                <ReleaseTimetable specificationId={specificationId}
                                    addErrorMessage={addErrorMessage} clearErrorMessages={clearErrorMessages} />
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
