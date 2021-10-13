import "../../../styles/search-filters.scss";

import { prop, sortBy } from "ramda";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import Form from "../../../components/Form";
import { LoadingStatusNotifier } from "../../../components/LoadingStatusNotifier";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../../components/PermissionStatus";
import { CreateDatasetWorkflowState } from "../../../context/states";
import { useAppContext } from "../../../context/useAppContext";
import { convertCamelCaseToSpaceDelimited } from "../../../helpers/stringHelper";
import { useSpecificationPermissions } from "../../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../../hooks/useErrors";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import * as datasetService from "../../../services/datasetService";
import { CreateDatasetSpecificationRelationshipRequest } from "../../../types/Datasets/CreateDatasetSpecificationRelationshipRequest";
import { DatasetRelationshipType } from "../../../types/Datasets/DatasetRelationshipType";
import { PublishedSpecificationTemplateMetadata } from "../../../types/Datasets/PublishedSpecificationTemplateMetadata";
import { TemplateItemType } from "../../../types/Datasets/TemplateItemType";
import { Permission } from "../../../types/Permission";
import { Section } from "../../../types/Sections";
import { CreateDatasetRouteProps } from "./SelectDatasetTypeToCreate";

export function ConfirmDatasetToCreate({ match }: RouteComponentProps<CreateDatasetRouteProps>) {
  const forSpecId: string = match.params.forSpecId;
  const { errors, addError, clearErrorMessages } = useErrors();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { state } = useAppContext();
  const { isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions } =
    useSpecificationPermissions(forSpecId as string, [Permission.CanEditSpecification]);
  const { specification: forSpec } = useSpecificationSummary(forSpecId as string, (err) =>
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

  async function createDataset(model: CreateDatasetWorkflowState): Promise<boolean> {
    if (
      !model ||
      !model.forSpecId ||
      !model.referencingSpec ||
      !model.datasetName ||
      !model.datasetDescription ||
      !model.selectedItems
    ) {
      return false;
    }

    setIsSaving(true);
    try {
      const request = {
        specificationId: model.forSpecId,
        targetSpecificationId: model.referencingSpec?.specificationId,
        relationshipType: DatasetRelationshipType.ReleasedData,
        name: model.datasetName,
        description: model.datasetDescription,
        fundingLineIds: model.selectedItems
          ?.filter((i) => i.type === TemplateItemType.FundingLine)
          .map((i) => i.templateId),
        calculationIds: model.selectedItems
          ?.filter((i) => i.type === TemplateItemType.Calculation)
          .map((i) => i.templateId),
      } as CreateDatasetSpecificationRelationshipRequest;
      await datasetService.createDatasetFromReleased(request);
      return true;
    } catch (e: any) {
      addError({
        error: e,
        description: "Unexpected error while creating data set",
      });
    } finally {
      setIsSaving(false);
    }
    return false;
  }

  const onSave = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    clearErrorMessages();

    if (
      !state?.createDatasetWorkflowState ||
      !state?.createDatasetWorkflowState?.datasetName?.length ||
      !state?.createDatasetWorkflowState?.datasetDescription?.length ||
      !state?.createDatasetWorkflowState?.selectedItems?.length
    ) {
      addError({
        error: "Some of your selections have gone missing",
        suggestion: "Please go back to change your selections",
      });
      return;
    }

    const success = await createDataset(state.createDatasetWorkflowState);

    if (success) {
      history.push(`/ViewSpecification/${forSpecId}?showDatasets=true`);
    }
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
        <Breadcrumb name="Data set details" url={`/Datasets/Create/SpecifyDatasetDetails/${forSpecId}`} />
        <Breadcrumb
          name="Select funding lines and calculations"
          url={`/Datasets/Create/SelectDatasetTemplateItems/${forSpecId}`}
        />
        <Breadcrumb name="Check data set" />
      </Breadcrumbs>
      <PermissionStatus
        requiredPermissions={missingPermissions}
        hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}
      />
      <section>
        {isSaving ? (
          <LoadingStatusNotifier
            notifications={[{ title: "Creating data set", description: "Please wait" }]}
          />
        ) : (
          <Form
            token="confirm-dataset"
            heading="Check funding lines/calculations before creating data set"
            onSubmit={onSave}
          >
            <DatasetDetails
              name={state.createDatasetWorkflowState?.datasetName}
              description={state.createDatasetWorkflowState?.datasetDescription}
              forSpecId={forSpecId}
            />
            {state.createDatasetWorkflowState?.selectedItems && (
              <DatasetTemplateItemSelections items={state.createDatasetWorkflowState?.selectedItems} />
            )}
            <Actions forSpecId={forSpecId} onSave={onSave} />
          </Form>
        )}
      </section>
    </Main>
  );
}

