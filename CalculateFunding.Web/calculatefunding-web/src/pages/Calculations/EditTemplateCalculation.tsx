import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {useEffectOnce} from "../../hooks/useEffectOnce";
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

export interface EditTemplateCalculationProps {
    excludeMonacoEditor?: boolean
}

export interface EditTemplateCalculationRouteProps {
    calculationId: string;
    fundingLineItem: string;
}

export function EditTemplateCalculation({match, excludeMonacoEditor}: RouteComponentProps<EditTemplateCalculationRouteProps> & EditTemplateCalculationProps) {
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
    const [templateCalculationName, setTemplateCalculationName] = useState<string>("");
    const [templateCalculationFundingStreamId, setTemplateCalculationFundingStreamId] = useState<string>("");
    const [templateCalculationType, setTemplateCalculationType] = useState<CalculationTypes>(CalculationTypes.Percentage);
    const [templateCalculationSourceCode, setTemplateCalculationSourceCode] = useState<string>("");
    const [initialSourceCode, setInitialSourceCode] = useState<string>("");
    const [originalTemplateCalculationSourceCode, setOriginalTemplateCalculationSourceCode] = useState<string>("");
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
                    severity: ""
                }],
                sourceFiles: [],
                success: false
            }
        }
    };
    const [templateCalculationBuildSuccess, setTemplateCalculationBuildSuccess] = useState<CompilerOutputViewModel>(initialBuildSuccess);
    const [calculationError, setCalculationError] = useState<string>();
    const [formValidation, setFormValid] = useState({formValid: false, formSubmitted: false});
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [circularReferenceErrors, setCircularReferenceErrors] = useState<CircularReferenceError[]>([]);
    const [isBuildingCalculationCode, setIsBuildingCalculationCode] = useState<boolean>(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    let history = useHistory();

    useConfirmLeavePage(!isSaving && isDirty);

    useEffectOnce(() => {
        const getTemplateCalculation = async (calcId: string) => {
            try {
                setCalculationError("");
                setCircularReferenceErrors([]);
                setIsLoading(true);
                const result = await getCalculationByIdService(calcId);
                const calc = result.data as EditAdditionalCalculationViewModel;
                setOriginalTemplateCalculationSourceCode(calc.sourceCode);
                setTemplateCalculationSourceCode(calc.sourceCode);
                setTemplateCalculationName(calc.name);
                setTemplateCalculationType(calc.valueType);
                setTemplateCalculationStatus(calc.publishStatus);
                setTemplateCalculationLastUpdated(new Date(calc.lastUpdated));
                setInitialSourceCode(calc.sourceCode);
                setTemplateCalculationFundingStreamId(calc.fundingStreamId);

                const specSummaryResult = await getSpecificationSummaryService(calc.specificationId);
                const spec = specSummaryResult.data as EditSpecificationViewModel;
                setSpecificationSummary(spec);
                setSpecificationId(spec.id);

                const circularDependenciesResponse = await getCalculationCircularDependencies(spec.id);
                const circularDependencies = circularDependenciesResponse.data as CircularReferenceError[];
                if (circularDependencies.length > 0) {
                    setCircularReferenceErrors(circularDependencies);
                    setIsBuildingCalculationCode(false);
                    window.scrollTo(0, 0);
                }
            } catch {
                setCalculationError("There is a problem loading this calculation. Please try again.");
            } finally {
                setIsLoading(false);
                setIsDirty(false);
            }
        };

        getTemplateCalculation(calculationId);
    });

    function submitTemplateCalculation() {
        if (templateCalculationName === "" || templateCalculationSourceCode === "" || !templateCalculationBuildSuccess.buildSuccess) {
            setFormValid({formSubmitted: true, formValid: false});
            return;
        }

        if (!(templateCalculationName !== "" && templateCalculationSourceCode !== "" && templateCalculationBuildSuccess.buildSuccess && templateCalculationBuildSuccess.compileRun)) {
            setFormValid({formSubmitted: true, formValid: false});
            return;
        }

        setFormValid({formSubmitted: true, formValid: true});

        setIsLoading(true);
        setIsSaving(true);

        let updateAdditionalCalculationViewModel: UpdateAdditionalCalculationViewModel = {
            calculationName: templateCalculationName,
            calculationType: templateCalculationType,
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
                setIsLoading(false);
                setIsSaving(false);
            });
    }

    function approveTemplateCalculation() {
        setIsLoading(true);
        setCalculationError("");

        getIsUserAllowedToApproveCalculationService(calculationId)
            .then((userPermissionResult) => {
                if (userPermissionResult.status === 200) {
                    const userCanApprove = userPermissionResult.data as boolean;
                    if (userCanApprove) {
                        const publishStatusModel: PublishStatusModel = {
                            publishStatus: PublishStatus.Approved
                        };
                        approveCalculationService(publishStatusModel, specificationId, calculationId)
                            .then((result) => {
                                if (result.status === 200) {
                                    const response: PublishStatusModel = result.data as PublishStatusModel;
                                    setTemplateCalculationStatus(response.publishStatus);
                                }
                            });
                    } else {
                        setCalculationError("Calculation can not be approved by calculation writer");
                    }
                }
            }).catch(() => {
                setCalculationError("There is a problem, calculation can not be approved, please try again");
            }).finally(() => {
                setIsLoading(false);
            });
    }

    async function buildCalculation() {
        setIsDirty(initialSourceCode !== templateCalculationSourceCode);
        setIsBuildingCalculationCode(true);
        setCalculationError("");

        compileCalculationPreviewService(specificationId, calculationId, templateCalculationSourceCode).then((result) => {
            if (result.status === 200) {
                let response = result.data as PreviewResponse;
                setTemplateCalculationBuildSuccess(prevState => {
                    return {
                        ...prevState,
                        buildSuccess: response.compilerOutput.success,
                        compileRun: true,
                        previewResponse: response
                    }
                });
            }

            if (result.status === 400) {
                setTemplateCalculationBuildSuccess(prevState => {
                    return {
                        ...prevState,
                        buildSuccess: false,
                        compileRun: true,
                    }
                });
                setErrorMessage((result.data as SourceFile).sourceCode);
            }
        }).catch(() => {
            setTemplateCalculationBuildSuccess(prevState => {
                return {...prevState, compileRun: true, buildSuccess: false}
            });
        }).finally(() => {
            setIsBuildingCalculationCode(false);
        });
    }

    function updateSourceCode(sourceCode: string) {
        setTemplateCalculationBuildSuccess(initialBuildSuccess);
        setTemplateCalculationSourceCode(sourceCode);
        setIsDirty(initialSourceCode !== sourceCode);
    }

    return <div>
        <Header location={Section.Specifications} />
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"} />
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"} />
                <Breadcrumb name={specificationSummary.name} url={`/ViewSpecification/${specificationSummary.id}`} />
                <Breadcrumb name={"Edit template calculation"} />
            </Breadcrumbs>
            <LoadingStatus title={"Updating template calculation"} hidden={!isLoading}
                subTitle={"Please wait whilst the calculation is updated"} />

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
                        Funding line
                    </label>
                    <h2 className="govuk-heading-m">{match.params.fundingLineItem}</h2>
                </div>

                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Last saved
                    </label>
                    <h2 className="govuk-heading-m"><DateFormatter date={templateCalculationLastUpdated} utc={false} /></h2>
                    <Link to={`/Calculations/CalculationVersionHistory/${calculationId}`} className="govuk-link">View calculation history</Link>
                </div>

                <div
                    className={"govuk-form-group" + ((templateCalculationBuildSuccess.compileRun && !templateCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
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
                    <LoadingFieldStatus title={"Building source code"} hidden={!isBuildingCalculationCode} />
                </div>
                <div className="govuk-form-group">
                    <CalculationResultsLink calculationId={calculationId} />
                </div>
                {templateCalculationBuildSuccess.buildSuccess &&
                    <div className="govuk-panel govuk-panel--confirmation">
                        <div className="govuk-panel__body">
                            Build successful
                    </div>
                    </div>}
                {isDirty && templateCalculationBuildSuccess.compileRun && !templateCalculationBuildSuccess.buildSuccess &&
                    <div className={"govuk-form-group" +
                        ((templateCalculationBuildSuccess.compileRun && !templateCalculationBuildSuccess.buildSuccess) ?
                            " govuk-form-group--error" : "")}>
                        <div className="govuk-body">Your calculation’s build output must be successful before you can save it</div>
                    </div>}
                {isDirty &&
                    <div className="govuk-form-group">
                        <div className="govuk-body">Your calculation must be saved before you can approve it</div>
                    </div>}
                <div
                    hidden={(!templateCalculationBuildSuccess.compileRun && !templateCalculationBuildSuccess.buildSuccess) || (templateCalculationBuildSuccess.compileRun && templateCalculationBuildSuccess.buildSuccess)}
                    className={"govuk-form-group" + ((templateCalculationBuildSuccess.compileRun && !templateCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
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
                                    {templateCalculationBuildSuccess.previewResponse.compilerOutput.compilerMessages.map((cm, index) =>
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
                    onClick={submitTemplateCalculation}
                    disabled={!isDirty || isSaving || !templateCalculationBuildSuccess.buildSuccess}>
                    Save and continue
                </button>
                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                    onClick={approveTemplateCalculation}
                    disabled={isDirty || templateCalculationStatus === PublishStatus.Approved}>
                    Approve
                </button>
                <Link to={`/ViewSpecification/${specificationId}`} className="govuk-button govuk-button--secondary" data-module="govuk-button">
                    Cancel
                </Link>
            </fieldset>
        </div>
        <Footer />
    </div>
}
