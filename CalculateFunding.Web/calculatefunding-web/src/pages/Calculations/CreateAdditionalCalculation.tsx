import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {CreateAdditionalCalculationViewModel} from "../../types/Calculations/CreateAdditonalCalculationViewModel";
import {createAdditionalCalculationService} from "../../services/calculationService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Footer} from "../../components/Footer";
import {useErrors} from "../../hooks/useErrors";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {ValueType} from "../../types/ValueType";
import {PermissionStatus} from "../../components/PermissionStatus";
import {InlineError} from "../../components/InlineError";
import {CalculationSourceCode, CalculationSourceCodeState} from "../../components/Calculations/CalculationSourceCode";

export interface CreateAdditionalCalculationProps {
    excludeMonacoEditor?: boolean
}

export interface CreateAdditionalCalculationRouteProps {
    specificationId: string;
}

export function CreateAdditionalCalculation({match, excludeMonacoEditor}: RouteComponentProps<CreateAdditionalCalculationRouteProps> & CreateAdditionalCalculationProps) {
    const specificationId = match.params.specificationId;
    const {errors, addErrorMessage, clearErrorMessages} = useErrors();
    const {canCreateAdditionalCalculation, missingPermissions} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.CreateAdditionalCalculations]);
    const {specification, isLoadingSpecification} =
        useSpecificationSummary(specificationId,
            err => addErrorMessage(err.message, "Error while loading specification"));
    const [additionalCalculationName, setAdditionalCalculationName] = useState<string>("");
    const [additionalCalculationType, setAdditionalCalculationType] = useState<ValueType>(ValueType.Percentage);
    const [calculationState, setCalculationState] = useState<CalculationSourceCodeState | undefined>();
    const [isSaving, setIsSaving] = useState(false);
    document.title = `Create Additional Calculation - Calculate Funding`;

    let history = useHistory();

    const onCalculationChange = async (state: CalculationSourceCodeState) => {
        setCalculationState(state);
        if (state.errorMessage.length > 0) {
            addErrorMessage(state.errorMessage, "An error occured related to the calculation source code", "source-code");
        }
    }
    
    function onSaveCalculation() {
        if (!calculationState) {
            return;
        } else if (calculationState.isDirty && !calculationState.calculationBuild.hasCodeBuiltSuccessfully) {
            addErrorMessage("Please build your calculation source code to check it is valid", "Unvalidated source code", "source-code");
            return;
        } else if (additionalCalculationName === "" || additionalCalculationName.length < 4 || additionalCalculationName.length > 180) {
            addErrorMessage("Please use a name between 4 and 180 characters", "Invalid name", "calculation-name");
            return;
        } else {
            clearErrorMessages();
            setIsSaving(true);

            let createAdditionalCalculationViewModel: CreateAdditionalCalculationViewModel = {
                calculationName: additionalCalculationName,
                calculationType: additionalCalculationType,
                sourceCode: calculationState.sourceCode
            };

            createAdditionalCalculationService(createAdditionalCalculationViewModel, specificationId)
                .then((result) => {
                    history.push(`/ViewSpecification/${specificationId}`);
                })
                .catch((ex) => {
                    addErrorMessage(ex.response.data);
                    setIsSaving(false);
                });
        }
    }

    const loadingTitle = isLoadingSpecification ? "Loading specification" :
        isSaving ? "Creating additional calculation" : "";
    const loadingSubtitle = isLoadingSpecification ? "Please wait..." : isSaving ? "Please wait whilst the calculation is created" : "";

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                {specification &&
                <Breadcrumb name={specification.name} url={`/ViewSpecification/${specification.id}`}/>
                }
                <Breadcrumb name={"Create additional calculation"}/>
            </Breadcrumbs>

            <PermissionStatus requiredPermissions={missingPermissions} hidden={!specification}/>

            {(isLoadingSpecification || isSaving) &&
            <LoadingStatus title={loadingTitle} subTitle={loadingSubtitle}/>
            }

            <MultipleErrorSummary errors={errors}/>
            <fieldset className="govuk-fieldset" hidden={isSaving}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 id="page-heading" className="govuk-fieldset__heading">
                        Create additional calculation
                    </h1>
                </legend>
                <div className={"govuk-form-group" + (errors.some(e => e.fieldName === "calculation-name") ? " govuk-form-group--error" : "")}>
                    <label id="calculation-name-label" className="govuk-label" htmlFor="calculation-name">
                        Calculation name
                    </label>
                    <input className="govuk-input"
                           id="calculation-name"
                           name="calculation-name"
                           type="text"
                           pattern="[A-Za-z0-9]+"
                           onChange={(e) => setAdditionalCalculationName(e.target.value)}/>
                    <InlineError fieldName={"calculation-name"} errors={errors}/>
                </div>

                <div className="govuk-form-group">
                    <label id="calculation-value-label" role="calculation-value-label" className="govuk-label" htmlFor="calculation-value">
                        Value type
                    </label>
                    <select className="govuk-select"
                            id="calculation-value"
                            name="calculation-value"
                            onChange={(e) => setAdditionalCalculationType(e.target.value as ValueType)}>
                        <option value="Percentage">Percentage</option>
                        <option value="Number">Number</option>
                        <option value="Currency">Currency</option>
                    </select>
                </div>

                {specification &&
                <CalculationSourceCode
                    excludeMonacoEditor={excludeMonacoEditor === true}
                    specificationId={specificationId}
                    calculationName=""
                    calculationType="Additional"
                    fundingStreams={specification.fundingStreams}
                    onChange={onCalculationChange}
                    originalSourceCode={"Return 0"}
                />
                }

                {calculationState && calculationState.isDirty && !calculationState.calculationBuild.hasCodeBuiltSuccessfully &&
                <div className="govuk-form-group govuk-form-group--error">
                    <div className="govuk-body">Your calculation’s build output must be successful before you can save it</div>
                </div>
                }

                <div className="govuk-grid-row govuk-!-margin-top-9">
                    <div className="govuk-grid-column-two-thirds">
                        <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                                onClick={onSaveCalculation}
                                disabled={!calculationState || (calculationState.isDirty && !calculationState.calculationBuild.hasCodeBuiltSuccessfully) || isSaving || !canCreateAdditionalCalculation}>
                            Save and continue
                        </button>

                        <Link to={`/ViewSpecification/${specificationId}`}
                              className="govuk-button govuk-button--secondary"
                              data-module="govuk-button">
                            Cancel
                        </Link>
                    </div>
                </div>

            </fieldset>
        </div>
        <Footer/>
    </div>
}