const DatasetDetails = (props: {
  forSpecId?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
}) => (
  <div className="govuk-grid-row govuk-!-margin-bottom-4">
    <div className="govuk-grid-column-two-thirds">
      <h2 className="govuk-heading-m">Dataset details</h2>
      <dl className="govuk-summary-list govuk-summary-list--no-border">
        <div className="govuk-summary-list__row govuk-!-width-one-third">
          <dt className="govuk-summary-list__key govuk-!-width-one-third">Name</dt>
          <dd className="govuk-summary-list__value govuk-!-padding-left-2">{props.name}</dd>
          <dd className="govuk-summary-list__actions">
            <Link className="govuk-link" to={`/Datasets/Create/SpecifyDatasetDetails/${props.forSpecId}`}>
              Change <span className="govuk-visually-hidden">dataset name</span>
            </Link>
          </dd>
        </div>
        <div className="govuk-summary-list__row govuk-!-width-one-third">
          <dt className="govuk-summary-list__key govuk-!-width-one-third">Description</dt>
          <dd className="govuk-summary-list__value govuk-!-padding-left-2">{props.description}</dd>
          <dd className="govuk-summary-list__actions">
            <Link className="govuk-link" to={`/Datasets/Create/SpecifyDatasetDetails/${props.forSpecId}`}>
              Change <span className="govuk-visually-hidden">dataset description</span>
            </Link>
          </dd>
        </div>
      </dl>
    </div>
  </div>
);

const TemplateItemRow = (props: { item: PublishedSpecificationTemplateMetadata }) => (
  <tr className="govuk-table__row">
    <td scope="row" className="govuk-table__header">
      {props.item.name}
    </td>
    <td className="govuk-table__cell">{convertCamelCaseToSpaceDelimited(props.item.type)}</td>
    <td className="govuk-table__cell">{props.item.templateId}</td>
  </tr>
);

const DatasetTemplateItemSelections = (props: { items: PublishedSpecificationTemplateMetadata[] }) => {
  const rows = sortBy(prop("name"))(props.items);

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <table className="govuk-table table-vertical-align" id="dataSetItems">
          <caption className="govuk-table__caption govuk-heading-m">
            Selected funding lines and calculations
          </caption>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header govuk-!-width-one-half">
                Name
              </th>
              <th scope="col" className="govuk-table__header">
                Structure
              </th>
              <th scope="col" className="govuk-table__header">
                ID
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {rows.map((item, idx) => (
              <TemplateItemRow key={idx} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Actions = (props: { forSpecId: string; onSave: (e: React.MouseEvent<HTMLButtonElement>) => void }) => (
  <div className="govuk-grid-row">
    <div className="govuk-grid-column-two-thirds">
      <h2 className="govuk-heading-m">Now create your data set</h2>
      <p className="govuk-body">
        By creating the data set the above funding line and calculations will be available for reference from
        this specification in your calculation scripts.
      </p>
      <div className="govuk-button-group">
        <button
          className="govuk-button govuk-!-margin-top-3"
          data-module="govuk-button"
          type="button"
          onClick={(e) => props.onSave(e as React.MouseEvent<HTMLButtonElement>)}
        >
          Create data set
        </button>
        <Link
          to={`/Datasets/Create/SelectDatasetTemplateItems/${props.forSpecId}`}
          className="govuk-button govuk-!-margin-top-3"
          data-module="govuk-button"
        >
          Change selection
        </Link>
      </div>
    </div>
  </div>
);
