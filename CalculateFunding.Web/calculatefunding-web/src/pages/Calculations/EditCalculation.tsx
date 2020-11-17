﻿import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {UpdateCalculationViewModel} from "../../types/Calculations/CreateAdditonalCalculationViewModel";
import {updateCalculationService, updateCalculationStatusService,} from "../../services/calculationService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PublishStatus, PublishStatusModel} from "../../types/PublishStatusModel";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {CalculationResultsLink} from "../../components/Calculations/CalculationResultsLink";
import {useConfirmLeavePage} from "../../hooks/useConfirmLeavePage";
import React, {useState} from "react";
import {Footer} from "../../components/Footer";
import {CircularReferenceErrorSummary} from "../../components/CircularReferenceErrorSummary";
import {DateFormatter} from "../../components/DateFormatter";
import {useErrors} from "../../hooks/useErrors";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useCalculation} from "../../hooks/Calculations/useCalculation";
import {useCalculationCircularDependencies} from "../../hooks/Calculations/useCalculationCircularDependencies";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";
import {PermissionStatus} from "../../components/PermissionStatus";
import {CalculationSourceCode, CalculationSourceCodeState} from "../../components/Calculations/CalculationSourceCode";

export interface EditorProps {
    excludeMonacoEditor?: boolean
}

export interface EditCalculationRouteProps {
    calculationId: string,
}


