import "../../../styles/search-filters.scss";

import { AxiosError } from "axios";
import { assoc, curry, map, prop, sortBy, union } from "ramda";
import React, { ChangeEvent, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import Form from "../../../components/Form";
import { LoadingStatus } from "../../../components/LoadingStatus";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../../components/PermissionStatus";
import { EditDescriptionModal } from "../../../components/TemplateBuilder/EditDescriptionModal";
import { useAppContext } from "../../../context/useAppContext";
import { convertCamelCaseToSpaceDelimited } from "../../../helpers/stringHelper";
import { useSpecificationPermissions } from "../../../hooks/Permissions/useSpecificationPermissions";
import { useConfirmLeavePage } from "../../../hooks/useConfirmLeavePage";
import { useErrors } from "../../../hooks/useErrors";
import * as datasetService from "../../../services/datasetService";
import {
  DatasetTemplateMetadata,
  DatasetTemplateMetadataWithType,
} from "../../../types/Datasets/DatasetMetadata";
import { ReferencedSpecificationRelationshipMetadata } from "../../../types/Datasets/ReferencedSpecificationRelationshipMetadata";
import { TemplateItemType } from "../../../types/Datasets/TemplateItemType";
import { Permission } from "../../../types/Permission";
import { Section } from "../../../types/Sections";

export function EditDatasetReferencingReleased({
  match,
}: RouteComponentProps<{ relationshipId: string; specificationId: string }>): JSX.Element {
  const relationshipId: string = match.params.relationshipId;
  const updatingSpecId: string = match.params.specificationId;
  const { errors, addError, clearErrorMessages } = useErrors();
  const { dispatch } = useAppContext();
  const [selectedItems, setSelectedItems] = useState<DatasetTemplateMetadataWithType[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [hideUnselected, setHideUnselected] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [relationshipDescription, setRelationshipDescription] = useState<string | undefined>();
  const { data: relationshipMetadata, isLoading: isLoadingRelationshipMetadata } = useQuery<
    ReferencedSpecificationRelationshipMetadata,
    AxiosError
  >(
    `ref-spec-relationship-metadata-${relationshipId}`,
    async () =>
      (await datasetService.getReferencedSpecificationRelationshipMetadata(updatingSpecId, relationshipId))
        .data,
    {
      enabled: !!updatingSpecId && !!relationshipId,
      onError: (err) =>
        addError({
          error: err,
          description: "Could not load template data",
          suggestion: "Please try again later",
        }),
    }
  );
  const { isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions } =
    useSpecificationPermissions(updatingSpecId as string, [Permission.CanEditSpecification]);
  const history = useHistory();
  const { disableMe: disableConfirmLeaveModal } = useConfirmLeavePage(isDirty);

  const setTemplateType = curry(
    (items: DatasetTemplateMetadata[], type: TemplateItemType): DatasetTemplateMetadataWithType[] =>
      map(assoc("type", type), items)
  );

  const templateItems: DatasetTemplateMetadataWithType[] = useMemo(() => {
    if (!relationshipMetadata) return [];

    const fundingLines = setTemplateType(
      relationshipMetadata.fundingLines || [],
      TemplateItemType.FundingLine
    );
    const calculations = setTemplateType(
      relationshipMetadata.calculations || [],
      TemplateItemType.Calculation
    );

    setRelationshipDescription(relationshipMetadata.relationshipDescription);

    setSelectedItems(
      union(
        fundingLines.filter((fl) => fl.isSelected),
        calculations.filter((c) => c.isSelected)
      )
    );

    return union(fundingLines, calculations);
  }, [relationshipMetadata]);

  const filteredItems: DatasetTemplateMetadataWithType[] = useMemo(() => {
    const filterItemsByName = (
      searchString: string | undefined,
      items: DatasetTemplateMetadataWithType[]
    ) => {
      if (!searchString?.length) return items;

      const regX = new RegExp(searchString + ".+$", "i");

      return items.filter((i) => i.name.search(regX) >= 0);
    };

    const filterItemsBySelectedStatus = (hideSelected: boolean, items: DatasetTemplateMetadataWithType[]) => {
      if (!hideSelected) return items;

      return items.filter((i) => selectedItems.some((s) => s.templateId === i.templateId));
    };

    const searchFiltered = filterItemsBySelectedStatus(
      hideUnselected,
      filterItemsByName(searchText, templateItems)
    );

    return sortBy(prop("name"))(searchFiltered);
  }, [hideUnselected, templateItems, searchText, selectedItems]);

  function filterByName(text: string) {
    setSearchText(text.length > 0 ? text : undefined);
    setHideUnselected(false);
  }

  const onSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    clearErrorMessages();

    if (!relationshipMetadata) return;
    if (!selectedItems?.length) {
      addError({ error: "Please make a selection" });
      return;
    }

    dispatch({
      type: "setEditDatasetWorkflowState",
      payload: {
        relationshipId: relationshipId,
        relationshipMetadata: relationshipMetadata,
        relationshipDescription: relationshipDescription,
        selectedItems: selectedItems,
      },
    });

    setIsDirty(false);
    disableConfirmLeaveModal();
    history.push(`/Datasets/${relationshipId}/ConfirmEdit/${updatingSpecId}`);
  };

  function onToggleItem(item: DatasetTemplateMetadataWithType) {
    setSelectedItems((existing) =>
      existing.find((i) => i.templateId === item.templateId)
        ? existing.filter((i) => i.templateId !== item.templateId)
        : [...existing, item]
    );
    setIsDirty(true);
  }

  function onToggleHideUnselected() {
    setHideUnselected((prev) => !prev);
  }

  const onRelationshipDescriptionChange = async (description: string) => {
    clearErrorMessages(["relationship-description"]);
    setRelationshipDescription(description);
    setIsDirty(true);
  };

  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name="Specifications" url="/SpecificationsList" />
        <Breadcrumb
          name={relationshipMetadata ? relationshipMetadata.currentSpecificationName : "Specification"}
          url={`/ViewSpecification/${updatingSpecId}`}
        />
      </Breadcrumbs>
      <PermissionStatus
        requiredPermissions={missingPermissions}
        hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}
      />
      <MultipleErrorSummary errors={errors} />
      <LoadingStatus title="Loading" hidden={!isLoadingRelationshipMetadata} />
      {relationshipMetadata && (
        <section>
          <Form token="edit-template-items" heading="Check funding lines and calculations">
            <RelationshipDetails
              name={relationshipMetadata.relationshipName}
              description={relationshipDescription}
              setDescription={onRelationshipDescriptionChange}
              forSpecId={relationshipMetadata?.currentSpecificationId}
            />
            <ReferencedSpecificationDetails
              fundingStreamName={relationshipMetadata.fundingStreamName}
              fundingPeriodName={relationshipMetadata.fundingPeriodName}
              refSpecificationName={relationshipMetadata.referenceSpecificationName}
            />
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third position-sticky">
                <SearchBox onSearchTextChange={filterByName} />
                <FilterSelection onToggleHideUnselected={onToggleHideUnselected} isChecked={hideUnselected} />
                <Actions onContinue={onSubmit} />
              </div>
              <div className="govuk-grid-column-two-thirds">
                <TemplateItemGrid
                  items={filteredItems}
                  hideSelected={hideUnselected}
                  selectedItems={selectedItems}
                  onItemToggle={onToggleItem}
                />
              </div>
            </div>
          </Form>
        </section>
      )}
    </Main>
  );
}

