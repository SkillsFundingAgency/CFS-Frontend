import { AxiosError } from "axios";
import { convertCamelCaseToSpaceDelimited } from "helpers/stringHelper";
import React, { useEffect, useMemo, useState } from "react";
import { QueryClient, useMutation } from "react-query";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { CalculationResultsLink } from "../../components/Calculations/CalculationResultsLink";
import {
  CalculationSourceCode,
  CalculationSourceCodeState,
} from "../../components/Calculations/CalculationSourceCode";
import { CircularReferenceErrorSummary } from "../../components/CircularReferenceErrorSummary";
import { ConfirmationPanel } from "../../components/ConfirmationPanel";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { InlineError } from "../../components/InlineError";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { useCalculation } from "../../hooks/Calculations/useCalculation";
import { useCalculationCircularDependencies } from "../../hooks/Calculations/useCalculationCircularDependencies";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useCharacterSubstitution } from "../../hooks/useCharacterSubstitution";
import { useConfirmLeavePage } from "../../hooks/useConfirmLeavePage";
import { useErrors } from "../../hooks/useErrors";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import {
  UpdateCalculationRequest,
  updateCalculationService,
  updateCalculationStatusService,
} from "../../services/calculationService";
import { CalculationDetails } from "../../types/CalculationDetails";
import { UpdateCalculationViewModel } from "../../types/Calculations/CreateAdditonalCalculationViewModel";
import { CalculationType } from "../../types/CalculationSearchResponse";
import { Permission } from "../../types/Permission";
import { PublishStatus, PublishStatusModel } from "../../types/PublishStatusModel";
import { Section } from "../../types/Sections";
import { ValueType } from "../../types/ValueType";

export interface EditorProps {
  excludeMonacoEditor?: boolean;
}

export interface EditCalculationRouteProps {
  calculationId: string;
}

