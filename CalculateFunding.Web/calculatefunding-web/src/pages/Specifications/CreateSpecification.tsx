import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { milliseconds } from "../../helpers/TimeInMs";
import { useJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import { usePermittedFundingStreams } from "../../hooks/Permissions/usePermittedFundingStreams";
import { useErrors } from "../../hooks/useErrors";
import { useFundingConfiguration } from "../../hooks/useFundingConfiguration";
import { useFundingStreams } from "../../hooks/useFundingStreams";
import * as policyService from "../../services/policyService";
import * as providerService from "../../services/providerService";
import * as providerVersionService from "../../services/providerVersionService";
import * as specificationService from "../../services/specificationService";
import { CoreProviderSummary, ProviderSnapshot, ProviderSource } from "../../types/CoreProviderSummary";
import { MonitorFallback, MonitorMode } from "../../types/Jobs/JobSubscriptionModels";
import { Permission } from "../../types/Permission";
import { UpdateCoreProviderVersion } from "../../types/Provider/UpdateCoreProviderVersion";
import { Section } from "../../types/Sections";
import { CreateSpecificationModel } from "../../types/Specifications/CreateSpecificationModel";
import { ProviderDataTrackingMode } from "../../types/Specifications/ProviderDataTrackingMode";
import { PublishedFundingTemplate } from "../../types/TemplateBuilderDefinitions";
import { UserPermission } from "../../types/UserPermission";
import { FundingPeriod } from "../../types/viewFundingTypes";

export function CreateSpecification(): JSX.Element {
  const { fundingStreams, isLoadingFundingStreams } = useFundingStreams(true);
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedFundingStreamId, setSelectedFundingStreamId] = useState<string | undefined>();
  const [selectedFundingPeriodId, setSelectedFundingPeriodId] = useState<string | undefined>();
  const [selectedProviderVersionId, setSelectedProviderVersionId] = useState<string | undefined>();
  const [selectedProviderSnapshotId, setSelectedProviderSnapshotId] = useState<string | undefined>();
  const [selectedTemplateVersion, setSelectedTemplateVersion] = useState<string | undefined>();
  const [enableTrackProviderData, setEnableTrackProviderData] = useState<
    ProviderDataTrackingMode | undefined
  >();
  const [selectedDescription, setSelectedDescription] = useState<string>("");
  const [providerSource, setProviderSource] = useState<ProviderSource>();

  const permittedFundingStreams = usePermittedFundingStreams(UserPermission.CanCreateSpecification);

  const { data: fundingPeriods, isLoading: isLoadingFundingPeriods } = useQuery<FundingPeriod[], AxiosError>(
    `funding-periods-for-stream-${selectedFundingStreamId}`,
    async () =>
      (
        await specificationService.getFundingPeriodsByFundingStreamIdService(
          selectedFundingStreamId as string
        )
      ).data,
    {
      enabled: (selectedFundingStreamId && selectedFundingStreamId.length > 0) === true,
      cacheTime: milliseconds.OneDay,
      staleTime: milliseconds.OneDay,
      retry: false,
      onError: (err) =>
        err.response?.status !== 404 &&
        addError({
          error: err,
          description: "No funding periods exist for your selection",
          fieldName: "funding-period",
        }),
      onSettled: (data) =>
        !data || data.length === 0
          ? addError({ error: "No funding periods exist for your selection", fieldName: "funding-period" })
          : clearErrorMessages(["funding-period"]),
    }
  );
  const { data: publishedFundingTemplates, isLoading: isLoadingPublishedFundingTemplates } = useQuery<
    PublishedFundingTemplate[],
    AxiosError
  >(
    `published-funding-templates-for-${selectedFundingStreamId}-${selectedFundingPeriodId}`,
    async () =>
      (
        await policyService.getPublishedTemplatesByStreamAndPeriod(
          selectedFundingStreamId as string,
          selectedFundingPeriodId as string
        )
      ).data,
    {
      enabled:
        (selectedFundingStreamId &&
          selectedFundingStreamId.length > 0 &&
          selectedFundingPeriodId &&
          selectedFundingPeriodId.length > 0) === true,
      onError: (err) =>
        err.response?.status !== 404 &&
        addError({
          error: err,
          description:
            "There was a problem loading the published funding templates. Please try refreshing the page",
        }),
      onSettled: (data) => {
        !data || data.length === 0
          ? addError({
              error: "No published template exists for your selection",
              fieldName: "selectTemplateVersion",
            })
          : clearErrorMessages(["selectTemplateVersion"]);
        fundingConfiguration &&
          fundingConfiguration.defaultTemplateVersion &&
          data &&
          data.find((x) => x.schemaVersion === fundingConfiguration.defaultTemplateVersion) &&
          setSelectedTemplateVersion(fundingConfiguration.defaultTemplateVersion);
      },
    }
  );
  const { data: coreProviders, isLoading: isLoadingCoreProviders } = useQuery<
    CoreProviderSummary[],
    AxiosError
  >(
    `coreProviderSummary-for-${selectedFundingStreamId}`,
    async () =>
      (await providerVersionService.getCoreProvidersByFundingStream(selectedFundingStreamId as string)).data,
    {
      enabled: (selectedFundingStreamId && providerSource === ProviderSource.CFS) === true,
      retry: false,
      onError: (err) =>
        err.response?.status !== 404 &&
        addError({ error: err, description: "There is no provider data for your selection" }),
      onSettled: (data) =>
        (!data || data.length === 0) && providerSource === ProviderSource.CFS
          ? addError({
              error: "No provider data sources exist for your selections",
              fieldName: "selectCoreProvider",
            })
          : clearErrorMessages(["selectCoreProvider"]),
    }
  );
  const { data: providerSnapshots, isLoading: isLoadingProviderSnapshots } = useQuery<
    ProviderSnapshot[],
    AxiosError
  >(
    `coreProviderSummary-for-${selectedFundingStreamId}`,
    async () =>
      (await providerService.getProviderSnapshotsByFundingStream(selectedFundingStreamId as string)).data,
    {
      enabled: (selectedFundingStreamId && providerSource === ProviderSource.FDZ) === true,
      retry: false,
      onError: (err) =>
        err.response?.status !== 404 &&
        addError({ error: err, description: "There is no provider data for your selection" }),
      onSettled: (data) =>
        (!data || data.length === 0) && providerSource === ProviderSource.FDZ
          ? addError({
              error: "No provider data sources exist for your selections",
              fieldName: "selectCoreProvider",
            })
          : clearErrorMessages(["selectCoreProvider"]),
    }
  );
  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    selectedFundingStreamId,
    selectedFundingPeriodId,
    (err) => addError({ error: err, description: "Error while loading funding configuration" }),
    async (result) => {
      setProviderSource(result.providerSource);
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [newSpecificationId, setNewSpecificationId] = useState<string>();
  const history = useHistory();
  const { errors, addError, addValidationErrors, clearErrorMessages } = useErrors();
  const errorSuggestion = (
    <p>
      If the problem persists please contact the{" "}
      <a href="https://dfe.service-now.com/serviceportal" className="govuk-link">
        helpdesk
      </a>
    </p>
  );

  const { addSub, results: jobNotifications } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while creating this specification" }),
  });

  useEffect(() => {
    if (
      newSpecificationId?.length &&
      jobNotifications?.some(
        (n) => n.latestJob?.specificationId === newSpecificationId && n.latestJob.isSuccessful
      )
    ) {
      history.push(`/ViewSpecification/${newSpecificationId}`);
    }
  }, [newSpecificationId, jobNotifications]);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const specificationName = e.target.value;
    setSelectedName(specificationName);
    clearErrorMessages(["name"]);
  }

  function handleFundingStreamChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const fundingStreamId = e.target.value;
    clearErrorMessages();
    setSelectedFundingPeriodId(undefined);
    setSelectedProviderVersionId(undefined);
    setSelectedTemplateVersion(undefined);
    setSelectedFundingStreamId(fundingStreamId);
    clearErrorMessages(["funding-stream", "selectCoreProvider", "selectTemplateVersion"]);
  }

  function handleFundingPeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const fundingPeriodId = e.target.value;
    clearErrorMessages();
    setSelectedTemplateVersion(undefined);
    setSelectedProviderVersionId(undefined);
    setSelectedFundingPeriodId(fundingPeriodId);
    clearErrorMessages(["funding-period", "selectCoreProvider", "selectTemplateVersion"]);
  }

  function handleProviderDataChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedId: string = e.target.value as string;
    if (providerSource === ProviderSource.CFS) {
      setSelectedProviderVersionId(selectedId);
      setSelectedProviderSnapshotId(undefined);
    } else if (providerSource === ProviderSource.FDZ) {
      setSelectedProviderSnapshotId(selectedId);
      setSelectedProviderVersionId(undefined);
    }
    clearErrorMessages(["selectCoreProvider"]);
  }

  function handleTrackProviderDataChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEnableTrackProviderData(
      e.target.value === "yes" ? ProviderDataTrackingMode.UseLatest : ProviderDataTrackingMode.Manual
    );
    clearErrorMessages(["trackProviderData"]);
  }

  function handleTemplateVersionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const templateVersionId = e.target.value;
    setSelectedTemplateVersion(templateVersionId);
    clearErrorMessages(["selectTemplateVersion"]);
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const specificationDescription = e.target.value;
    setSelectedDescription(specificationDescription);
    clearErrorMessages(["description"]);
  }

  function validateForm() {
    clearErrorMessages();
    let isValid = true;

    if (!selectedName || selectedName.length === 0) {
      addError({ error: "Invalid specification name", fieldName: "name" });
      isValid = false;
    }
    if (!selectedFundingStreamId || selectedFundingStreamId.length === 0) {
      addError({ error: "Missing funding stream", fieldName: "funding-stream" });
      isValid = false;
    }
    if (!selectedFundingPeriodId || selectedFundingPeriodId.length === 0) {
      addError({ error: "Missing funding period", fieldName: "funding-period" });
      isValid = false;
    }
    if (providerSource) {
      if (
        providerSource === ProviderSource.CFS &&
        (!selectedProviderVersionId || selectedProviderVersionId.length == 0)
      ) {
        addError({ error: "Missing core provider version", fieldName: "selectCoreProvider" });
        isValid = false;
      }
      if (
        providerSource === ProviderSource.FDZ &&
        fundingConfiguration?.updateCoreProviderVersion !== UpdateCoreProviderVersion.Manual &&
        enableTrackProviderData === undefined
      ) {
        addError({
          error: "Please select whether you want to track latest core provider data",
          fieldName: "trackProviderData",
        });
        isValid = false;
      }
      if (
        providerSource === ProviderSource.FDZ &&
        (fundingConfiguration?.updateCoreProviderVersion === UpdateCoreProviderVersion.Manual ||
          enableTrackProviderData === ProviderDataTrackingMode.Manual) &&
        (!selectedProviderSnapshotId || selectedProviderSnapshotId.length == 0)
      ) {
        addError({ error: "Missing core provider version", fieldName: "selectCoreProvider" });
        isValid = false;
      }
    }
    if (!selectedTemplateVersion || selectedTemplateVersion.length === 0) {
      addError({ error: "Missing template version", fieldName: "selectTemplateVersion" });
      isValid = false;
    }
    if (!selectedDescription || selectedDescription.length === 0) {
      addError({ error: "Missing description", fieldName: "description" });
      isValid = false;
    }

    return isValid;
  }

  async function handleSave() {
    if (validateForm() && selectedFundingStreamId && selectedFundingPeriodId) {
      setIsSaving(true);
      setNewSpecificationId("");
      const assignedTemplateIdsValue: any = {};
      assignedTemplateIdsValue[selectedFundingStreamId] = selectedTemplateVersion;

      const createSpecificationViewModel: CreateSpecificationModel = {
        description: selectedDescription,
        fundingPeriodId: selectedFundingPeriodId,
        fundingStreamId: selectedFundingStreamId,
        name: selectedName,
        assignedTemplateIds: assignedTemplateIdsValue,
        providerVersionId: providerSource === ProviderSource.CFS ? selectedProviderVersionId : undefined,
        providerSnapshotId:
          providerSource === ProviderSource.FDZ &&
          selectedProviderSnapshotId &&
          (fundingConfiguration?.updateCoreProviderVersion === UpdateCoreProviderVersion.Manual ||
            enableTrackProviderData === ProviderDataTrackingMode.Manual)
            ? parseInt(selectedProviderSnapshotId)
            : undefined,
        coreProviderVersionUpdates:
          providerSource === ProviderSource.FDZ ? enableTrackProviderData : undefined,
      };

      try {
        const createSpecificationResult = await specificationService.createSpecificationService(
          createSpecificationViewModel
        );

        const newSpecId = createSpecificationResult.data.id;
        setNewSpecificationId(newSpecId);

        await addSub({
          filterBy: { specificationId: newSpecId, jobTypes: [] },
          monitorMode: MonitorMode.SignalR,
          monitorFallback: MonitorFallback.Polling,
          onError: (err) =>
            addError({
              error: err,
              description: "An error occurred while monitoring the job for creating the specification",
            }),
        });
      } catch (error: any) {
        setIsSaving(false);
        if (error.response && error.response.data["Name"]) {
          addError({ error: error.response.data["Name"], suggestion: errorSuggestion });
        } else {
          const axiosError = error as AxiosError;
          if (axiosError && axiosError.response && axiosError.response.status === 400) {
            addValidationErrors({
              validationErrors: axiosError.response.data,
              message: "Error trying to create specification",
            });
          } else {
            addError({ error: error, description: "Specification failed to create. Please try again" });
          }
        }
      }
    }
  }

  const activeJob = jobNotifications.find((n) => n.latestJob?.isActive)?.latestJob;

  return (
    <div>
      <Header location={Section.Specifications} />
      <div className="govuk-width-container">
        <Breadcrumbs>
          <Breadcrumb name={"Calculate funding"} url={"/"} />
          <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
          <Breadcrumb name={"Create specification"} />
        </Breadcrumbs>
        <div className="govuk-main-wrapper">
          <PermissionStatus
            requiredPermissions={[Permission.CanCreateSpecification]}
            hidden={!permittedFundingStreams || permittedFundingStreams.length > 0}
          />

          <MultipleErrorSummary errors={errors} />

          <LoadingStatusNotifier
            notifications={[
              {
                isActive: isSaving,
                title: "Creating Specification",
                subTitle: activeJob
                  ? `Job ${activeJob.statusDescription}: ${activeJob.jobDescription}`
                  : "Waiting for update...",
                description: "This can take a few minutes",
              },
            ]}
          />

          <fieldset hidden={isSaving} className="govuk-fieldset" id="create-specification-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
              <h1 className="govuk-fieldset__heading">Create specification</h1>
            </legend>
            <div
              className={`govuk-form-group ${
                errors.filter((e) => e.fieldName === "name").length > 0 ? "govuk-form-group--error" : ""
              }`}
            >
              <label className="govuk-label" htmlFor="specification-name">
                Specification name
              </label>
              <input
                className="govuk-input"
                id="specification-name"
                name="specification-name"
                type="text"
                onChange={handleNameChange}
                data-testid={"specification-name-input"}
              />
            </div>

            <div
              className={`govuk-form-group ${
                errors.filter((e) => e.fieldName === "funding-stream").length > 0
                  ? "govuk-form-group--error"
                  : ""
              }`}
            >
              <label className="govuk-label" htmlFor="funding-stream">
                Funding streams
              </label>
              {fundingStreams && fundingStreams.length > 0 && (
                <select
                  className="govuk-select"
                  id="funding-stream"
                  name="funding-stream"
                  onChange={handleFundingStreamChange}
                  data-testid={"funding-stream-dropdown"}
                >
                  <option value="">Select funding Stream</option>
                  {fundingStreams &&
                    fundingStreams.map((fs, index) => (
                      <option key={index} value={fs.id}>
                        {fs.name}
                      </option>
                    ))}
                </select>
              )}
              {isLoadingFundingStreams && <LoadingFieldStatus title="Loading..." />}
            </div>

            <div
              className={`govuk-form-group ${
                errors.filter((e) => e.fieldName === "funding-period").length > 0
                  ? "govuk-form-group--error"
                  : ""
              }`}
            >
              <label className="govuk-label" htmlFor="funding-period">
                Funding period
              </label>
              <select
                className="govuk-select"
                id="funding-period"
                name="funding-period"
                disabled={
                  !selectedFundingStreamId ||
                  !fundingPeriods ||
                  fundingPeriods.length === 0 ||
                  isLoadingFundingPeriods
                }
                onChange={handleFundingPeriodChange}
                data-testid={"funding-period-dropdown"}
              >
                <option value="">Select funding period</option>
                {selectedFundingStreamId &&
                  !isLoadingFundingPeriods &&
                  fundingPeriods &&
                  fundingPeriods.map((fp, index) => (
                    <option key={index} value={fp.id}>
                      {fp.name}
                    </option>
                  ))}
              </select>
              {isLoadingFundingPeriods && <LoadingFieldStatus title="Loading..." />}
            </div>

            {providerSource === ProviderSource.FDZ &&
              fundingConfiguration?.updateCoreProviderVersion ===
                (UpdateCoreProviderVersion.ToLatest || UpdateCoreProviderVersion.Paused) && (
                <div
                  className={`govuk-form-group ${
                    errors.filter((e) => e.fieldName === "trackProviderData").length > 0
                      ? "govuk-form-group--error"
                      : ""
                  }`}
                >
                  <fieldset
                    className="govuk-fieldset"
                    id="trackProviderData"
                    aria-describedby="trackProviderData-hint"
                    role="radiogroup"
                  >
                    <legend className="govuk-label" id="trackProviderData-label">
                      Track latest core provider data?
                    </legend>
                    <div id="trackProviderData-hint" className="govuk-hint">
                      Select yes if you wish to use the latest available provider data.
                    </div>
                    <span className="govuk-error-message govuk-visually-hidden" id="trackProviderData-error">
                      <span className="govuk-visually-hidden">Error:</span> Please select an option
                    </span>
                    <div className="govuk-radios">
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="trackProviderData-yes"
                          name="trackProviderData-yes"
                          type="radio"
                          value="yes"
                          checked={enableTrackProviderData === ProviderDataTrackingMode.UseLatest}
                          onChange={handleTrackProviderDataChange}
                          aria-describedby="provider-data-item-hint"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="trackProviderData-yes">
                          Yes
                        </label>
                        <div id="trackProviderData-yes-hint" className="govuk-hint govuk-radios__hint">
                          This specification will use the latest available provider data
                        </div>
                      </div>
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="trackProviderData-no"
                          name="trackProviderData-no"
                          type="radio"
                          value="no"
                          checked={enableTrackProviderData === ProviderDataTrackingMode.Manual}
                          onChange={handleTrackProviderDataChange}
                          aria-describedby="trackProviderData-no-hint"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="trackProviderData-no">
                          No
                        </label>
                        <div id="trackProviderData-no-hint" className="govuk-hint govuk-radios__hint">
                          I will select which provider data to use
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

            {(providerSource === ProviderSource.CFS ||
              fundingConfiguration?.updateCoreProviderVersion === UpdateCoreProviderVersion.Manual ||
              enableTrackProviderData === ProviderDataTrackingMode.Manual) && (
              <div
                className={`govuk-form-group ${
                  errors.filter((e) => e.fieldName === "selectCoreProvider").length > 0
                    ? "govuk-form-group--error"
                    : ""
                }`}
              >
                <label className="govuk-label" htmlFor="selectCoreProvider">
                  Core provider data
                </label>
                <select
                  className="govuk-select"
                  id="selectCoreProvider"
                  name="selectCoreProvider"
                  disabled={
                    !selectedFundingStreamId ||
                    !selectedFundingPeriodId ||
                    !fundingPeriods ||
                    !coreProviders ||
                    !providerSnapshots ||
                    isLoadingCoreProviders
                  }
                  onChange={handleProviderDataChange}
                  data-testid={"core-provider-dropdown"}
                >
                  <option value="">Select core provider</option>
                  {providerSource === ProviderSource.CFS && coreProviders && coreProviders.length > 0
                    ? coreProviders.map((cp, index) => (
                        <option key={index} value={cp.providerVersionId}>
                          {cp.name}
                        </option>
                      ))
                    : null}
                  {providerSource === ProviderSource.FDZ && providerSnapshots && providerSnapshots.length > 0
                    ? providerSnapshots.map((cp, index) => (
                        <option key={index} value={cp.providerSnapshotId}>
                          {cp.name}
                        </option>
                      ))
                    : null}
                </select>
                {(isLoadingFundingConfiguration || isLoadingProviderSnapshots || isLoadingCoreProviders) && (
                  <LoadingFieldStatus title="Loading..." />
                )}
              </div>
            )}

            <div
              className={`govuk-form-group ${
                errors.filter((e) => e.fieldName === "selectTemplateVersion").length > 0
                  ? "govuk-form-group--error"
                  : ""
              }`}
            >
              <label className="govuk-label" htmlFor="selectedTemplateVersion">
                Template version
              </label>
              <select
                className="govuk-select"
                id="selectTemplateVersion"
                name="selectTemplateVersion"
                disabled={
                  !selectedFundingStreamId ||
                  !selectedFundingPeriodId ||
                  !fundingPeriods ||
                  !publishedFundingTemplates ||
                  isLoadingPublishedFundingTemplates
                }
                onChange={handleTemplateVersionChange}
                value={selectedTemplateVersion || ""}
                data-testid={"template-version-dropdown"}
              >
                <option value="">Select template version</option>
                {publishedFundingTemplates &&
                  publishedFundingTemplates
                    .sort((a, b) => parseFloat(a.templateVersion) - parseFloat(b.templateVersion))
                    .map((publishedFundingTemplate, index) => (
                      <option
                        key={index}
                        value={publishedFundingTemplate.templateVersion}
                        data-testid="templateVersion-option"
                      >
                        {publishedFundingTemplate.templateVersion}
                      </option>
                    ))}
              </select>
              {isLoadingPublishedFundingTemplates && <LoadingFieldStatus title="Loading..." />}
            </div>

            <div
              className={`govuk-form-group ${
                errors.filter((e) => e.fieldName === "description").length > 0
                  ? "govuk-form-group--error"
                  : ""
              }`}
            >
              <label className="govuk-label" htmlFor="description">
                Can you provide more detail?
              </label>
              <textarea
                className="govuk-textarea"
                id="description"
                name="description"
                rows={8}
                onChange={handleDescriptionChange}
                data-testid={"description-textarea"}
              ></textarea>
            </div>
            <div className="govuk-form-group">
              <button
                id="submit-specification-button"
                className="govuk-button govuk-!-margin-right-1"
                data-module="govuk-button"
                onClick={handleSave}
              >
                Save and continue
              </button>
              <Link
                id="cancel-create-specification"
                to="/SpecificationsList"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
              >
                Cancel
              </Link>
            </div>
          </fieldset>
        </div>
      </div>
      <Footer />
    </div>
  );
}