const RelationshipDetails = React.memo(
  (props: {
    forSpecId?: string | undefined;
    name: string;
    description: string | undefined;
    setDescription: (description: string) => Promise<void>;
  }) => {
    const [showModal, setShowModal] = useState(false);

    const toggleModal = () => {
      setShowModal((prev) => !prev);
    };

    return (
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l govuk-!-margin-bottom-2">{props.name}</span>
          <details className="govuk-details govuk-!-margin-top-3" data-module="govuk-details">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">What is {props.name}?</span>
            </summary>
            <div className="govuk-details__text">
              <p className="govuk-body">{props.description} </p>
              <button className="govuk-link govuk-link--no-visited-state" type="button" onClick={toggleModal}>
                Edit <span className="govuk-visually-hidden">dataset description</span>
              </button>
              <EditDescriptionModal
                originalDescription={props.description || ""}
                showModal={showModal}
                toggleModal={setShowModal}
                saveDescription={props.setDescription}
              />
            </div>
          </details>
        </div>
      </div>
    );
  }
);

const ReferencedSpecificationDetails = React.memo(
  (props: { fundingStreamName: string; fundingPeriodName: string; refSpecificationName: string }) => (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <dl
          className="govuk-summary-list govuk-summary-list__row--no-border"
          aria-label="referenced-specification-details"
        >
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key" id="funding-stream-label">
              Funding stream
            </dt>
            <dd
              className="govuk-summary-list__value"
              role="definition"
              aria-labelledby="funding-stream-label"
            >
              {props.fundingStreamName}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key" id="funding-period-label">
              Funding period
            </dt>
            <dd
              className="govuk-summary-list__value"
              role="definition"
              aria-labelledby="funding-period-label"
            >
              {props.fundingPeriodName}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key" id="referenced-specification-label">
              Reference specification
            </dt>
            <dd
              className="govuk-summary-list__value"
              role="definition"
              aria-labelledby="referenced-specification-label"
            >
              {props.refSpecificationName}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
);

const SearchBox = React.memo((props: { onSearchTextChange: (text: string) => void }) => {
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    if (!text?.length || text.length > 2) {
      props.onSearchTextChange(text);
    }
  }

  return (
    <div className="govuk-form-group filterbyContainer">
      <fieldset className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m filterbyHeading govuk-!-margin-bottom-0">
          <h4 className="govuk-heading-s govuk-!-padding-1 govuk-!-margin-bottom-0"> Search</h4>
        </legend>
        <div className="govuk-form-group filterSearch">
          <label className="filterLabel" htmlFor="filter-by-type">
            Search added funding lines or calculations
          </label>
          <input
            className="govuk-input filterSearchInput govuk-!-margin-bottom-2"
            onChange={onChange}
            id="searchSelected"
            autoComplete={"off"}
            name="searchSelected"
            type="text"
          />
        </div>
      </fieldset>
    </div>
  );
});

