import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {UpdateAdditionalCalculationViewModel} from "../../types/Calculations/CreateAdditonalCalculationViewModel";
import {
    approveCalculationService,
    compileCalculationPreviewService,
    getCalculationByIdService,
    getIsUserAllowedToApproveCalculationService,
    updateAdditionalCalculationService,
    getCalculationCircularDependencies
} from "../../services/calculationService";
import {Calculation} from "../../types/CalculationSummary";
import {CompilerOutputViewModel, CompileErrorSeverity} from "../../types/Calculations/CalculationCompilePreviewResponse";
import {GdsMonacoEditor} from "../../components/GdsMonacoEditor";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PublishStatus, PublishStatusModel} from "../../types/PublishStatusModel";
import {DateFormatter} from "../../components/DateFormatter";
import {CalculationResultsLink} from "../../components/Calculations/CalculationResultsLink";
import {useConfirmLeavePage} from "../../hooks/useConfirmLeavePage";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {Footer} from "../../components/Footer";
import {CircularReferenceErrorSummary} from "../../components/CircularReferenceErrorSummary";
import {CircularReferenceError} from "../../types/Calculations/CircularReferenceError";
import {CompilationErrorMessageList} from "../../components/Calculations/CompilationErrorMessageList";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {ValueType} from "../../types/ValueType";

export interface EditTemplateCalculationProps {
    excludeMonacoEditor?: boolean
}

export interface EditTemplateCalculationRouteProps {
    calculationId: string;
}