export function EditCalculation({
  match,
  excludeMonacoEditor,
}: RouteComponentProps<EditCalculationRouteProps> & EditorProps) {
  const calculationId = match.params.calculationId;
  const [specificationId, setSpecificationId] = useState<string>("");
  const [calculation, setCalculation] = useState<CalculationDetails | undefined>();
  const { errors, addError, clearErrorMessages } = useErrors();
  const { userId, hasPermission, missingPermissions, isPermissionsFetched } = useSpecificationPermissions(
    specificationId,
    [Permission.CanEditCalculations, Permission.CanApproveCalculations, Permission.CanApproveAnyCalculations]
  );
  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({ error: err, description: "Error while loading specification" })
  );

  const canCreateAdditionalCalculation = useMemo(
    () => hasPermission && hasPermission(Permission.CanEditCalculations),
    [isPermissionsFetched]
  );
  const canApproveCalculation = useMemo(
    () =>
      hasPermission &&
      calculation &&
      (hasPermission(Permission.CanApproveAnyCalculations) ||
        (hasPermission(Permission.CanApproveCalculations) && calculation.author?.id !== userId)),
    [isPermissionsFetched, calculation]
  );

  const queryClient = new QueryClient();
  const updateCalculation = useMutation(
    (request: UpdateCalculationRequest) => updateCalculationService(request),
    {
      onError: (err) =>
        addError({ error: err as AxiosError, description: "Error while trying to update calculation" }),
      onSuccess: async (response) => {
        const calc = await response.data;
        setCalculation(calc);
        queryClient.setQueryData(`calculation-${calc.id}`, calc);
      },
    }
  );
  const { isLoadingCalculation } = useCalculation(
    calculationId,
    (err) => addError({ error: err, description: "Error while loading calculation" }),
    (data) => setCalculation(data)
  );
  const { circularReferenceErrors, isLoadingCircularDependencies } = useCalculationCircularDependencies(
    specificationId,
    (err) => addError({ error: err, description: "Error while checking for circular reference errors" })
  );
  const [isApproving, setIsApproving] = useState(false);
  const [calculationState, setCalculationState] = useState<CalculationSourceCodeState | undefined>();
  const [calculationPublishStatus, setCalculationPublishStatus] = useState<PublishStatus | undefined>();
  const [calculationValueType, setCalculationValueType] = useState<ValueType | undefined>();
  document.title = `Edit ${calculation ? calculation.calculationType : ""} Calculation - Calculate Funding`;

  const onCalculationChange = async (state: CalculationSourceCodeState) => {
    setCalculationState(state);
    if (state.errorMessage.length > 0) {
      addError({
        error: "An error occured related to the calculation source code",
        fieldName: "source-code",
      });
    }
  };

  const onSaveCalculation = async () => {
    if (!calculationState || !calculation || !calculation.valueType) {
      return;
    } else if (calculationState.isDirty && !calculationState.calculationBuild.hasCodeBuiltSuccessfully) {
      addError({
        error: "Please build your calculation source code to check it is valid",
        description: "Unvalidated source code",
        fieldName: "source-code",
      });
      return;
    }

    clearErrorMessages();

    const updateCalculationViewModel: UpdateCalculationViewModel = {
      calculationName: additionalCalculationName,
      valueType: calculationValueType ?? calculation.valueType,
      sourceCode: calculationState.sourceCode,
      dataType: calculation.dataType,
    };

    await updateCalculation.mutate({ updateCalculationViewModel, specificationId, calculationId });
  };

  const onApproveCalculation = async () => {
    setIsApproving(true);
    clearErrorMessages();

    try {
      if (canApproveCalculation) {
        const response = await updateCalculationStatusService(
          PublishStatus.Approved,
          specificationId,
          calculationId
        );
        if (response.status === 200) {
          setCalculationPublishStatus((response.data as PublishStatusModel).publishStatus);
        } else {
          addError({ error: response.data, description: "Calculation approval was rejected" });
        }
      } else {
        addError({
          error: "Permissions",
          description: "Calculation can not be approved by calculation writer",
          fieldName: "calculation-status",
        });
      }
    } catch (e: any) {
      addError({
        error: e,
        description: "There is a problem, calculation can not be approved, please try again. ",
      });
    } finally {
      setIsApproving(false);
    }
  };

  useEffect(() => {
    if (calculation) {
      setSpecificationId(calculation.specificationId);
      setCalculationPublishStatus(calculation.publishStatus);
      setCalculationValueType(calculation.valueType);
      setAdditionalCalculationName(calculation.name);
    }
  }, [calculation]);

  if (circularReferenceErrors && circularReferenceErrors.length > 0) {
    window.scrollTo(0, 0);
  }

  useConfirmLeavePage(
    !updateCalculation.isLoading && calculationState !== undefined && calculationState.isDirty
  );

  const subtitle =
    calculation?.calculationType === CalculationType.Template
      ? `Calculation ID: ${calculation.templateCalculationId}`
      : "Calculation name";
  const { substitution, substituteCharacters } = useCharacterSubstitution();
  const [additionalCalculationName, setAdditionalCalculationName] = useState<string>("");

  return (
    <Main location={Section.Specifications}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Specifications"} url={"/SpecificationsList"} />
        {specification && (
          <Breadcrumb name={specification.name} url={`/ViewSpecification/${specification.id}`} />
        )}
        <Breadcrumb name={`Edit ${calculation?.calculationType?.toLowerCase()} calculation`} />
      </Breadcrumbs>

      <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />
      <MultipleErrorSummary errors={errors} />

      {(isApproving || updateCalculation.isLoading) && calculation && (
        <LoadingStatus
          title={
            isLoadingSpecification || isLoadingCalculation
              ? "Loading"
              : updateCalculation.isLoading
              ? `Saving ${calculation.calculationType} calculation`
              : `Approving ${calculation.calculationType} calculation`
          }
          subTitle={isLoadingSpecification ? "Please wait" : "Please wait whilst the calculation is updated"}
        />
      )}

      <ConfirmationPanel title={"Save successful"} hidden={!updateCalculation.isSuccess || isApproving}>
        Your changes have been saved
      </ConfirmationPanel>

      <fieldset className="govuk-fieldset" hidden={updateCalculation.isLoading || isApproving}>
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
          <span className="govuk-caption-l">{subtitle}</span>
          {calculation?.calculationType == CalculationType.Template && (
            <h2 id="calculation-name-title" className={"govuk-heading-l"}>
              {calculation ? calculation.name : <LoadingFieldStatus title="Loading..." />}
            </h2>
          )}
        </legend>
        {calculation?.calculationType == CalculationType.Additional && (
          <div className="govuk-form-group">
            <input
              className="govuk-input"
              id="calculation-name"
              name="calculation-name"
              type="text"
              pattern="[A-Za-z0-9]+"
              onChange={(e) => {
                setAdditionalCalculationName(e.target.value);
                substituteCharacters(e.target.value);
              }}
              value={additionalCalculationName}
            />
          </div>
        )}
        {substitution.length > 0 && <span className="govuk-caption-m">Source code name: {substitution}</span>}
        <InlineError fieldName={"calculation-name"} errors={errors} />

        <div
          id="calculation-status"
          className={
            "govuk-grid-row govuk-!-margin-bottom-2 govuk-form-group" +
            (errors.some((err) => err.fieldName === "calculation-status") ? " govuk-form-group--error" : "")
          }
        >
          <span className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span>{" "}
            {errors.find((err) => err.fieldName === "calculation-status")}
          </span>
          <div className="govuk-grid-column-full">
            <dl className="govuk-summary-list govuk-summary-list--no-border">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Calculation status</dt>
                <dd className="govuk-summary-list__value">
                  <strong className="govuk-tag govuk-tag--green govuk-!-margin-top-2 calc-status">
                    {calculationPublishStatus ? (
                      calculationPublishStatus
                    ) : (
                      <LoadingFieldStatus title="Loading..." />
                    )}
                  </strong>
                </dd>
              </div>

              {calculation?.calculationType === CalculationType.Template && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Calculation type</dt>
                  <dd className="govuk-summary-list__value">
                    <span>{convertCamelCaseToSpaceDelimited(calculation.templateCalculationType || "")}</span>
                  </dd>
                </div>
              )}

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Value type</dt>
                <dd className="govuk-summary-list__value">
                  {calculation ? (
                    <>
                      <select
                        className="govuk-select"
                        onChange={(e) => setCalculationValueType(e.target.value as ValueType)}
                        hidden={calculation.calculationType === CalculationType.Template}
                        value={calculationValueType}
                      >
                        <option value={ValueType.Percentage}>Percentage</option>
                        <option value={ValueType.Currency}>Currency</option>
                        <option value={ValueType.Number}>Number</option>
                      </select>
                      <span hidden={calculation.calculationType === CalculationType.Additional}>
                        {calculation.valueType}
                      </span>
                    </>
                  ) : (
                    <LoadingFieldStatus title="Loading..." />
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {isLoadingCircularDependencies && (
          <LoadingFieldStatus title="Checking for circular reference errors" />
        )}
        {!isLoadingCircularDependencies && circularReferenceErrors && (
          <CircularReferenceErrorSummary errors={circularReferenceErrors} defaultSize={3} />
        )}

        {calculation && specification && (
          <CalculationSourceCode
            excludeMonacoEditor={excludeMonacoEditor === true}
            specificationId={specificationId}
            calculationName={calculation.name}
            calculationType={calculation.calculationType}
            dataType={calculation.dataType}
            fundingStreams={specification.fundingStreams}
            onChange={onCalculationChange}
            originalSourceCode={calculation.sourceCode}
            calculationId={calculationId}
          />
        )}

        <CalculationResultsLink calculationId={calculationId} />

        {calculationState &&
          calculationState.isDirty &&
          !calculationState?.calculationBuild.hasCodeBuiltSuccessfully && (
            <div
              className={
                "govuk-form-group" +
                (calculationState.isDirty && !calculationState.calculationBuild.hasCodeBuiltSuccessfully
                  ? " govuk-form-group--error"
                  : "")
              }
            >
              <div className="govuk-body">
                Your calculation’s build output must be successful before you can save it
              </div>
            </div>
          )}

        {calculationState && calculationState.isDirty && (
          <div className="govuk-form-group">
            <div className="govuk-body">Your calculation must be saved before you can approve it</div>
          </div>
        )}

        <div className="govuk-grid-row govuk-!-margin-top-9">
          <div className="govuk-grid-column-two-thirds">
            <button
              className="govuk-button govuk-!-margin-right-1"
              data-module="govuk-button"
              onClick={onSaveCalculation}
              disabled={
                !calculationState ||
                !calculationState.calculationBuild.hasCodeBuiltSuccessfully ||
                updateCalculation.isLoading ||
                !canCreateAdditionalCalculation
              }
            >
              Save and continue
            </button>

            <button
              className="govuk-button govuk-!-margin-right-1"
              data-module="govuk-button"
              onClick={onApproveCalculation}
              disabled={
                (calculationState && calculationState.isDirty) ||
                !calculation ||
                calculationPublishStatus === PublishStatus.Approved ||
                !canApproveCalculation
              }
            >
              Approve
            </button>

            <Link
              to={`/ViewSpecification/${specificationId}`}
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
            >
              Cancel
            </Link>
          </div>
        </div>

        {calculation && (
          <p id="last-saved-date" className={"govuk-body"}>
            Last saved <DateTimeFormatter date={calculation.lastUpdated} />
          </p>
        )}

        <div className={"govuk-form-group"}>
          <Link className="govuk-body" to={`/Calculations/CalculationVersionHistory/${calculationId}`}>
            View calculation history
          </Link>
        </div>
      </fieldset>
    </Main>
  );
}
