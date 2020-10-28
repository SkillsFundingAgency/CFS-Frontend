import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {UpdateAdditionalCalculationViewModel} from "../../types/Calculations/CreateAdditonalCalculationViewModel";
import {approveCalculationService, compileCalculationPreviewService, getIsUserAllowedToApproveCalculationService, updateAdditionalCalculationService,} from "../../services/calculationService";
import {Calculation} from "../../types/CalculationSummary";
import {CalculationCompilePreviewResponse, CompileErrorSeverity, CompilerOutputViewModel} from "../../types/Calculations/CalculationCompilePreviewResponse";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PublishStatus, PublishStatusModel} from "../../types/PublishStatusModel";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {CalculationResultsLink} from "../../components/Calculations/CalculationResultsLink";
import {useConfirmLeavePage} from "../../hooks/useConfirmLeavePage";
import React, {useState} from "react";
import {GdsMonacoEditor} from "../../components/GdsMonacoEditor";
import {Footer} from "../../components/Footer";
import {CircularReferenceErrorSummary} from "../../components/CircularReferenceErrorSummary";
import {CompilationErrorMessageList} from "../../components/Calculations/CompilationErrorMessageList";
import {DateFormatter} from "../../components/DateFormatter";
import {useErrors} from "../../hooks/useErrors";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useCalculation} from "../../hooks/Calculations/useCalculation";
import {useCalculationCircularDependencies} from "../../hooks/Calculations/useCalculationCircularDependencies";

export interface EditAdditionalCalculationProps {
    excludeMonacoEditor?: boolean
}

export interface EditAdditionalCalculationRouteProps {
    calculationId: string
}

