import "../../../styles/search-filters.scss";

import { AxiosError } from "axios";
import { prop, sortBy } from "ramda";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import Form from "../../../components/Form";
import { LoadingStatus } from "../../../components/LoadingStatus";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../../components/PermissionStatus";
import { useAppContext } from "../../../context/useAppContext";
import { convertCamelCaseToSpaceDelimited } from "../../../helpers/stringHelper";
import { useSpecificationPermissions } from "../../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../../hooks/useErrors";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import * as datasetService from "../../../services/datasetService";
import { EligibleSpecificationReferenceModel } from "../../../types/Datasets/EligibleSpecificationReferenceModel";
import { PublishedSpecificationTemplateMetadata } from "../../../types/Datasets/PublishedSpecificationTemplateMetadata";
import { Permission } from "../../../types/Permission";
import { Section } from "../../../types/Sections";
import { CreateDatasetRouteProps } from "./SelectDatasetTypeToCreate";

export function SelectDatasetTemplateItems({ match }: RouteComponentProps<CreateDatasetRouteProps>) {
  const forSpecId: string = match.params.forSpecId;
  const { errors, addError, clearErrorMessages } = useErrors();
  const { state, dispatch } = useAppContext();
  const criteria = state.createDatasetWorkflowState;
  const refSpec = criteria?.referencingSpec;
  const [selectedItems, setSelectedItems] = useState<PublishedSpecificationTemplateMetadata[]>([]);
  const [hideUnselected, setHideUnselected] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const { isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions } =
    useSpecificationPermissions(criteria?.forSpecId as string, [Permission.CanEditSpecification]);
  const { specification: forSpec } = useSpecificationSummary(criteria?.forSpecId as string, (err) =>
    addError({
      error: err,
      description: "Error while loading specification",
    })
  );
  const { data: templateItems, isLoading } = useQuery<PublishedSpecificationTemplateMetadata[], AxiosError>(
    `published-spec-template-metadata-${refSpec?.specificationId}`,
    () => fetchTemplateItems(refSpec?.specificationId),
    {
      enabled: !!refSpec?.specificationId,
      onError: (err) =>
        addError({
          error: err,
          description: "Could not load template data",
          suggestion: "Please try again later",
        }),
    }
  );
  const history = useHistory();

  const filteredItems = useMemo(() => {
    if (!templateItems?.length) return [];

    const filterItemsByName = (
      searchString: string | undefined,
      items: PublishedSpecificationTemplateMetadata[]
    ) => {
      if (!searchString?.length) return items;

      const regX = new RegExp(searchString + ".+$", "i");

      return items.filter((i) => i.name.search(regX) >= 0);
    };

    const filterItemsBySelectedStatus = (
      hideSelected: boolean,
      items: PublishedSpecificationTemplateMetadata[]
    ) => {
      if (!hideSelected) return items;

      return items.filter((i) => selectedItems.some((s) => s.templateId === i.templateId));
    };

    const searchFiltered = filterItemsBySelectedStatus(
      hideUnselected,
      filterItemsByName(searchText, templateItems)
    );

    return sortBy(prop("name"))(searchFiltered);
  }, [hideUnselected, templateItems, searchText]);

  useEffect(() => {
    if (!state || state.createDatasetWorkflowState?.forSpecId !== forSpecId) {
      history.push(`/Datasets/Create/SelectDatasetTypeToCreate/${forSpecId}`);
    }
  }, [state, forSpecId]);

  async function fetchTemplateItems(
    specificationId: string | undefined
  ): Promise<PublishedSpecificationTemplateMetadata[]> {
    if (!specificationId) return [];
    const response = await datasetService.getPublishedSpecificationTemplateMetadataForCreatingNewDataset(
      specificationId
    );
    return response.data;
  }

  function filterByName(text: string) {
    setSearchText(text.length > 0 ? text : undefined);
    setHideUnselected(false);
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    clearErrorMessages();
    if (!selectedItems?.length) {
      addError({ error: "Please make a selection" });
      return;
    }
    dispatch({
      type: "setCreateDatasetWorkflowState",
      payload: { ...criteria, selectedItems: selectedItems },
    });
    history.push(`/Datasets/Create/ConfirmDatasetToCreate/${forSpecId}`);
  };

  function onToggleItem(item: PublishedSpecificationTemplateMetadata) {
    setSelectedItems((existing) =>
      existing.find((i) => i.templateId === item.templateId)
        ? existing.filter((i) => i.templateId !== item.templateId)
        : [...existing, item]
    );
  }

  function onToggleHideUnselected() {
    setHideUnselected((prev) => !prev);
  }

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
        <Breadcrumb name="Select funding lines and calculations" />
      </Breadcrumbs>
      <PermissionStatus
        requiredPermissions={missingPermissions}
        hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}
      />
      <section>
        <Form
          token="select-template-items"
          heading="Select funding lines and calculations"
          onSubmit={onSubmit}
        >
          <ReferenceSpecificationDetails referenceSpecification={refSpec} />
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third position-sticky">
              <SearchBox onSearchTextChange={filterByName} />
              <FilterSelection onToggleHideUnselected={onToggleHideUnselected} isChecked={hideUnselected} />
              <Actions onContinue={onSubmit} />
            </div>
            <div className="govuk-grid-column-two-thirds">
              <TemplateItemGrid
                items={filteredItems}
                isLoading={isLoading}
                hideSelected={hideUnselected}
                selectedItems={selectedItems}
                onItemToggle={onToggleItem}
              />
            </div>
          </div>
        </Form>
      </section>
    </Main>
  );
}