export function EditTemplateCalculation({match, excludeMonacoEditor}:
                                            RouteComponentProps<EditTemplateCalculationRouteProps> & EditTemplateCalculationProps) {
    const [renderMonacoEditor] = useState<boolean>(!excludeMonacoEditor);
    const [specificationId, setSpecificationId] = useState<string>("");
    const calculationId = match.params.calculationId;
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>({
        id: "",
        name: "",
        description: "",
        fundingPeriod: {
            name: "",
            id: ""
        },
        providerVersionId: "",
        approvalStatus: "",
        isSelectedForFunding: false,
        fundingStreams: [],
        dataDefinitionRelationshipIds: [],
        templateIds: {[""]: ""}
    });
    const [templateCalculationName, setTemplateCalculationName] = useState<string>("");
    const [templateCalculationFundingStreamId, setTemplateCalculationFundingStreamId] = useState<string>("");
    const [templateCalculationType, setTemplateCalculationType] = useState<ValueType>(ValueType.Percentage);
    const [templateCalculationSourceCode, setTemplateCalculationSourceCode] = useState<string>("");
    const [initialSourceCode, setInitialSourceCode] = useState<string>("");
    const [templateCalculationStatus, setTemplateCalculationStatus] = useState<PublishStatus>();
    const [templateCalculationLastUpdated, setTemplateCalculationLastUpdated] = useState<Date>(new Date());
    const initialBuildSuccess = {
        buildSuccess: false,
        compileRun: false,
        previewResponse: {
            compilerOutput: {
                compilerMessages: [{
                    location: {
                        endChar: 0,
                        endLine: 0,
                        owner: {
                            id: "",
                            name: ""
                        },
                        startChar: 0,
                        startLine: 0
                    },
                    message: "",
                    severity: CompileErrorSeverity.Hidden
                }],
                sourceFiles: [],
                success: false
            }
        }
    };
    const [calculationBuild, setCalculationBuild] = useState<CompilerOutputViewModel>(initialBuildSuccess);
    const [calculationError, setCalculationError] = useState<string>();
    const [formValidation, setFormValid] = useState({formValid: false, formSubmitted: false});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isLoadingCircularDependencies, setIsLoadingCircularDependencies] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [circularReferenceErrors, setCircularReferenceErrors] = useState<CircularReferenceError[]>([]);
    const [isBuildingCalculationCode, setIsBuildingCalculationCode] = useState<boolean>(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [canApproveCalculation, setCanApproveCalculation] = useState<boolean>(false);
    let history = useHistory();

    useConfirmLeavePage(!isSaving && isDirty);

    useEffectOnce(() => {
        const getTemplateCalculation = async (calcId: string) => {
            try {
                setCalculationError("");
                setCircularReferenceErrors([]);
                setIsLoading(true);
                const result = await getCalculationByIdService(calcId);
                const calc = result.data as Calculation;
                setTemplateCalculationSourceCode(calc.sourceCode);
                setTemplateCalculationName(calc.name);
                setTemplateCalculationType(calc.valueType);
                setTemplateCalculationStatus(calc.publishStatus);
                setTemplateCalculationLastUpdated(new Date(calc.lastUpdated));
                setInitialSourceCode(calc.sourceCode);
                setTemplateCalculationFundingStreamId(calc.fundingStreamId);

                const specSummaryResult = await getSpecificationSummaryService(calc.specificationId);
                const spec = specSummaryResult.data as SpecificationSummary;
                setSpecificationSummary(spec);
                setSpecificationId(spec.id);

                setIsLoadingCircularDependencies(true);
                getCalculationCircularDependencies(spec.id)
                    .then(response => {
                            setIsLoadingCircularDependencies(false);
                            const circularDependencies = response.data as CircularReferenceError[];
                            if (circularDependencies.length > 0) {
                                setCircularReferenceErrors(circularDependencies);
                                setIsBuildingCalculationCode(false);
                                window.scrollTo(0, 0);
                            }
                        }
                    ).catch(err => !calculationError || calculationError.length === 0 ?
                            setCalculationError(`Error whilst checking for circular dependencies: ${err}`) : null);
            } catch {
                setCalculationError("There is a problem loading this calculation. Please try again.");
            } finally {
                setIsLoading(false);
                setIsDirty(false);
            }
        };

        const checkCanApproveCalculation = async (calcId: string) => {
            const result = await getIsUserAllowedToApproveCalculationService(calcId);
            setCanApproveCalculation(result.data as boolean);
        };

        getTemplateCalculation(calculationId);

        checkCanApproveCalculation(calculationId);
    });

    function submitTemplateCalculation() {
        if (templateCalculationName === "" || templateCalculationSourceCode === "" || !calculationBuild.buildSuccess) {
            setFormValid({formSubmitted: true, formValid: false});
            return;
        }

        if (!(templateCalculationName !== "" && templateCalculationSourceCode !== "" && calculationBuild.buildSuccess && calculationBuild.compileRun)) {
            setFormValid({formSubmitted: true, formValid: false});
            return;
        }

        setFormValid({formSubmitted: true, formValid: true});

        setIsLoadingUpdate(true);
        setIsSaving(true);

        let updateAdditionalCalculationViewModel: UpdateAdditionalCalculationViewModel = {
            calculationName: templateCalculationName,
            valueType: templateCalculationType,
            sourceCode: templateCalculationSourceCode,
        };

        updateAdditionalCalculationService(updateAdditionalCalculationViewModel, specificationId, calculationId)
            .then((result) => {
                if (result.status === 200) {
                    setIsDirty(false);
                    let response = result.data as Calculation;
                    history.push(`/ViewSpecification/${response.specificationId}`);
                }
            })
            .finally(() => {
                setIsLoadingUpdate(false);
                setIsSaving(false);
            });
    }

    function approveTemplateCalculation() {
        setIsLoadingUpdate(true);
        setCalculationError("");

        try {
            const publishStatusModel: PublishStatusModel = {
                publishStatus: PublishStatus.Approved
            };
            approveCalculationService(publishStatusModel, specificationId, calculationId)
                .then((result) => {
                    const response: PublishStatusModel = result.data as PublishStatusModel;
                    setTemplateCalculationStatus(response.publishStatus);
                });
        } catch (e) {
            setCalculationError("There is a problem, calculation can not be approved, please try again");
        } finally {
            setIsLoading(false);
        }
    }

    async function buildCalculation() {
        setIsDirty(initialSourceCode !== templateCalculationSourceCode);
        setIsBuildingCalculationCode(true);
        setCalculationError("");
        
        compileCalculationPreviewService(specificationId, calculationId, templateCalculationSourceCode)
            .then((result) => {
                setCalculationBuild(prevState => {
                    return {
                        ...prevState,
                        buildSuccess: result.status === 200 && result.data?.compilerOutput?.success,
                        compileRun: true,
                        previewResponse: result.data
                    }
                });
                setIsBuildingCalculationCode(false);
        }).catch(() => {
            setCalculationBuild(prevState => {
                return {...prevState, compileRun: false, buildSuccess: false}
            });
            setIsBuildingCalculationCode(false);
        });
    }

    function updateSourceCode(sourceCode: string) {
        setCalculationBuild(initialBuildSuccess);
        setTemplateCalculationSourceCode(sourceCode);
        setIsDirty(initialSourceCode !== sourceCode);
    }

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specificationSummary.name} url={`/ViewSpecification/${specificationSummary.id}`}/>
                <Breadcrumb name={"Edit template calculation"}/>
            </Breadcrumbs>
            <LoadingStatus title={isLoadingUpdate ? "Updating template calculation" : "Loading"} hidden={!isLoading && !isLoadingUpdate}
                           subTitle={isLoadingUpdate ? "Please wait whilst the calculation is updated" : "Please wait..."}/>

            <div hidden={(calculationError == null || calculationError === "" || isLoading)}
                 className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert"
                 data-module="govuk-error-summary">
                <h2 className="govuk-error-summary__title">
                    There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                    <ul className="govuk-list govuk-error-summary__list">
                        <li>
                            <a href="#calculation-status">{calculationError}</a>
                        </li>
                    </ul>
                </div>
            </div>

            <CircularReferenceErrorSummary errors={circularReferenceErrors} defaultSize={3}/>

            <fieldset className="govuk-fieldset" hidden={isLoading}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 className="govuk-fieldset__heading">
                        Edit template calculation
                    </h1>
                </legend>
                <div id="calculation-status"
                     className={"govuk-form-group" + (calculationError != null && calculationError !== "" ? " govuk-form-group--error" : "")}>
                    <span className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> {calculationError}
                    </span>
                    <span className="govuk-caption-m">Calculation status</span>
                    <strong className="govuk-tag govuk-tag--green govuk-!-margin-top-2">{templateCalculationStatus} </strong>
                </div>
                <div className="govuk-form-group">
                    <span className="govuk-caption-m">Name</span>
                    <h2 className="govuk-heading-m">{templateCalculationName}</h2>
                </div>
                <div className="govuk-form-group">
                    <span className="govuk-caption-m">Value type</span>
                    <h2 className="govuk-heading-m">{templateCalculationType}</h2>
                </div>

                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Last saved
                    </label>
                    <h2 className="govuk-heading-m"><DateFormatter date={templateCalculationLastUpdated} utc={false}/></h2>
                    <Link to={`/Calculations/CalculationVersionHistory/${calculationId}`} className="govuk-link">View calculation history</Link>
                </div>

                <div
                    className={"govuk-form-group" + ((calculationBuild.compileRun && !calculationBuild.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="more-detail">
                        Calculation script
                    </label>
                    {renderMonacoEditor && <GdsMonacoEditor specificationId={specificationId}
                                                            calculationType="TemplateCalculations"
                                                            value={templateCalculationSourceCode}
                                                            language="vbs"
                                                            change={updateSourceCode}
                                                            minimap={true}
                                                            key={'1'}
                                                            calculationName={templateCalculationName}
                                                            fundingStreamId={templateCalculationFundingStreamId}
                    />}
                    <button data-prevent-double-click="true" className="govuk-button" data-module="govuk-button"
                            data-testid="build"
                            onClick={buildCalculation} disabled={isBuildingCalculationCode}>
                        Build calculation
                    </button>
                    <LoadingFieldStatus title={"Building source code"} hidden={!isBuildingCalculationCode}/>
                </div>
                <div className="govuk-form-group">
                    <CalculationResultsLink calculationId={calculationId}/>
                </div>
                {calculationBuild.buildSuccess &&
                <div className="govuk-panel govuk-panel--confirmation">
                    <div className="govuk-panel__body">
                        Build successful
                    </div>
                </div>}
                {isDirty && calculationBuild.compileRun && !calculationBuild.buildSuccess &&
                <div className={"govuk-form-group" +
                ((calculationBuild.compileRun && !calculationBuild.buildSuccess) ?
                    " govuk-form-group--error" : "")}>
                    <div className="govuk-body">Your calculation’s build output must be successful before you can save it</div>
                </div>}
                {isDirty &&
                <div className="govuk-form-group">
                    <div className="govuk-body">Your calculation must be saved before you can approve it</div>
                </div>}
                <div
                    hidden={(!calculationBuild.compileRun && !calculationBuild.buildSuccess) || (calculationBuild.compileRun && calculationBuild.buildSuccess)}
                    className={"govuk-form-group" + ((calculationBuild.compileRun && !calculationBuild.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="build-output">
                        Build output
                    </label>
                    <CompilationErrorMessageList 
                        compilerMessages={calculationBuild.previewResponse.compilerOutput.compilerMessages} />
                </div>
                {isLoadingCircularDependencies &&
                <div className="govuk-!-margin-bottom-4">
                    <LoadingFieldStatus title={"Checking for circular dependencies..."}/>
                </div>
                }
                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                        onClick={submitTemplateCalculation}
                        disabled={!isDirty || isSaving || !calculationBuild.buildSuccess}>
                    Save and continue
                </button>
                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                        onClick={approveTemplateCalculation}
                        disabled={isDirty || isLoadingCircularDependencies || templateCalculationStatus === PublishStatus.Approved || !canApproveCalculation}>
                    Approve
                </button>
                <Link to={`/ViewSpecification/${specificationId}`} className="govuk-button govuk-button--secondary" data-module="govuk-button">
                    Cancel
                </Link>
            </fieldset>
        </div>
        <Footer/>
    </div>
}
