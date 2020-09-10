import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {EditSpecificationViewModel} from "../../types/Specifications/EditSpecificationViewModel";
import {
    CalculationTypes,
    EditAdditionalCalculationViewModel,
    UpdateAdditionalCalculationViewModel
} from "../../types/Calculations/CreateAdditonalCalculationViewModel";
import {
    approveCalculationService,
    compileCalculationPreviewService,
    getCalculationByIdService,
    getIsUserAllowedToApproveCalculationService,
    updateAdditionalCalculationService,
    getCalculationCircularDependencies
} from "../../services/calculationService";
import {Calculation} from "../../types/CalculationSummary";
import {CompilerOutputViewModel, PreviewResponse, SourceFile} from "../../types/Calculations/PreviewResponse";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PublishStatus, PublishStatusModel} from "../../types/PublishStatusModel";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {CalculationResultsLink} from "../../components/Calculations/CalculationResultsLink";
import {useConfirmLeavePage} from "../../hooks/useConfirmLeavePage";
import {useEffect, useState} from "react";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import React from "react";
import {GdsMonacoEditor} from "../../components/GdsMonacoEditor";
import {Footer} from "../../components/Footer";
import {CircularReferenceErrorSummary} from "../../components/CircularReferenceErrorSummary";
import {CircularReferenceError} from "../../types/Calculations/CircularReferenceError";

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
    const [specificationSummary, setSpecificationSummary] = useState<EditSpecificationViewModel>({
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
        templateIds: {"": [""]}
    });
    const [originalAdditionalCalculation, setOriginalAdditionalCalculation] = useState<EditAdditionalCalculationViewModel>({
        publishStatus: PublishStatus.Draft,
        lastUpdated: new Date(),
        specificationId: "",
        name: "",
        sourceCode: "",
        valueType: CalculationTypes.Number,
        fundingStreamId: ""
    });
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [additionalCalculationName, setAdditionalCalculationName] = useState<string>("");
    const [additionalCalculationType, setAdditionalCalculationType] = useState<CalculationTypes>(CalculationTypes.Percentage);
    const [additionalCalculationSourceCode, setAdditionalCalculationSourceCode] = useState<string>("");
    const [initialSourceCode, setInitialSourceCode] = useState<string>("");
    const [additionalCalculationStatus, setAdditionalCalculationStatus] = useState<PublishStatus>();
    const initialBuildSuccess: CompilerOutputViewModel = {
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
                    severity: ""
                }],
                sourceFiles: [{
                    fileName: "",
                    sourceCode: ""
                }],
                success: false
            }
        }
    };
    const [additionalCalculationBuildSuccess, setAdditionalCalculationBuildSuccess] = useState<CompilerOutputViewModel>(initialBuildSuccess);
    const [calculationError, setCalculationError] = useState<string>();
    const [formValidation, setFormValid] = useState({formValid: false, formSubmitted: false});
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [circularReferenceErrors, setCircularReferenceErrors] = useState<CircularReferenceError[]>([]);
    const [nameErrorMessage, setNameErrorMessage] = useState("");
    const [isBuildingCalculationCode, setIsBuildingCalculationCode] = useState<boolean>(false);

    useConfirmLeavePage(isDirty && !isSaving);

    useEffect(() => {
        const loadCalculation = async () => {
            try {
                setIsLoading(true);
                setCalculationError("");
                const result = await getCalculationByIdService(calculationId);
                const calc = result.data as EditAdditionalCalculationViewModel;
                setOriginalAdditionalCalculation(calc);
                setAdditionalCalculationSourceCode(calc.sourceCode);
                setAdditionalCalculationName(calc.name);
                setAdditionalCalculationType(calc.valueType);
                setAdditionalCalculationStatus(calc.publishStatus);
                setInitialSourceCode(calc.sourceCode);

                const specSummaryResult = await getSpecificationSummaryService(calc.specificationId);
                const spec = specSummaryResult.data as EditSpecificationViewModel;
                setSpecificationSummary(spec);
                setSpecificationId(spec.id);
            } catch {
                setCalculationError("There is a problem loading this calculation. Please try again.");
            } finally {
                setIsLoading(false);
                setIsDirty(false);
            }
        }
        loadCalculation();
    }, [calculationId]);


    let history = useHistory();

    useEffectOnce(() => {
        getCalculationByIdService(calculationId).then((result) => {
            const additionalCalculationResult = result.data as EditAdditionalCalculationViewModel;
            setOriginalAdditionalCalculation(additionalCalculationResult);
            setAdditionalCalculationSourceCode(additionalCalculationResult.sourceCode);
            setAdditionalCalculationName(additionalCalculationResult.name);
            setAdditionalCalculationType(additionalCalculationResult.valueType);
            setAdditionalCalculationStatus(additionalCalculationResult.publishStatus);

            getSpecificationSummaryService(additionalCalculationResult.specificationId).then((result) => {
                const specificationResult = result.data as EditSpecificationViewModel;
                setSpecificationSummary(specificationResult);
                setSpecificationId(specificationResult.id);
            });
        })
    });

    useEffect(() => {
        if (originalAdditionalCalculation &&
            originalAdditionalCalculation.sourceCode &&
            originalAdditionalCalculation.name &&
            originalAdditionalCalculation.valueType) {
            setIsDirty(originalAdditionalCalculation.sourceCode !== additionalCalculationSourceCode ||
                originalAdditionalCalculation.name !== additionalCalculationName ||
                originalAdditionalCalculation.valueType !== additionalCalculationType);
        }
    }, [additionalCalculationType, additionalCalculationName, additionalCalculationSourceCode, originalAdditionalCalculation])

    function submitAdditionalCalculation() {
        if (additionalCalculationSourceCode === "" || !additionalCalculationBuildSuccess.buildSuccess) {
            return setFormValid({formSubmitted: true, formValid: false});
        }
        if (additionalCalculationName === "" || additionalCalculationName.length < 4 || additionalCalculationName.length > 180) {
            setNameErrorMessage("Please use a name between 4 and 180 characters");
            return setFormValid({formSubmitted: true, formValid: false});
        }
        if (!((additionalCalculationName.length >= 4 && additionalCalculationName.length <= 180) &&
            additionalCalculationSourceCode !== "" &&
            additionalCalculationBuildSuccess.buildSuccess &&
            additionalCalculationBuildSuccess.compileRun)) {
            return setFormValid({formSubmitted: true, formValid: false});
        }

        setFormValid({formSubmitted: true, formValid: true});
        setNameErrorMessage("");
        setIsLoading(true);
        setIsSaving(true);

        let updateAdditionalCalculationViewModel: UpdateAdditionalCalculationViewModel = {
            calculationName: additionalCalculationName,
            calculationType: additionalCalculationType,
            sourceCode: additionalCalculationSourceCode,
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
                setIsLoading(false);
                setIsSaving(false);
            });
    }

    const approveTemplateCalculation = async () => {
        setIsLoading(true);
        setCalculationError("");

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
                setAdditionalCalculationStatus(publishStatus);
            } else {
                setCalculationError("Calculation can not be approved by calculation writer");
            }
        } catch (e) {
            setCalculationError("There is a problem, calculation can not be approved, please try again");
        } finally {
            setIsLoading(false);
        }
    }

    async function buildCalculation() {
        setIsBuildingCalculationCode(true);
        setAdditionalCalculationBuildSuccess(initialBuildSuccess);
        setCircularReferenceErrors([]);
        setCalculationError("");

        try {
            const circularDependenciesResponse = await getCalculationCircularDependencies(specificationSummary.id);
            const circularDependencies = circularDependenciesResponse.data as CircularReferenceError[];
            if (circularDependencies.length > 0) {
                setCircularReferenceErrors(circularDependencies);
                setIsBuildingCalculationCode(false);
                window.scrollTo(0, 0);
                return;
            }
        }
        catch {
            setCalculationError("There is a problem building this calculation. Please try again.");
            setIsBuildingCalculationCode(false);
        }

        compileCalculationPreviewService(specificationId, calculationId, additionalCalculationSourceCode).then((result) => {
            if (result.status === 200) {
                let response = result.data as PreviewResponse;
                setAdditionalCalculationBuildSuccess(prevState => {
                    return {
                        ...prevState,
                        buildSuccess: response.compilerOutput.success,
                        compileRun: true,
                        previewResponse: response
                    }
                });
                setIsBuildingCalculationCode(false);
            }

            if (result.status === 400) {
                setAdditionalCalculationBuildSuccess(prevState => {
                    return {
                        ...prevState,
                        buildSuccess: false,
                        compileRun: true,
                    }
                });

                setErrorMessage((result.data as SourceFile).sourceCode);
            }
        }).catch(() => {
            setAdditionalCalculationBuildSuccess(prevState => {
                return {...prevState, compileRun: true, buildSuccess: false}
            });
            setIsBuildingCalculationCode(false);
        });
    }

    function updateSourceCode(sourceCode: string) {
        setAdditionalCalculationBuildSuccess(initialBuildSuccess);
        setAdditionalCalculationSourceCode(sourceCode);
        setIsDirty(initialSourceCode !== sourceCode);
    }
    function updateSourceCodeForEditor(updatedSourceCode: string) {
        setAdditionalCalculationSourceCode(updatedSourceCode);
    }

    return <div>
        <Header location={Section.Specifications} />
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"} />
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"} />
                <Breadcrumb name={specificationSummary.name} url={`/ViewSpecification/${specificationSummary.id}`} />
                <Breadcrumb name={"Edit additional calculation"} />
            </Breadcrumbs>
            <LoadingStatus title={"Updating additional calculation"} hidden={!isLoading} subTitle={"Please wait whilst the calculation is updated"} />
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

            <CircularReferenceErrorSummary errors={circularReferenceErrors} defaultSize={3} />

            <fieldset className="govuk-fieldset" hidden={isLoading}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 className="govuk-fieldset__heading">
                        Edit additional calculation
                    </h1>
                </legend>
                <div id="calculation-status"
                    className={"govuk-form-group" + (calculationError != null && calculationError !== "" ? " govuk-form-group--error" : "")}>
                    <span className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> {calculationError}
                    </span>
                    <span className="govuk-caption-m">Calculation status</span>
                    <strong className="govuk-tag govuk-tag--green govuk-!-margin-top-2">{additionalCalculationStatus} </strong>
                </div>
                <div className={"govuk-form-group" + (nameErrorMessage.length > 0 ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="address-line-1">
                        Calculation name
                    </label>
                    <input className="govuk-input" id="calculation-name" name="calculation-name" type="text" pattern="[A-Za-z0-9]+"
                        value={additionalCalculationName}
                        onChange={(e) => setAdditionalCalculationName(e.target.value)} />
                    <div hidden={nameErrorMessage === ""}>
                        <span id="calculation-name-error" className="govuk-error-message">
                            <span className="govuk-visually-hidden">Error:</span> Calculation name must be between 4 and 180 characters
                        </span>
                    </div>
                </div>

                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Value type
                    </label>
                    <select className="govuk-select" id="sort" name="sort"
                        onChange={(e) => setAdditionalCalculationType(e.target.value as CalculationTypes)}>
                        <option value="Percentage"
                            selected={additionalCalculationType === CalculationTypes.Percentage}>Percentage
                        </option>
                        <option value="Number" selected={additionalCalculationType === CalculationTypes.Number}>Number
                        </option>
                        <option value="Currency"
                            selected={additionalCalculationType === CalculationTypes.Currency}>Currency
                        </option>
                    </select>
                </div>

                <div
                    className={"govuk-form-group" + ((additionalCalculationBuildSuccess.compileRun && !additionalCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="more-detail">
                        Calculation script
                    </label>
                    {renderMonacoEditor && <GdsMonacoEditor
                        value={additionalCalculationSourceCode}
                        change={updateSourceCode}
                        language={"vb"}
                        minimap={false}
                        specificationId={specificationId}
                        calculationType={"AdditionalCalculation"}
                        calculationName={additionalCalculationName}
                    />}
                    <button data-prevent-double-click="true" className="govuk-button" data-module="govuk-button"
                        data-testid="build"
                        onClick={buildCalculation} disabled={isBuildingCalculationCode}>
                        Build calculation
                    </button>

                    <LoadingFieldStatus title={"Building source code"} hidden={!isBuildingCalculationCode} />
                </div>
                <div className="govuk-form-group">
                    <CalculationResultsLink calculationId={calculationId} />
                </div>
                {additionalCalculationBuildSuccess.buildSuccess &&
                    <div className="govuk-panel govuk-panel--confirmation">
                        <div className="govuk-panel__body">
                            Build successful
                    </div>
                    </div>}
                {isDirty && !additionalCalculationBuildSuccess.buildSuccess &&
                    <div className={"govuk-form-group" +
                        ((additionalCalculationBuildSuccess.compileRun && !additionalCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
                        <div className="govuk-body">Your calculation’s build output must be successful before you can save it</div>
                    </div>}
                {isDirty &&
                    <div className="govuk-form-group">
                        <div className="govuk-body">Your calculation must be saved before you can approve it</div>
                    </div>}
                <div
                    hidden={(!additionalCalculationBuildSuccess.compileRun && !additionalCalculationBuildSuccess.buildSuccess) || (additionalCalculationBuildSuccess.compileRun && additionalCalculationBuildSuccess.buildSuccess)}
                    className={"govuk-form-group" + ((additionalCalculationBuildSuccess.compileRun && !additionalCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="build-output">
                        Build output
                    </label>
                    <div className="govuk-error-summary">
                        <h2 className="govuk-error-summary__title">
                            There was a compilation error
                        </h2>
                        <div className="govuk-error-summary__body">
                            <table className={"govuk-table"}>
                                <thead className={"govuk-table__head"}>
                                    <tr className={"govuk-table__row"}>
                                        <th className="govuk-table__header">Error message</th>
                                        <th className="govuk-table__header">Start line</th>
                                        <th className="govuk-table__header">Start char</th>
                                        <th className="govuk-table__header">End line</th>
                                        <th className="govuk-table__header">End char</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {additionalCalculationBuildSuccess.previewResponse.compilerOutput.compilerMessages.map((cm, index) =>
                                        <tr key={index} className={"govuk-table__row"}>
                                            <td className="govuk-table__cell">{cm.message}</td>
                                            <td className="govuk-table__cell">{cm.location.startLine}</td>
                                            <td className="govuk-table__cell">{cm.location.startChar}</td>
                                            <td className="govuk-table__cell">{cm.location.endLine}</td>
                                            <td className="govuk-table__cell">{cm.location.endChar}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <ul className="govuk-error-summary__list">
                                <li hidden={errorMessage.length === 0}>{errorMessage}</li>

                            </ul>
                        </div>
                    </div>
                </div>
                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                    onClick={submitAdditionalCalculation}
                    disabled={!isDirty || isSaving || !additionalCalculationBuildSuccess.buildSuccess}>
                    Save and continue
                </button>
                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                    onClick={approveTemplateCalculation}
                    disabled={isDirty || additionalCalculationStatus === PublishStatus.Approved}>
                    Approve
                </button>
                <Link to={`/ViewSpecification/${specificationId}`} className="govuk-button govuk-button--secondary"
                    data-module="govuk-button">
                    Cancel
                </Link>
            </fieldset>
        </div>
        <Footer />
    </div>
}