const FilterSelection = React.memo((props: { isChecked: boolean; onToggleHideUnselected: () => void }) => (
  <div className="govuk-form-group filterbyContainer">
    <fieldset className="govuk-fieldset">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m filterbyHeading govuk-!-margin-bottom-0">
        <h4 className="govuk-heading-s govuk-!-padding-1 govuk-!-margin-bottom-0"> Filter selection</h4>
      </legend>
      <div className="govuk-checkboxes govuk-checkboxes--small govuk-!-padding-2">
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input table-filter-jq"
            id="show-selected-only"
            name="show-selected-only"
            type="checkbox"
            checked={props.isChecked}
            onChange={props.onToggleHideUnselected}
            value=""
          />
          <label className="govuk-label govuk-checkboxes__label" htmlFor="filter">
            Show only selected
          </label>
        </div>
      </div>
    </fieldset>
  </div>
));

const TemplateItemGrid = React.memo(
  (props: {
    items: DatasetTemplateMetadataWithType[] | undefined;
    hideSelected: boolean;
    selectedItems: DatasetTemplateMetadataWithType[] | undefined;
    onItemToggle: (item: DatasetTemplateMetadataWithType) => void;
  }) => {
    if (!props.items?.length)
      return (
        <p className="govuk-body-m">{props.hideSelected ? "You have no items selected." : "No results"}</p>
      );

    return (
      <table
        className="govuk-table table-vertical-align"
        aria-label="Template items to select"
        id="dataSetItems"
      >
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header govuk-!-width-two-thirds">
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
          {props.items.map((item, idx) => (
            <TemplateItemRow
              key={idx}
              item={item}
              token={`template-item-${item.templateId}`}
              isSelected={
                !!props.selectedItems && props.selectedItems.some((i) => i.templateId === item.templateId)
              }
              onToggle={props.onItemToggle}
            />
          ))}
        </tbody>
      </table>
    );
  }
);

const TemplateItemRow = (props: {
  item: DatasetTemplateMetadataWithType;
  token: string;
  isSelected: boolean;
  onToggle: (item: DatasetTemplateMetadataWithType) => void;
}) => {
  function onChange() {
    props.onToggle(props.item);
  }

  return (
    <tr className="govuk-table__row">
      <td className="govuk-table__cell">
        <div className="govuk-checkboxes govuk-checkboxes--small">
          <div className="govuk-checkboxes__item">
            {!props.item.isUsedInCalculation && (
              <input
                className="govuk-checkboxes__input provider-checked table-input"
                id={props.token}
                name={props.token}
                type="checkbox"
                checked={props.isSelected}
                onChange={onChange}
              />
            )}
            <label className="govuk-label govuk-checkboxes__label" htmlFor={props.token}>
              {props.item.name}{" "}
              {props.item.isObsolete && <strong className="govuk-tag govuk-tag--red">Obsolete</strong>}
              {props.item.isUsedInCalculation && (
                <strong className="govuk-tag govuk-tag--red">Used in Calculation</strong>
              )}
            </label>
          </div>
        </div>
      </td>
      <td className="govuk-table__cell">{convertCamelCaseToSpaceDelimited(props.item.type)}</td>
      <td className="govuk-table__cell">{props.item.templateId}</td>
    </tr>
  );
};

const Actions = React.memo((props: { onContinue: (e: React.MouseEvent) => void }) => (
  <button className="govuk-button govuk-!-margin-top-3" data-module="govuk-button" onClick={props.onContinue}>
    Continue to summary
  </button>
));
