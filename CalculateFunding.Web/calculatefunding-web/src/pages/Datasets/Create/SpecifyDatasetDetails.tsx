import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import Form from "../../../components/Form";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../../components/PermissionStatus";
import { useAppContext } from "../../../context/useAppContext";
import { useSpecificationPermissions } from "../../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../../hooks/useErrors";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import * as datasetApi from "../../../services/datasetService";
import { ErrorMessage } from "../../../types/ErrorMessage";
import { Permission } from "../../../types/Permission";
import { Section } from "../../../types/Sections";
import { CreateDatasetRouteProps } from "./SelectDatasetTypeToCreate";

export function SpecifyDatasetDetails({ match }: RouteComponentProps<CreateDatasetRouteProps>): JSX.Element {
  const forSpecId: string = match.params.forSpecId;
  const { errors, addError, addValidationErrorsAsIndividualErrors, clearErrorMessages } = useErrors();
  const { state, dispatch } = useAppContext();
  const criteria = state.createDatasetWorkflowState;
  const [datasetName, setDatasetName] = useState<string | undefined>(criteria?.datasetName);
  const [datasetDescription, setDatasetDescription] = useState<string | undefined>(
    criteria?.datasetDescription
  );
  const { isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions } =
    useSpecificationPermissions(criteria?.forSpecId as string, [Permission.CanEditSpecification]);
  const { specification: forSpec } = useSpecificationSummary(criteria?.forSpecId as string, (err) =>
    addError({
      error: err,
      description: "Error while loading specification",
    })
  );
  const history = useHistory();

  useEffect(() => {
    if (!state || state.createDatasetWorkflowState?.forSpecId !== forSpecId) {
      history.push(`/Datasets/Create/SelectDatasetTypeToCreate/${forSpecId}`);
    }
  }, [state, forSpecId]);

  const validateName = async (name: string | undefined) => {
    clearErrorMessages(["Name"]);

    if (!name?.length) {
      addError({ error: "Provide a data set name", fieldName: "Name" });
      return false;
    }

    try {
      await datasetApi.validateDefinitionForCreatingNewDataset({
        name: name as string,
        targetSpecificationId: criteria?.referencingSpec?.specificationId as string,
        specificationId: criteria?.forSpecId as string,
      });
    } catch (error: any) {
      const axiosError = error as AxiosError;
      if (axiosError && axiosError.response && axiosError.response.status === 400) {
        addValidationErrorsAsIndividualErrors({
          validationErrors: axiosError.response.data,
        });
      } else {
        addError({ error: error, description: "Unexpected error while validating data set name" });
      }
      return false;
    }
    return true;
  };

  const validateDescription = (description: string | undefined) => {
    clearErrorMessages(["dataset-description"]);

    if (description?.length) {
      return true;
    }

    addError({ error: "Provide a data set description", fieldName: "dataset-description" });
    return false;
  };

  const onDatasetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errors.some((e) => e.fieldName === "Name")) {
      clearErrorMessages(["Name"]);
    }
    setDatasetName(e.target.value);
  };

  const onDatasetDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (errors.some((e) => e.fieldName === "dataset-description")) {
      clearErrorMessages(["dataset-description"]);
    }
    setDatasetDescription(e.target.value);
  };

  const onSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    clearErrorMessages();

    const isDatasetNameValid = await validateName(datasetName);
    const isDatasetDescriptionValid = validateDescription(datasetDescription);

    if (isDatasetNameValid && isDatasetDescriptionValid) {
      dispatch({
        type: "setCreateDatasetWorkflowState",
        payload: { ...criteria, datasetName: datasetName, datasetDescription: datasetDescription },
      });
      history.push(`/Datasets/Create/SelectDatasetTemplateItems/${forSpecId}`);
    }
  };

  const onCancel = () => {
    history.push(`/Datasets/Create/SelectReferenceSpecification/${forSpecId}`);
  };

  return (
    <Main location={Section.Datasets}>
      <MultipleErrorSummary errors={errors} />
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url={"/"} />
        <Breadcrumb name="Specifications" url="/SpecificationsList" />
        <Breadcrumb name={forSpec ? forSpec.name : "Specification"} url={`/ViewSpecification/${forSpecId}`} />
        <Breadcrumb name="Data set type" url={`/Datasets/Create/SelectDatasetTypeToCreate/${forSpecId}`} />
        <Breadcrumb
          name="Funding stream and period"
          url={`/Datasets/Create/SelectReferenceSpecification/${forSpecId}`}
        />
        <Breadcrumb name="Create data set" />
      </Breadcrumbs>
      <PermissionStatus
        requiredPermissions={missingPermissions}
        hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}
      />
      <section>
        <Form token="create-dataset" heading="Create data set">
          <DatasetName
            datasetName={datasetName || ""}
            onDatasetNameChange={onDatasetNameChange}
            error={errors.find((e) => e.fieldName === "Name")}
          />
          <DatasetDescription
            datasetDescription={datasetDescription || ""}
            onDatasetDescriptionChange={onDatasetDescriptionChange}
            error={errors.find((e) => e.fieldName === "dataset-description")}
          />
          <Actions onContinue={onSubmit} onCancel={onCancel} />
        </Form>
      </section>
    </Main>
  );
}

const Actions = (props: { onContinue: (e: React.MouseEvent) => void; onCancel: () => void }) => (
  <div className="govuk-grid-row">
    <div className="govuk-grid-column-two-thirds">
      <button
        className="govuk-button govuk-!-margin-right-1"
        data-module="govuk-button"
        onClick={props.onContinue}
      >
        Continue
      </button>
      <button
        className="govuk-button govuk-button--secondary"
        data-module="govuk-button"
        onClick={props.onCancel}
      >
        Cancel
      </button>
    </div>
  </div>
);

const DatasetName = (props: {
  datasetName: string;
  onDatasetNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: ErrorMessage | undefined;
}) => {
  return (
    <div className={`govuk-form-group ${props.error ? "govuk-form-group--error" : ""}`}>
      <label className="govuk-label govuk-label" htmlFor="dataset-name">
        Data set name
      </label>
      {props.error ? (
        <span key={props.error.id} className="govuk-error-message govuk-!-margin-bottom-1">
          <span className="govuk-visually-hidden">Error:</span> {props.error.message}
        </span>
      ) : (
        <span id="dataset-name-hint" className="govuk-hint">
          Use a descriptive, unique name that other users will understand.
        </span>
      )}
      <input
        className="govuk-input"
        id="dataset-name"
        name="dataset-name"
        type="text"
        value={props.datasetName}
        onChange={props.onDatasetNameChange}
        aria-describedby="dataset-name-hint"
      />
    </div>
  );
};

const DatasetDescription = (props: {
  datasetDescription: string;
  onDatasetDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error: ErrorMessage | undefined;
}) => {
  return (
    <div className={`govuk-form-group ${props.error ? "govuk-form-group--error" : ""}`}>
      <label className="govuk-label govuk-label" htmlFor="dataset-description">
        Description
      </label>
      {props.error && (
        <span key={props.error.id} className="govuk-error-message govuk-!-margin-bottom-1">
          <span className="govuk-visually-hidden">Error:</span> {props.error.message}
        </span>
      )}
      <textarea
        className="govuk-textarea"
        id="dataset-description"
        name="dataset-description"
        value={props.datasetDescription}
        onChange={props.onDatasetDescriptionChange}
        rows={5}
      />
    </div>
  );
};
