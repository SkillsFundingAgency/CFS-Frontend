import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {EditSpecificationViewModel} from "../../types/Specifications/EditSpecificationViewModel";
import { CalculationTypes, EditAdditionalCalculationViewModel, UpdateAdditionalCalculationViewModel } from "../../types/Calculations/CreateAdditonalCalculationViewModel";
import { compileCalculationPreviewService, getCalculationByIdService, updateAdditionalCalculationService } from "../../services/calculationService";
import {Calculation} from "../../types/CalculationSummary";
import {CompilerOutputViewModel, PreviewResponse, SourceFile} from "../../types/Calculations/PreviewResponse";
import {GdsMonacoEditor} from "../../components/GdsMonacoEditor";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";

export interface EditTemplateCalculationRouteProps {
    calculationId: string;
    fundingLineItem: string;
}

export function EditTemplateCalculation({match}: RouteComponentProps<EditTemplateCalculationRouteProps>) {
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
        templateIds: {
            PSG: ""
        }
    });
    const [templateCalculationName, setTemplateCalculationName] = useState<string>("");
    const [templateCalculationType, setTemplateCalculationType] = useState<CalculationTypes>(CalculationTypes.Percentage);
    const [templateCalculationSourceCode, setTemplateCalculationSourceCode] = useState<string>("");
    const initialBuildSuccess = {
        buildSuccess: false,
        compileRun: false,
        previewResponse: {
            compilerOutput: {
                compilerMessages: [],
                sourceFiles: [],
                success: false
            }
        }
    };
    const [templateCalculationBuildSuccess, setTemplateCalculationBuildSuccess] = useState<CompilerOutputViewModel>(initialBuildSuccess);
    const [formValidation, setFormValid] = useState({formValid: false, formSubmitted: false});
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    let history = useHistory();

    useEffectOnce(() => {
        const getSpecification = async (e: string) => {
            const specificationResult = await getSpecificationSummaryService(e);
            return specificationResult;
        };

        const getTemplateCalculation = async () => {
            const templateCalculationResult = await getCalculationByIdService(calculationId);
            return templateCalculationResult;
        };


        getTemplateCalculation().then((result) => {
            const templateCalculationResult = result.data as EditAdditionalCalculationViewModel;
            setTemplateCalculationSourceCode(templateCalculationResult.sourceCode);
            setTemplateCalculationName(templateCalculationResult.name);
            setTemplateCalculationType(templateCalculationResult.valueType);

            getSpecification(templateCalculationResult.specificationId).then((result) => {
                const specificationResult = result.data as EditSpecificationViewModel;
                setSpecificationSummary(specificationResult);
                setSpecificationId(specificationResult.id);
            });

        })
    });

    function submitTemplateCalculation() {
        if (templateCalculationName === "" || templateCalculationSourceCode === "" || !templateCalculationBuildSuccess.buildSuccess) {
            setFormValid({formSubmitted: true, formValid: false});
        }

        if (templateCalculationName !== "" && templateCalculationSourceCode !== "" && templateCalculationBuildSuccess.buildSuccess && templateCalculationBuildSuccess.compileRun) {
            setFormValid({formSubmitted: true, formValid: true});

            setIsLoading(true);
            let updateAdditionalCalculationViewModel: UpdateAdditionalCalculationViewModel = {
                calculationName: templateCalculationName,
                calculationType: templateCalculationType,
                sourceCode: templateCalculationSourceCode,
            };

            const editTemplateCalculation = async () => {
                const updateTemplateCalculationResult = await updateAdditionalCalculationService(updateAdditionalCalculationViewModel, specificationId, calculationId);
                return updateTemplateCalculationResult;
            };

            editTemplateCalculation().then((result) => {

                if (result.status === 200) {
                    let response = result.data as Calculation;
                    history.push(`/app/ViewSpecification/${response.specificationId}`);
                } else {
                    setIsLoading(false);
                }
            }).catch(() => {
                setIsLoading(false);
            });
        } else {
            setFormValid({formSubmitted: true, formValid: false})
        }
    }

    function buildCalculation() {
        const compileCode = async () => {
            const compileCodeResult = await compileCalculationPreviewService(specificationId, calculationId, templateCalculationSourceCode);
            return compileCodeResult;
        };

        compileCode().then((result) => {
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
        }).catch(err => {
            setTemplateCalculationBuildSuccess(prevState => {
                return {...prevState, compileRun: true, buildSuccess: false}
            });
        });
    }

    function updateSourceCode(sourceCode: string) {
        setTemplateCalculationBuildSuccess(initialBuildSuccess);
        setTemplateCalculationSourceCode(sourceCode);
    }

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specificationSummary.name} url={`/ViewSpecification/${specificationSummary.id}`}/>
                <Breadcrumb name={"Edit template calculation"} />
            </Breadcrumbs>
            <LoadingStatus title={"Updating template calculation"} hidden={!isLoading}
                           subTitle={"Please wait whilst the calculation is updated"}/>
            <fieldset className="govuk-fieldset" hidden={isLoading}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 className="govuk-fieldset__heading">
                        Edit template calculation
                    </h1>
                </legend>

                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="address-line-1">
                        Calculation name
                    </label>
                    <input className="govuk-input" id="address-line-1" name="address-line-1" type="text"
                           value={templateCalculationName} readOnly={true} disabled={true}/>
                </div>

                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Funding line
                    </label>
                    <input type="text" className="govuk-input" value={match.params.fundingLineItem}/>
                </div>

                <div
                    className={"govuk-form-group" + ((templateCalculationBuildSuccess.compileRun && !templateCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="more-detail">
                        Calculation script
                    </label>
                    <GdsMonacoEditor specificationId={specificationId} value={templateCalculationSourceCode}
                                     language="vbs" change={updateSourceCode}
                                     minimap={true} key={'1'}/>
                    <button data-prevent-double-click="true" className="govuk-button" data-module="govuk-button"
                            onClick={buildCalculation}>
                        Build calculation
                    </button>
                </div>

                <div className="govuk-panel govuk-panel--confirmation"
                     hidden={!templateCalculationBuildSuccess.buildSuccess}>
                    <div className="govuk-panel__body">
                        Build successful
                    </div>
                </div>

                <div className={"govuk-form-group" + ((templateCalculationBuildSuccess.compileRun && !templateCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <div className="govuk-body">
                        Your calculation’s build output must be successful before you can save it
                    </div>
                </div>

                <div hidden={(!templateCalculationBuildSuccess.compileRun && !templateCalculationBuildSuccess.buildSuccess) || (templateCalculationBuildSuccess.compileRun && templateCalculationBuildSuccess.buildSuccess)}
                    className={"govuk-form-group" + ((templateCalculationBuildSuccess.compileRun && !templateCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="build-output">
                        Build output
                    </label>
                    <div className="govuk-error-summary">
                        <h2 className="govuk-error-summary__title">
                            There was a compilation error
                        </h2>
                        <div className="govuk-error-summary__body">
                            <ul className="govuk-error-summary__list">
                                {templateCalculationBuildSuccess.previewResponse.compilerOutput.compilerMessages.map(cm =>
                                    <li>{cm.message}</li>)}
                                <li hidden={errorMessage.length === 0}>{errorMessage}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                        onClick={submitTemplateCalculation}
                        disabled={!templateCalculationBuildSuccess.buildSuccess}>
                    Save and continue
                </button>
                <Link to={`/ViewSpecification/${specificationId}`} className="govuk-button govuk-button--secondary" data-module="govuk-button">
                    Cancel
                </Link>
            </fieldset>
        </div>
    </div>
}
