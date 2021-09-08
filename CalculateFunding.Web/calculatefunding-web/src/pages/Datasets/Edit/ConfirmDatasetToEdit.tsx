﻿import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";
import { useErrors } from "../../../hooks/useErrors";
import { Section } from "../../../types/Sections";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { Main } from "../../../components/Main";
import * as datasetService from "../../../services/datasetService";
import Form from "../../../components/Form";
import "../../../styles/search-filters.scss";
import { convertCamelCaseToSpaceDelimited } from "../../../helpers/stringHelper";
import { Link } from "react-router-dom";
import { prop, sortBy } from "ramda";
import { useAppContext } from "../../../context/useAppContext";
import { TemplateItemType } from "../../../types/Datasets/TemplateItemType";
import { DatasetTemplateMetadataWithType } from "../../../types/Datasets/DatasetMetadata";
import { UpdateDatasetSpecificationRelationshipRequest } from "../../../types/Datasets/UpdateDatasetSpecificationRelationshipRequest";
import { EditDescriptionModal } from "../../../components/TemplateBuilder/EditDescriptionModal";

export function ConfirmDatasetToEdit({
  match,
}: RouteComponentProps<{ relationshipId: string; specificationId: string }>) {
  const relationshipId: string = match.params.relationshipId;
  const updatingSpecId: string = match.params.specificationId;
  const { errors, addError, clearErrorMessages } = useErrors();
  const { state } = useAppContext();
  const settings = state.editDatasetWorkflowState;
  const [relationshipDescription, setRelationshipDescription] = useState<string | undefined>(
    settings?.relationshipDescription
  );
  const history = useHistory();

  useEffect(() => {
    if (!settings || settings.relationshipId !== relationshipId) {
      history.push(`/Datasets/${relationshipId}/Edit/${updatingSpecId}`);
      return;
    }
    setRelationshipDescription(settings.relationshipDescription);
  }, [settings, relationshipId]);

  async function updateDatasetRelationship(): Promise<boolean> {
    if (!settings || !settings.relationshipId || !settings.relationshipMetadata || !settings.selectedItems) {
      return false;
    }
    try {
      const request = {
        specificationId: settings.relationshipMetadata.currentSpecificationId,
        relationshipId: settings.relationshipId,
        description: relationshipDescription || settings.relationshipMetadata.relationshipDescription,
        fundingLineIds: settings.selectedItems
          ?.filter((i) => i.type === TemplateItemType.FundingLine)
          .map((i) => i.templateId),
        calculationIds: settings.selectedItems
          ?.filter((i) => i.type === TemplateItemType.Calculation)
          .map((i) => i.templateId),
      } as UpdateDatasetSpecificationRelationshipRequest;

      await datasetService.updateDatasetFromReleased(request);

      return true;
    } catch (e: any) {
      addError({
        error: e,
        description: "Unexpected error while updating data set",
      });
    }
    return false;
  }

  const onSave = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    clearErrorMessages();

    if (!settings || !settings.relationshipMetadata || !settings.selectedItems?.length) {
      addError({
        error: "Some of your selections have gone missing",
        suggestion: "Please go back to change your selections",
      });
      return;
    }

    const success = await updateDatasetRelationship();

    if (success) {
      history.push(
        `/ViewSpecification/${settings.relationshipMetadata.currentSpecificationId}?showDatasets=true`
      );
    }
  };

  const onRelationshipDescriptionChange = async (description: string) => {
    clearErrorMessages(["relationship-description"]);
    if (description?.length) {
      setRelationshipDescription(description);
    }
  };

  return (
    <Main location={Section.Datasets}>
      <MultipleErrorSummary errors={errors} />
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url={"/"} />
        <Breadcrumb name="Specifications" url="/SpecificationsList" />
        <Breadcrumb
          name={settings?.relationshipMetadata?.currentSpecificationName || "Specification"}
          url={`/ViewSpecification/${settings?.relationshipMetadata?.currentSpecificationId}`}
        />
        <Breadcrumb
          name="Edit selected funding lines and calculations"
          url={`/Datasets/${relationshipId}/Edit/${updatingSpecId}`}
        />
        <Breadcrumb name="Check data set" />
      </Breadcrumbs>
      <section>
        <Form token="confirm-dataset-changes" heading="Check funding lines and calculations">
          <RelationshipDetails
            name={settings?.relationshipMetadata?.relationshipName}
            description={relationshipDescription}
            setDescription={onRelationshipDescriptionChange}
            forSpecId={settings?.relationshipMetadata?.currentSpecificationId}
          />
          {settings?.selectedItems && <DatasetTemplateItemSelections items={settings.selectedItems} />}
          <Actions relationshipId={relationshipId} forSpecId={updatingSpecId} onSave={onSave} />
        </Form>
      </section>
    </Main>
  );
}

const RelationshipDetails = (props: {
  forSpecId?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  setDescription: (description: string) => Promise<void>;
}) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  return (
    <div className="govuk-grid-row govuk-!-margin-bottom-4">
      <div className="govuk-grid-column-two-thirds">
        <h2 className="govuk-heading-m">Dataset details</h2>
        <dl className="govuk-summary-list govuk-summary-list--no-border">
          <div className="govuk-summary-list__row govuk-!-width-one-third">
            <dt className="govuk-summary-list__key govuk-!-width-one-third">Name</dt>
            <dd className="govuk-summary-list__value govuk-!-padding-left-2">{props.name}</dd>
          </div>
          <div className="govuk-summary-list__row govuk-!-width-one-third">
            <dt className="govuk-summary-list__key govuk-!-width-one-third">Description</dt>
            <dd className="govuk-summary-list__value govuk-!-padding-left-2">{props.description}</dd>
            <dd className="govuk-summary-list__actions">
              <button className="govuk-link govuk-link--no-visited-state" type="button" onClick={toggleModal}>
                Change <span className="govuk-visually-hidden">dataset description</span>
              </button>
              <EditDescriptionModal
                originalDescription={props.description || ""}
                showModal={showModal}
                toggleModal={setShowModal}
                saveDescription={props.setDescription}
              />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

const TemplateItemRow = (props: { item: DatasetTemplateMetadataWithType }) => (
  <tr className="govuk-table__row">
    <td scope="row" className="govuk-table__header">
      {props.item.name}
    </td>
    <td className="govuk-table__cell">{convertCamelCaseToSpaceDelimited(props.item.type)}</td>
    <td className="govuk-table__cell">{props.item.templateId}</td>
  </tr>
);

const DatasetTemplateItemSelections = (props: { items: DatasetTemplateMetadataWithType[] }) => {
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

const Actions = (props: {
  relationshipId: string;
  forSpecId: string;
  onSave: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => (
  <div className="govuk-grid-row">
    <div className="govuk-grid-column-two-thirds">
      <h2 className="govuk-heading-m">Now update your data set</h2>
      <p className="govuk-body">
        By updating the data set the above funding line and calculations will be available for reference from
        this specification in your calculation scripts.
      </p>
      <p className="govuk-body">Those removed will no longer be available</p>
      <div className="govuk-button-group">
        <button
          className="govuk-button govuk-!-margin-top-3"
          data-module="govuk-button"
          onClick={props.onSave}
        >
          Update data set
        </button>
        <Link
          to={`/Datasets/${props.relationshipId}/Edit/${props.forSpecId}`}
          className="govuk-button govuk-!-margin-top-3"
          data-module="govuk-button"
        >
          Change selection
        </Link>
      </div>
    </div>
  </div>
);