export function EditAdditionalCalculation({match, excludeMonacoEditor}: RouteComponentProps<EditAdditionalCalculationRouteProps> & EditAdditionalCalculationProps) {
    const [renderMonacoEditor] = useState<boolean>(!excludeMonacoEditor);
    const [specificationId, setSpecificationId] = useState<string>("");
    const calculationId = match.params.calculationId;
    const {errors, addErrorMessage, clearErrorMessages} = useErrors();
    const {specification, isLoadingSpecification} =
        useSpecificationSummary(specificationId,
            err => addErrorMessage(err.message, "Error while loading specification"));
    const {calculation, isLoadingCalculation} =
        useCalculation(calculationId,
            err => addErrorMessage(err.message, "Error while loading calculation"));
    const {circularReferenceErrors, isLoadingCircularDependencies} =
        useCalculationCircularDependencies(specificationId,
            err => addErrorMessage(err.message, "Error while checking for circular reference errors"));
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [sourceCode, setSourceCode] = useState<string>("");
    const [calculationStatus, setCalculationStatus] = useState<PublishStatus | undefined>(undefined);
    const initialBuild: CompilerOutputViewModel = {
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
                sourceFiles: [{
                    fileName: "",
                    sourceCode: ""
                }],
                success: false
            }
        }
    };
    const [calculationBuild, setCalculationBuild] = useState<CompilerOutputViewModel>(initialBuild);
    const [isLoading, setIsLoading] = useState(false);
    const [nameErrorMessage, setNameErrorMessage] = useState("");
    const [isBuildingCalculationCode, setIsBuildingCalculationCode] = useState<boolean>(false);
    let history = useHistory();

    function submitAdditionalCalculation() {
        if (!calculation || !calculation.valueType) {
            return;
        }
        if (sourceCode === "" || !calculationBuild.buildSuccess) {
            return addErrorMessage("Please check the code and make sure it builds", "Validation error", "");
        }

        setNameErrorMessage("");
        setIsLoading(true);
        setIsSaving(true);

        let updateAdditionalCalculationViewModel: UpdateAdditionalCalculationViewModel = {
            calculationName: calculation.name,
            valueType: calculation.valueType,
            sourceCode: sourceCode,
        };

        updateAdditionalCalculationService(updateAdditionalCalculationViewModel, specificationId, calculationId)
            .then((result) => {
                if (result.status === 200) {
                    let response = result.data as Calculation;
                    history.push(`/ViewSpecification/${response.specificationId}`);
                }
            })
            .finally(() => {
                setIsLoading(false);
                setIsSaving(false);
            });
    }

    const approveTemplateCalculation = async () => {
        setIsLoading(true);
        clearErrorMessages();

        const checkCanApproveCalculation = async (id: string) => {
            const result = await getIsUserAllowedToApproveCalculationService(id);
            return result.data as boolean;
        };

        const approveSpecification = async (specId: string, calcId: string) => {
            const result = await approveCalculationService({publishStatus: PublishStatus.Approved} as PublishStatusModel, specId, calcId);
            return result.data;
        };

        try {
            const canUserApprove = await checkCanApproveCalculation(calculationId);
            if (canUserApprove) {
                const publishStatus = await approveSpecification(specificationId, calculationId);
                setCalculationStatus(publishStatus);
            } else {
                addErrorMessage("Permissions", "Calculation can not be approved by calculation writer", "calculation-status");
            }
        } catch (e) {
            addErrorMessage("There is a problem, calculation can not be approved, please try again. " + e);
        } finally {
            setIsLoading(false);
        }
    }

    async function buildCalculation() {
        setIsBuildingCalculationCode(true);
        setCalculationBuild(initialBuild);
        clearErrorMessages();

        compileCalculationPreviewService(specificationId, calculationId, sourceCode)
            .then((result) => {
                if (result.status !== 200 && result.status !== 400) {
                    addErrorMessage("Unexpected response with status " + result.statusText, "Error while compiling calculation source code", "source-code")
                }
                setCalculationBuild(prevState => {
                    return {
                        ...prevState,
                        buildSuccess: result.status === 200 && result.data?.compilerOutput?.success,
                        compileRun: true,
                        previewResponse: result.data
                    }
                });
                setIsBuildingCalculationCode(false);
            })
            .catch(err => {
                addErrorMessage(err.toString(), "Error while building calculation", "source-code")
                setCalculationBuild(prevState => {
                    return {...prevState, compileRun: false, buildSuccess: false}
                });
                setIsBuildingCalculationCode(false);
            });
    }

    function updateSourceCode(sourceCode: string) {
        setCalculationBuild(initialBuild);
        setSourceCode(sourceCode);
    }

    function initCalculationData() {
        if (!calculation || specificationId.length > 0) {
            return;
        }
        setSpecificationId(calculation.specificationId);
        setCalculationStatus(calculation.publishStatus);
        setSourceCode(calculation.sourceCode);
    }

    if (circularReferenceErrors && circularReferenceErrors.length > 0) {
        window.scrollTo(0, 0);
    }

    initCalculationData();

    let isDirty = calculation !== undefined && calculation.sourceCode !== sourceCode;

    useConfirmLeavePage(isDirty && !isSaving);

    const loadingTitle = isLoadingSpecification ? "Loading specification" :
        isLoadingCalculation ? "Loading calculation" :
            isLoadingCircularDependencies ? "Checking for circular reference errors" :
                isLoading ? "Updating additional calculation" : "";
    const loadingSubtitle = isLoadingSpecification || isLoadingCalculation || isLoadingCircularDependencies ? "Please wait..." : isLoading ? "Please wait whilst the calculation is updated" : "";

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                {specification &&
                <Breadcrumb name={specification.name} url={`/ViewSpecification/${specification.id}`}/>
                }
                <Breadcrumb name={"Edit additional calculation"}/>
            </Breadcrumbs>

            {(isLoadingSpecification || isLoadingCalculation || isLoadingCircularDependencies || isLoading) &&
            <LoadingStatus title={loadingTitle} subTitle={loadingSubtitle}/>
            }

            <MultipleErrorSummary errors={errors}/>

            {circularReferenceErrors &&
            <CircularReferenceErrorSummary errors={circularReferenceErrors} defaultSize={3}/>
            }

            <fieldset className="govuk-fieldset" hidden={isLoading}>
                <div className={"govuk-form-group" + (nameErrorMessage.length > 0 ? " govuk-form-group--error" : "")}>
                    <span className="govuk-caption-l">
                        Calculation name
                    </span>
                    <h2 id="calculation-name-title" className={"govuk-heading-l"}>
                        {!isLoadingCalculation && calculation ? calculation.name : <LoadingFieldStatus title="Loading..."/>}
                    </h2>
                </div>
                <div id="calculation-status"
                     className={"govuk-form-group" + (errors.some(err => err.fieldName === "calculation-status") ? " govuk-form-group--error" : "")}>
                    <span className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> {errors.find(err => err.fieldName === "calculation-status")}
                    </span>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-quarter">
                            <h3 className="govuk-caption-m govuk-!-font-weight-bold">Calculation status</h3>
                        </div>
                        <div className="govuk-grid-column-one-quarter">
                            <span className="govuk-tag govuk-tag--green govuk-!-margin-top-4">
                                {!isLoadingCalculation && calculationStatus ? calculationStatus : <LoadingFieldStatus title="Loading..."/>}
                            </span>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-quarter">
                            <h3 className="govuk-caption-m govuk-!-font-weight-bold">
                                Value type
                            </h3>
                        </div>
                        <div className="govuk-grid-column-one-quarter">
                            <h3 className="govuk-caption-m govuk-">
                                {!isLoadingCalculation && calculation ? calculation.valueType : <LoadingFieldStatus title="Loading..."/>}
                            </h3>
                        </div>
                    </div>
                </div>
                <div id="source-code"
                     className={"govuk-form-group" + ((calculationBuild.compileRun && !calculationBuild.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <h3 className="govuk-caption-m govuk-!-font-weight-bold">
                        Calculation script
                    </h3>
                    {renderMonacoEditor && <GdsMonacoEditor
                        value={sourceCode}
                        change={updateSourceCode}
                        language={"vb"}
                        minimap={false}
                        specificationId={specificationId}
                        calculationType={"AdditionalCalculation"}
                        calculationName={calculation ? calculation.name : ""}
                    />}
                    <button data-prevent-double-click="true"
                            className="govuk-button"
                            data-module="govuk-button"
                            data-testid="build"
                            onClick={buildCalculation} disabled={isBuildingCalculationCode}>
                        Build calculation
                    </button>
                    <LoadingFieldStatus title={"Building source code"} hidden={!isBuildingCalculationCode}/>
                </div>
                <div className="govuk-form-group">
                    <CalculationResultsLink calculationId={calculationId}/>
                </div>
                {calculationBuild.compileRun && calculationBuild.buildSuccess &&
                <div className="govuk-panel govuk-panel--confirmation">
                    <div className="govuk-panel__body">
                        Build successful
                    </div>
                </div>}
                {calculationBuild.compileRun && !calculationBuild.buildSuccess &&
                <div className={"govuk-form-group" + ((calculationBuild.compileRun && !calculationBuild.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="build-output">
                        Build output
                    </label>
                    <CompilationErrorMessageList compilerMessages={calculationBuild.previewResponse.compilerOutput.compilerMessages}/>
                </div>
                }
                {isDirty && !calculationBuild.buildSuccess &&
                <div className={"govuk-form-group" +
                ((calculationBuild.compileRun && !calculationBuild.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <div className="govuk-body">Your calculation’s build output must be successful before you can save it</div>
                </div>}
                {isDirty &&
                <div className="govuk-form-group">
                    <div className="govuk-body">Your calculation must be saved before you can approve it</div>
                </div>}
                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                        onClick={submitAdditionalCalculation}
                        disabled={!isDirty || isSaving || !calculationBuild.buildSuccess}>
                    Save and continue
                </button>
                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                        onClick={approveTemplateCalculation}
                        disabled={isDirty || !calculation || calculation.publishStatus === PublishStatus.Approved}>
                    Approve
                </button>
                <Link to={`/ViewSpecification/${specificationId}`} className="govuk-button govuk-button--secondary"
                      data-module="govuk-button">
                    Cancel
                </Link>
                {calculation &&
                <div className={"govuk-form-group"}>
                    <span id="last-saved-date" className={"govuk-body"}>
                    Last saved <DateFormatter date={calculation.lastUpdated} utc={false}/>
                    </span>
                </div>
                }
                <div className={"govuk-form-group"}>
                    <Link className={"govuk-link"} to={`/Calculations/CalculationVersionHistory/${calculationId}`}>View calculation history</Link>
                </div>
            </fieldset>
        </div>
        <Footer/>
    </div>
}