const ReferenceSpecificationDetails = (props: {
  referenceSpecification: EligibleSpecificationReferenceModel | undefined;
}) => (
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
          <dd className="govuk-summary-list__value" role="definition" aria-labelledby="funding-stream-label">
            {props.referenceSpecification?.fundingStreamName}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key" id="funding-period-label">
            Funding period
          </dt>
          <dd className="govuk-summary-list__value" role="definition" aria-labelledby="funding-period-label">
            {props.referenceSpecification?.fundingPeriodName}
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
            {props.referenceSpecification?.specificationName}
          </dd>
        </div>
      </dl>
    </div>
  </div>
);

const SearchBox = (props: { onSearchTextChange: (text: string) => void }) => {
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
          <h4 className="govuk-heading-s govuk-!-margin-bottom-0"> Search</h4>
        </legend>
        <div className="govuk-form-group filterSearch">
          <label className="govuk-label filterLabel" htmlFor="filter-by-type">
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
};

const FilterSelection = (props: { isChecked: boolean; onToggleHideUnselected: () => void }) => (
  <div className="govuk-form-group filterbyContainer">
    <fieldset className="govuk-fieldset">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m filterbyHeading govuk-!-margin-bottom-0">
        <h4 className="govuk-heading-s govuk-!-margin-bottom-0"> Filter selection</h4>
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
);

const TemplateItemGrid = (props: {
  items: PublishedSpecificationTemplateMetadata[] | undefined;
  isLoading: boolean;
  hideSelected: boolean;
  selectedItems: PublishedSpecificationTemplateMetadata[] | undefined;
  onItemToggle: (item: PublishedSpecificationTemplateMetadata) => void;
}) => {
  if (props.isLoading) return <LoadingStatus title="Loading template items to select" />;

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
};

const TemplateItemRow = (props: {
  item: PublishedSpecificationTemplateMetadata;
  token: string;
  isSelected: boolean;
  onToggle: (item: PublishedSpecificationTemplateMetadata) => void;
}) => {
  function onChange() {
    props.onToggle(props.item);
  }

  return (
    <tr className="govuk-table__row">
      <td className="govuk-table__cell">
        <div className="govuk-checkboxes govuk-checkboxes--small">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input provider-checked table-input"
              id={props.token}
              name={props.token}
              type="checkbox"
              checked={props.isSelected}
              onChange={onChange}
            />
            <label className="govuk-label govuk-checkboxes__label" htmlFor={props.token}>
              {props.item.name}
            </label>
          </div>
        </div>
      </td>
      <td className="govuk-table__cell">{convertCamelCaseToSpaceDelimited(props.item.type)}</td>
      <td className="govuk-table__cell">{props.item.templateId}</td>
    </tr>
  );
};

const Actions = (props: { onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void }) => (
  <button className="govuk-button govuk-!-margin-top-3" data-module="govuk-button" onClick={props.onContinue}>
    Continue to summary
  </button>
);