export function EditCalculation({match, excludeMonacoEditor}: RouteComponentProps<EditCalculationRouteProps> & EditorProps) {
    const calculationId = match.params.calculationId;
    const [specificationId, setSpecificationId] = useState<string>("");
    const {errors, addErrorMessage, clearErrorMessages} = useErrors();
    const {canEditCalculation, canApproveCalculation, missingPermissions} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.EditCalculations, SpecificationPermissions.ApproveCalculations]);
    const {specification, isLoadingSpecification} =
        useSpecificationSummary(specificationId, err => addErrorMessage(err.message, "Error while loading specification"));
    const {calculation, isLoadingCalculation} =
        useCalculation(calculationId, err => addErrorMessage(err.message, "Error while loading calculation"));
    const {circularReferenceErrors, isLoadingCircularDependencies} =
        useCalculationCircularDependencies(specificationId, err => addErrorMessage(err.message, "Error while checking for circular reference errors"));
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [calculationStatus, setCalculationStatus] = useState<PublishStatus | undefined>();
    const [isApproving, setIsApproving] = useState(false);
    const [calculationState, setCalculationState] = useState<CalculationSourceCodeState | undefined>();
    let history = useHistory();
    document.title = `Edit ${calculation?.calculationType} Calculation - Calculate Funding`;

    const onCalculationChange = async (state: CalculationSourceCodeState) => {
        setCalculationState(state);
        if (state.errorMessage.length > 0) {
            addErrorMessage(state.errorMessage, "An error occured related to the calculation source code", "source-code");
        }
    }

    const onSaveCalculation = async () => {
        if (!calculationState || !calculation || !calculation.valueType) {
            return;
        } else if (calculationState.isDirty && !calculationState.calculationBuild.hasCodeBuiltSuccessfully) {
            addErrorMessage("Please build your calculation source code to check it is valid", "Unvalidated source code", "source-code");
            return;
        }

        setIsSaving(true);

        let updateAdditionalCalculationViewModel: UpdateCalculationViewModel = {
            calculationName: calculation.name,
            valueType: calculation.valueType,
            sourceCode: calculationState.sourceCode,
        };

        updateCalculationService(updateAdditionalCalculationViewModel, specificationId, calculationId)
            .then((result) => {
                if (result.status === 200) {
                    history.go(0);
                } else {
                    addErrorMessage(result.data, "Failed to save calculation");
                    setIsSaving(false);
                }
            })
            .catch((err) => {
                addErrorMessage(err, "Failed to save calculation");
                setIsSaving(false);
            });
    }

    const onApproveCalculation = async () => {
        setIsApproving(true);
        clearErrorMessages();

        try {
            if (canApproveCalculation) {
                const response = await updateCalculationStatusService(PublishStatus.Approved, specificationId, calculationId);
                if (response.status === 200) {
                    setCalculationStatus((response.data as PublishStatusModel).publishStatus);
                } else {
                    addErrorMessage(response.data, "Calculation approval was rejected");
                }
            } else {
                addErrorMessage("Permissions", "Calculation can not be approved by calculation writer", "calculation-status");
            }
        } catch (e) {
            addErrorMessage("There is a problem, calculation can not be approved, please try again. " + e);
        } finally {
            setIsApproving(false);
        }
    }

    const initCalculationData = () => {
        if (!calculation || specificationId.length > 0) {
            return;
        }
        setSpecificationId(calculation.specificationId);
        setCalculationStatus(calculation.publishStatus);
    }

    if (circularReferenceErrors && circularReferenceErrors.length > 0) {
        window.scrollTo(0, 0);
    }

    initCalculationData();
    
    useConfirmLeavePage(!isSaving && calculationState !== undefined && calculationState.isDirty);

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                {specification &&
                <Breadcrumb name={specification.name} url={`/ViewSpecification/${specification.id}`}/>
                }
                <Breadcrumb name={`Edit ${calculation?.calculationType?.toLowerCase()} calculation`}/>
            </Breadcrumbs>
            
            <PermissionStatus requiredPermissions={missingPermissions} hidden={isLoadingCalculation || isLoadingSpecification}/>

            {(isApproving || isSaving) && calculation &&
            <LoadingStatus title={isSaving ? `Saving ${calculation.calculationType} calculation` : `Approving ${calculation.calculationType} calculation`} 
                           subTitle="Please wait whilst the calculation is updated" />
            }
            
            <MultipleErrorSummary errors={errors}/>

            <fieldset className="govuk-fieldset" hidden={isSaving || isApproving}>

                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <span className="govuk-caption-l">Calculation name</span>
                    <h2 id="calculation-name-title" className={"govuk-heading-l"}>
                        {!isLoadingCalculation && calculation ? calculation.name : <LoadingFieldStatus title="Loading..."/>}
                    </h2>
                </legend>

                <div id="calculation-status"
                     className={"govuk-grid-row govuk-!-margin-bottom-2 govuk-form-group" + (errors.some(err => err.fieldName === "calculation-status") ? " govuk-form-group--error" : "")}>
                    <span className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> {errors.find(err => err.fieldName === "calculation-status")}
                    </span>
                    <div className="govuk-grid-column-full">
                        <dl className="govuk-summary-list govuk-summary-list--no-border">
                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    Calculation status
                                </dt>
                                <dd className="govuk-summary-list__value">
                                    <strong className="govuk-tag govuk-tag--green govuk-!-margin-top-2 calc-status">
                                        {!isLoadingCalculation && calculationStatus ? calculationStatus : <LoadingFieldStatus title="Loading..."/>}
                                    </strong>
                                </dd>
                            </div>

                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    Value type
                                </dt>
                                <dd className="govuk-summary-list__value">
                                    {!isLoadingCalculation && calculation ? calculation.valueType : <LoadingFieldStatus title="Loading..."/>}
                                </dd>
                            </div>
                        </dl>

                    </div>
                </div>

                {isLoadingCircularDependencies &&
                <LoadingFieldStatus title="Checking for circular reference errors" />
                }
                {!isLoadingCircularDependencies && circularReferenceErrors &&
                <CircularReferenceErrorSummary errors={circularReferenceErrors} defaultSize={3}/>
                }
                
                {calculation && specification &&
                <CalculationSourceCode
                    excludeMonacoEditor={excludeMonacoEditor === true}
                    specificationId={specificationId}
                    calculationName={calculation.name}
                    calculationType={calculation.calculationType}
                    fundingStreams={specification.fundingStreams}
                    onChange={onCalculationChange}
                    originalSourceCode={calculation.sourceCode}
                />
                }

                <CalculationResultsLink calculationId={calculationId}/>

                {calculationState && calculationState.isDirty && !calculationState?.calculationBuild.hasCodeBuiltSuccessfully &&
                <div className={"govuk-form-group" +
                ((calculationState.isDirty && !calculationState.calculationBuild.hasCodeBuiltSuccessfully) ? " govuk-form-group--error" : "")}>
                    <div className="govuk-body">Your calculation’s build output must be successful before you can save it</div>
                </div>}

                {calculationState && calculationState.isDirty &&
                <div className="govuk-form-group">
                    <div className="govuk-body">Your calculation must be saved before you can approve it</div>
                </div>
                }

                <div className="govuk-grid-row govuk-!-margin-top-9">
                    <div className="govuk-grid-column-two-thirds">
                        <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                                onClick={onSaveCalculation}
                                disabled={!calculationState || !calculationState.calculationBuild.hasCodeBuiltSuccessfully || isSaving || !canEditCalculation}>
                            Save and continue
                        </button>

                        <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                                onClick={onApproveCalculation}
                                disabled={(calculationState && calculationState.isDirty) || !calculation || calculationStatus === PublishStatus.Approved || !canApproveCalculation}>
                            Approve
                        </button>

                        <Link to={`/ViewSpecification/${specificationId}`}
                              className="govuk-button govuk-button--secondary"
                              data-module="govuk-button">
                            Cancel
                        </Link>
                    </div>
                </div>

                {calculation &&
                <p id="last-saved-date" className={"govuk-body"}>
                    Last saved <DateFormatter date={calculation.lastUpdated} utc={false}/>
                </p>
                }

                <div className={"govuk-form-group"}>
                    <Link className="govuk-body" to={`/Calculations/CalculationVersionHistory/${calculationId}`}>View calculation history</Link>
                </div>

            </fieldset>
        </div>
        <Footer/>
    </div>
}
