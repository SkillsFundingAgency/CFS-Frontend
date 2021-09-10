import { AxiosError } from "axios";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { RouteComponentProps, useHistory } from "react-router";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { ConfirmationPanel } from "../../../components/ConfirmationPanel";
import { PageHeaderFieldset } from "../../../components/Fieldset";
import { Footer } from "../../../components/Footer";
import Form from "../../../components/Form";
import { Header } from "../../../components/Header";
import { LoadingStatus } from "../../../components/LoadingStatus";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import RadioOption from "../../../components/RadioOption";
import { SelectionField, SelectionFieldOption } from "../../../components/SelectionField";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import { useErrors } from "../../../hooks/useErrors";
import { useFundingConfiguration } from "../../../hooks/useFundingConfiguration";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import {
  assignDatasetSchemaService,
  getDatasetsForFundingStreamService,
} from "../../../services/datasetService";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { AssignDatasetSchemaRequest } from "../../../types/Datasets/AssignDatasetSchemaRequest";
import { DataschemaDetailsViewModel } from "../../../types/Datasets/DataschemaDetailsViewModel";
import { Section } from "../../../types/Sections";

export interface CreateDatasetFromUploadRouteProps {
  specificationId: string;
}

export function CreateDatasetFromUpload({ match }: RouteComponentProps<CreateDatasetFromUploadRouteProps>) {
  const specificationId = match.params.specificationId;
  const history = useHistory();
  const { errors, addError, addValidationErrorsAsIndividualErrors, clearErrorMessages } = useErrors();
  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({
      error: err,
      description: "Error while loading specification",
    })
  );
  const fundingPeriodId = specification && specification?.fundingPeriod?.id;
  const fundingStreamId =
    (specification?.fundingStreams?.length && specification?.fundingStreams[0].id) || "";
  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    fundingStreamId,
    fundingPeriodId,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );
  const { data: dataSchemas, isLoading: isLoadingDataSchemas } = useQuery<
    DataschemaDetailsViewModel[],
    AxiosError
  >(
    `data-schemas-for-stream-${fundingStreamId}`,
    async () => (await getDatasetsForFundingStreamService(fundingStreamId ? fundingStreamId : "")).data,
    {
      enabled: fundingStreamId !== undefined,
      onError: (err) =>
        addError({
          error: err as AxiosError,
          description: "Error while loading available data schemas",
        }),
    }
  );
  const {
    mutate: assignDatasetSchema,
    isLoading: isUpdating,
    isSuccess,
  } = useMutation<boolean, AxiosError, AssignDatasetSchemaRequest>(
    async (request) => (await assignDatasetSchemaService(request)).data,
    {
      onError: (err) => {
        if (err?.response?.status === 400) {
          addValidationErrorsAsIndividualErrors({ validationErrors: err.response.data });
        } else {
          addError({ error: err, description: "Error while trying to assign dataset schema" });
        }
      },
      onSuccess: (data) => {
        if (andAnother) {
          clearFormData();
        } else {
          history.push(`/ViewSpecification/${specificationId}?showDatasets=true`);
        }
      },
    }
  );
  const [andAnother, setAndAnother] = useState<boolean>();
  const [isSetAsProviderData, setIsSetAsProviderData] = useState<boolean | undefined>(false);
  const [converterEligible, setConverterEligible] = useState<boolean>(false);
  const [converterEnabled, setConverterEnabled] = useState<boolean | undefined>(false);
  const [selectedDatasetName, setDatasetName] = useState<string>();
  const [datasetDescription, setDatasetDescription] = useState<string>();
  const [selectedDataSchema, setDatasetDataSchema] = useState<string>();

  document.title = "Create Data Set - Calculate funding";

  function changeDataSchema(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const selectedDefinition = dataSchemas?.filter((x) => x.id === value)[0];

    if (selectedDefinition) {
      setConverterEligible(selectedDefinition?.converterEligible ?? false);
    }

    if (validateDataSchema(value)) {
      setDatasetDataSchema(value);
    }
  }

  function validateDataSchema(value: string | undefined) {
    if (!value?.length) {
      addError({ error: "Select data schema", fieldName: "DatasetDefinitionId" });
      return false;
    }

    return true;
  }

  function changeDatasetName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (validateDatasetName(value)) {
      setDatasetName(value);
    }
  }

  function validateDatasetName(value: string | undefined) {
    if (!value?.length) {
      addError({ error: "Missing name", fieldName: "Name" });
      return false;
    }

    return true;
  }

  function changeDatasetDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;

    if (validateDatasetDescription(value)) {
      setDatasetDescription(value);
    }
  }

  function validateDatasetDescription(value: string | undefined) {
    if (!value?.length) {
      addError({ error: "Missing description", fieldName: "Description" });
      return false;
    }

    return true;
  }

  const saveDataset = async (continueAddingAfter: boolean) => {
    clearErrorMessages();

    const valid = checkSubmission();

    if (valid) {
      const request: AssignDatasetSchemaRequest = {
        name: selectedDatasetName as string,
        description: datasetDescription as string,
        datasetDefinitionId: selectedDataSchema as string,
        specificationId: specificationId,
        isSetAsProviderData: !!isSetAsProviderData,
        addAnotherAfter: continueAddingAfter,
        converterEnabled: !!converterEnabled,
      };
      setAndAnother(continueAddingAfter);

      await assignDatasetSchema(request);
    }
  };

  function checkSubmission() {
    const validations = [
      validateDatasetName(selectedDatasetName),
      validateDataSchema(selectedDataSchema),
      validateDatasetDescription(datasetDescription),
    ];
    return validations.every((func) => func);
  }

  function clearFormData() {
    clearErrorMessages();
    setDatasetDescription("");
    setDatasetName(undefined);
    setDatasetDataSchema(undefined);
    setIsSetAsProviderData(false);

    // @ts-ignore
    document.getElementById("form-save-dataset").reset();
  }

  return (
    <div>
      <Header location={Section.Specifications} />
      <div className="govuk-width-container">
        <Breadcrumbs>
          <Breadcrumb name={"Calculate funding"} url={"/"} />
          <Breadcrumb name={"Specifications"} url={"/SpecificationsList"} />
          <Breadcrumb
            name={specification ? specification.name : "specification"}
            url={`/ViewSpecification/${specificationId}`}
          />
          <Breadcrumb name={"Create dataset"} />
        </Breadcrumbs>

        <ConfirmationPanel
          title={"Dataset created"}
          children={`Dataset ${selectedDatasetName} has been created.`}
          hidden={!isSuccess}
        />

        <MultipleErrorSummary errors={errors} />

        {(isLoadingSpecification || isLoadingFundingConfiguration || isUpdating) && (
          <LoadingStatus
            title={
              isLoadingSpecification
                ? "Loading specification"
                : isLoadingFundingConfiguration
                ? "Loading funding configuration"
                : isUpdating
                ? "Creating Dataset"
                : "Loading"
            }
            id={"create-dataset-loader"}
            subTitle="Please wait"
            description={isUpdating ? "This can take a few minutes" : ""}
          />
        )}

        {!isUpdating && specification && fundingConfiguration && (
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <Form token="create-dataset" heading="Create dataset" titleCaption={specification.name}>
                <PageHeaderFieldset
                  token="create-dataset"
                  heading="Check funding lines/calculations before creating data set"
                />
                <SelectionField
                  token="data-schema"
                  label="Select data schema"
                  hint="Please select data schema"
                  options={dataSchemas?.map<SelectionFieldOption>((d) => ({
                    id: d.id,
                    displayValue: d.name,
                  }))}
                  changeSelection={changeDataSchema}
                  selectedValue={selectedDataSchema}
                  errors={errors.filter((e) => e.fieldName === "DatasetDefinitionId")}
                  isLoading={isLoadingDataSchemas}
                />
                <TextField
                  token="dataset-name"
                  label="Data set name"
                  hint="Use a descriptive unique name other users can understand"
                  onChange={changeDatasetName}
                  value={selectedDatasetName}
                  errors={errors.filter((e) => e.fieldName === "Name")}
                  isLoading={isLoadingDataSchemas}
                />
                <TextAreaField
                  token="dataset-name"
                  label="Description"
                  hint="Please provide a description for the dataset"
                  onChange={changeDatasetDescription}
                  value={datasetDescription}
                  errors={errors.filter((e) => e.fieldName === "Name")}
                  isLoading={isLoadingDataSchemas}
                />

                {fundingConfiguration && fundingConfiguration.providerSource === ProviderSource.CFS && (
                  <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h3 className="govuk-heading-m">Set as provider data</h3>
                      </legend>
                      <div className="govuk-radios govuk-radios--inline">
                        <RadioOption
                          token="set-as-data-provider-yes"
                          label="Yes"
                          value="true"
                          checked={isSetAsProviderData === true}
                          callback={() => setIsSetAsProviderData(true)}
                        />
                        <RadioOption
                          token="set-as-data-provider-no"
                          label="No"
                          value="false"
                          checked={isSetAsProviderData === false}
                          callback={() => setIsSetAsProviderData(false)}
                        />
                      </div>
                    </fieldset>
                  </div>
                )}
                {converterEligible && (
                  <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset ">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h3 className="govuk-heading-m">Enable copy data for provider</h3>
                      </legend>
                      <div className="govuk-radios govuk-radios--inline">
                        <RadioOption
                          token="set-converter-enabled-yes"
                          label="Yes"
                          value="true"
                          checked={converterEnabled === true}
                          callback={() => setConverterEnabled(true)}
                        />
                        <RadioOption
                          token="set-converter-enabled-no"
                          label="No"
                          value="false"
                          checked={converterEnabled === false}
                          callback={() => setConverterEnabled(false)}
                        />
                      </div>
                    </fieldset>
                  </div>
                )}
              </Form>
              <button
                className="govuk-button govuk-!-margin-right-1"
                data-module="govuk-button"
                onClick={() => saveDataset(false)}
              >
                Save and continue
              </button>
              <button
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={() => saveDataset(true)}
              >
                Save and add another
              </button>
              <Link
                to={`/ViewSpecification/${specificationId}`}
                className="govuk-button govuk-button--warning govuk-!-margin-left-1"
                data-module="govuk-button"
              >
                Cancel
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
