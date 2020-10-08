import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {EditSpecificationViewModel} from "../../types/Specifications/EditSpecificationViewModel";
import {CalculationTypes, CreateAdditionalCalculationViewModel} from "../../types/Calculations/CreateAdditonalCalculationViewModel";
import {compileCalculationPreviewService, createAdditionalCalculationService} from "../../services/calculationService";
import {Calculation} from "../../types/CalculationSummary";
import {CompilerOutputViewModel, PreviewResponse, SourceFile} from "../../types/Calculations/PreviewResponse";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {GdsMonacoEditor} from "../../components/GdsMonacoEditor";
import {Footer} from "../../components/Footer";
import {CompliationErrorMessageList} from "../../components/Calculations/CompliationErrorMessageList";

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
        templateIds: {"": [""]}
    });
    const [additionalCalculationName, setAdditionalCalculationName] = useState<string>("");
    const [additionalCalculationType, setAdditionalCalculationType] = useState<CalculationTypes>(CalculationTypes.Percentage);
    const [additionalCalculationSourceCode, setAdditionalCalculationSourceCode] = useState<string>("");
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
    const [additionalCalculationBuildSuccess, setAdditionalCalculationBuildSuccess] = useState<CompilerOutputViewModel>(initialBuildSuccess);
    const [formValidation, setFormValid] = useState({formValid: false, formSubmitted: false});
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [nameErrorMessage, setNameErrorMessage] = useState("")
    const [isBuildingCalculationCode, setIsBuildingCalculationCode] = useState<boolean>(false);

    let history = useHistory();

    useEffectOnce(() => {
        getSpecificationSummaryService(specificationId)
            .then((result) => {
                const specificationResult = result.data as EditSpecificationViewModel;
                setSpecificationSummary(specificationResult);
            });
    });

    function submitAdditionalCalculation() {
        if (additionalCalculationSourceCode === "" || !additionalCalculationBuildSuccess.buildSuccess) {
            setFormValid({formSubmitted: true, formValid: false});
        } else if (additionalCalculationName === "" || additionalCalculationName.length < 4 || additionalCalculationName.length > 180) {
            setNameErrorMessage("Please use a name between 4 and 180 characters");
            setFormValid({formSubmitted: true, formValid: false});
        } else if ((additionalCalculationName.length >= 4 && additionalCalculationName.length <= 180) && additionalCalculationSourceCode !== "" && additionalCalculationBuildSuccess.buildSuccess && additionalCalculationBuildSuccess.compileRun) {
            setFormValid({formSubmitted: true, formValid: true});
            setNameErrorMessage("");
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
                    history.push(`/ViewSpecification/${response.specificationId}`);
                } else {
                    setErrorMessage(result.data);
                    setFormValid(prevState => {
                        return {...prevState, formSubmitted: true, formValid: false}
                    });
                    setIsLoading(false);
                }
            }).catch((ex) => {
                setErrorMessage(ex.response.data);
                setFormValid({formSubmitted: true, formValid: false});
                setIsLoading(false);
            });
        } else {
            setFormValid({formSubmitted: true, formValid: false})
        }
    }

    function buildCalculation() {
        setIsBuildingCalculationCode(true);
        setAdditionalCalculationBuildSuccess(initialBuildSuccess);
        compileCalculationPreviewService(specificationId, 'temp-calc-id', additionalCalculationSourceCode).then((result) => {
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

            setIsBuildingCalculationCode(false);
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
    }

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specificationSummary.name} url={`/ViewSpecification/${specificationSummary.id}`}/>
                <Breadcrumb name={"Create additional calculation"}/>
            </Breadcrumbs>

            <LoadingStatus title={"Creating additional calculation"} hidden={!isLoading}
                           subTitle={"Please wait whilst the calculation is created"}/>
            <fieldset className="govuk-fieldset" hidden={isLoading}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 className="govuk-fieldset__heading">
                        Create additional calculation
                    </h1>
                </legend>
                <div id="calculation-status"
                     className="govuk-form-group">
                    <span className="govuk-caption-m">Calculation status</span>
                    <strong className="govuk-tag govuk-tag--green govuk-!-margin-top-2">Draft</strong>
                </div>
                <div className={"govuk-form-group" + (nameErrorMessage.length > 0 ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="address-line-1">
                        Calculation name
                    </label>
                    <input className="govuk-input" id="calculation-name" name="calculation-name" type="text" pattern="[A-Za-z0-9]+"
                           onChange={(e) => setAdditionalCalculationName(e.target.value)}/>
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
                    <GdsMonacoEditor
                        value={additionalCalculationSourceCode}
                        change={updateSourceCode}
                        language={'vb'}
                        minimap={false}
                        specificationId={specificationId}
                        calculationType={"AdditionalCalculation"}
                        calculationName={additionalCalculationName}/>
                    <button data-prevent-double-click="true" className="govuk-button" data-module="govuk-button"
                            onClick={buildCalculation} disabled={isBuildingCalculationCode}>
                        Build calculation
                    </button>
                    <LoadingFieldStatus title={"Building source code"} hidden={!isBuildingCalculationCode}/>
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
                    <CompliationErrorMessageList
                        compilerMessages={additionalCalculationBuildSuccess.previewResponse.compilerOutput.compilerMessages}
                        errorMessage={errorMessage}
                    />
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
        <Footer/>
    </div>
}
