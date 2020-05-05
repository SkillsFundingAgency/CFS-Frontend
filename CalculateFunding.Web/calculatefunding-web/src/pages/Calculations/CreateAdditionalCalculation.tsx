import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {EditSpecificationViewModel} from "../../types/Specifications/EditSpecificationViewModel";
import { CalculationTypes, CreateAdditionalCalculationViewModel } from "../../types/Calculations/CreateAdditonalCalculationViewModel";
import {compileCalculationPreviewService, createAdditionalCalculationService} from "../../services/calculationService";
import {Calculation} from "../../types/CalculationSummary";
import {CompilerOutputViewModel, PreviewResponse, SourceFile} from "../../types/Calculations/PreviewResponse";
import {GdsMonacoEditor} from "../../components/GdsMonacoEditor";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";

export interface CreateAdditionalCalculationRouteProps {
    specificationId: string;
}

export function CreateAdditionalCalculation({match}: RouteComponentProps<CreateAdditionalCalculationRouteProps>) {
    const specificationId = match.params.specificationId;
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
    const [additionalCalculationName, setAdditionalCalculationName] = useState<string>("");
    const [additionalCalculationType, setAdditionalCalculationType] = useState<CalculationTypes>(CalculationTypes.Percentage);
    const [additionalCalculationSourceCode, setAdditionalCalculationSourceCode] = useState<string>("");
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
    const [additionalCalculationBuildSuccess, setAdditionalCalculationBuildSuccess] = useState<CompilerOutputViewModel>(initialBuildSuccess);
    const [formValidation, setFormValid] = useState({formValid: false, formSubmitted: false});
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    let history = useHistory();



    useEffectOnce(() => {
        const getSpecification = async () => {
            const specificationResult = await getSpecificationSummaryService(specificationId);
            return specificationResult;
        };

        getSpecification().then((result) => {
            const specificationResult = result.data as EditSpecificationViewModel;
            setSpecificationSummary(specificationResult);
        });
    });

    function submitAdditionalCalculation() {
        if (additionalCalculationName === "" || additionalCalculationSourceCode === "" || !additionalCalculationBuildSuccess.buildSuccess) {
            setFormValid({formSubmitted: true, formValid: false});
        }

        if (additionalCalculationName !== "" && additionalCalculationSourceCode !== "" && additionalCalculationBuildSuccess.buildSuccess && additionalCalculationBuildSuccess.compileRun) {
            setFormValid({formValid: true, formSubmitted: true});
            setIsLoading(true);
            let createAdditionalCalculationViewModel: CreateAdditionalCalculationViewModel = {
                calculationName: additionalCalculationName,
                calculationType: additionalCalculationType,
                sourceCode: additionalCalculationSourceCode
            };

            const createAdditionalCalculation = async () => {
                const createAdditionalCalculationResult = await createAdditionalCalculationService(createAdditionalCalculationViewModel, specificationId);
                return createAdditionalCalculationResult;
            };

            createAdditionalCalculation().then((result) => {

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
            const compileCodeResult = await compileCalculationPreviewService(specificationId, 'temp-calc-id', additionalCalculationSourceCode);
            return compileCodeResult;
        };

        compileCode().then((result) => {
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
        }).catch(err => {
            setAdditionalCalculationBuildSuccess(prevState => {
                return {...prevState, compileRun: true, buildSuccess: false}
            });
        });
    }

    function updateSourceCode(sourceCode: string) {
        setAdditionalCalculationBuildSuccess(initialBuildSuccess);
        setAdditionalCalculationSourceCode(sourceCode);
    }

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specificationSummary.name} url={`/ViewSpecification/${specificationSummary.id}`}/>
                <Breadcrumb name={"Create additional calculation"} />
            </Breadcrumbs>

            <LoadingStatus title={"Creating additional calculation"} hidden={!isLoading}
                           subTitle={"Please wait whilst the calculation is created"}/>
            <fieldset className="govuk-fieldset" hidden={isLoading}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 className="govuk-fieldset__heading">
                        Create additional calculation
                    </h1>
                </legend>

                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="address-line-1">
                        Calculation name
                    </label>
                    <input className="govuk-input" id="address-line-1" name="address-line-1" type="text"
                           onChange={(e) => setAdditionalCalculationName(e.target.value)}/>
                </div>

                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Value type
                    </label>
                    <select className="govuk-select" id="sort" name="sort"
                            onChange={(e) => setAdditionalCalculationType(e.target.value as CalculationTypes)}>
                        <option value="Percentage">Percentage</option>
                        <option value="Number">Number</option>
                        <option value="Currency">Currency</option>
                    </select>
                </div>

                <div
                    className={"govuk-form-group" + ((additionalCalculationBuildSuccess.compileRun && !additionalCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="more-detail">
                        Calculation script
                    </label>
                    <GdsMonacoEditor specificationId={specificationId} value="" language="vbs" change={updateSourceCode}
                                     minimap={true} key={'1'}/>
                    <button data-prevent-double-click="true" className="govuk-button" data-module="govuk-button"
                            onClick={buildCalculation}>
                        Build calculation
                    </button>
                </div>
                <div className="govuk-panel govuk-panel--confirmation"
                     hidden={!additionalCalculationBuildSuccess.buildSuccess}>
                    <div className="govuk-panel__body">
                        Build successful
                    </div>
                </div>
                <div
                    className={"govuk-form-group" + ((additionalCalculationBuildSuccess.compileRun && !additionalCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <div
                        className="govuk-body">Your calculation’s build output must be successful before you can save it
                    </div>
                </div>
                <div hidden={(!additionalCalculationBuildSuccess.compileRun && !additionalCalculationBuildSuccess.buildSuccess) || (additionalCalculationBuildSuccess.compileRun && additionalCalculationBuildSuccess.buildSuccess)}
                    className={"govuk-form-group" + ((additionalCalculationBuildSuccess.compileRun && !additionalCalculationBuildSuccess.buildSuccess) ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="build-output">
                        Build output
                    </label>
                    <div className="govuk-error-summary">
                        <h2 className="govuk-error-summary__title">
                            There was a compilation error
                        </h2>
                        <div className="govuk-error-summary__body">
                            <ul className="govuk-error-summary__list">
                                {additionalCalculationBuildSuccess.previewResponse.compilerOutput.compilerMessages.map(cm =>
                                    <li>{cm.message}</li>)}
                                <li hidden={errorMessage.length === 0}>{errorMessage}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                        onClick={submitAdditionalCalculation}
                        disabled={!additionalCalculationBuildSuccess.buildSuccess} type={"button"}>
                    Save and continue
                </button>
                <Link to={`/ViewSpecification/${specificationId}`} className="govuk-button govuk-button--secondary"
                   data-module="govuk-button">
                    Cancel
                </Link>
            </fieldset>
        </div>
    </div>
}
