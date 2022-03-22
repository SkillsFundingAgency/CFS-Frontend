import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router";
import { Link } from "react-router-dom";

import * as action from "../../actions/jobObserverActions";
import { BackLink } from "../../components/BackLink";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { useJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../hooks/useErrors";
import { useFundingConfiguration } from "../../hooks/useFundingConfiguration";
import { useGetCoreProviders } from "../../hooks/useGetCoreProviders";
import { useGetProviderSnapshots } from "../../hooks/useGetProviderSnapshots";
import { useGetPublishedTemplates } from "../../hooks/useGetPublishedTemplates";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import * as specificationService from "../../services/specificationService";
import { ProviderSource } from "../../types/CoreProviderSummary";
import { JobMonitoringFilter } from "../../types/Jobs/JobMonitoringFilter";
import { MonitorFallback, MonitorMode } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import { Permission } from "../../types/Permission";
import { UpdateCoreProviderVersion } from "../../types/Provider/UpdateCoreProviderVersion";
import { Section } from "../../types/Sections";
import { ProviderDataTrackingMode } from "../../types/Specifications/ProviderDataTrackingMode";
import { UpdateSpecificationModel } from "../../types/Specifications/UpdateSpecificationModel";

export interface EditSpecificationRouteProps {
  specificationId: string;
}

interface NameValuePair {
  name: string;
  value: string;
}

export function EditSpecification({ match }: RouteComponentProps<EditSpecificationRouteProps>): JSX.Element {
  const specificationId = match.params.specificationId;

  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedProviderVersionId, setSelectedProviderVersionId] = useState<string>();
  const [selectedProviderSnapshotId, setSelectedProviderSnapshotId] = useState<string | undefined>();
  const [selectedTemplateVersion, setSelectedTemplateVersion] = useState<string>();
  const [selectedDescription, setSelectedDescription] = useState<string>("");
  const [enableTrackProviderData, setEnableTrackProviderData] = useState<
    ProviderDataTrackingMode | undefined
  >();

  const { isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions } =
    useSpecificationPermissions(specificationId, [Permission.CanEditSpecification]);

  const { specification, isLoadingSpecification, clearSpecificationFromCache } = useSpecificationSummary(
    specificationId,
    (err) =>
      addError({
        error: err,
        description: "Error while loading specification",
      })
  );

  const fundingStreamId = specification?.fundingStreams?.length
    ? specification?.fundingStreams[0]?.id
    : undefined;
  const fundingPeriodId = specification?.fundingPeriod?.id ?? undefined;

  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    fundingStreamId,
    fundingPeriodId,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );

  const providerSource = fundingConfiguration?.providerSource;
  const [coreProviderData, setCoreProviderData] = useState<NameValuePair[]>([]);

  const {
    addSub,
    removeAllSubs,
    results: jobNotifications,
  } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring background jobs" }),
  });

  const { coreProviders, isLoadingCoreProviders } = useGetCoreProviders(fundingStreamId, providerSource, {
    onError: (err) =>
      err.response?.status !== 404 &&
      addError({
        error: err,
        description: "Could not find a provider data source",
        fieldName: "selectCoreProvider",
      }),
  });

  const { providerSnapshots, isLoadingProviderSnapshots } = useGetProviderSnapshots(
    fundingStreamId,
    providerSource,
    {
      onError: (err) =>
        err.response?.status !== 404 &&
        addError({
          error: err,
          description: "Could not find a provider data source",
          fieldName: "selectCoreProvider",
        }),
      onSuccess: () => {
        clearErrorMessages(["selectCoreProvider"]);
      },
    }
  );

  const [templateVersionData, setTemplateVersionData] = useState<NameValuePair[]>([]);
  const { publishedTemplates, isLoadingPublishedTemplates } = useGetPublishedTemplates(
    fundingStreamId,
    fundingPeriodId,
    {
      onError: (err) =>
        err.response?.status !== 404 &&
        addError({
          error: err,
          description: "Could not find any published funding templates",
          fieldName: "selectTemplateVersion",
        }),
      onSuccess: () => {
        clearErrorMessages(["selectTemplateVersion"]);
      },
    }
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const { errors, addError, addValidationErrors, clearErrorMessages } = useErrors();
  const errorSuggestion = (
    <p>
      If the problem persists please contact the{" "}
      <a href="https://dfe.service-now.com/serviceportal" className="govuk-link">
        helpdesk
      </a>
    </p>
  );

  function handleSpecificationNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const specificationName = e.target.value;
    setSelectedName(specificationName);
    clearErrorMessages(["name"]);
  }

  function handleCoreProviderChange(e: React.ChangeEvent<HTMLSelectElement>) {
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

  function handleTemplateVersionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const templateVersionId = e.target.value;
    setSelectedTemplateVersion(templateVersionId);
    clearErrorMessages(["selectedTemplateVersion"]);
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const specificationDescription = e.target.value;
    setSelectedDescription(specificationDescription);
    clearErrorMessages(["description"]);
  }

  function handleTrackProviderDataChange(enable: boolean) {
    setEnableTrackProviderData(enable ? ProviderDataTrackingMode.UseLatest : ProviderDataTrackingMode.Manual);
    clearErrorMessages(["trackProviderData"]);
  }

  function validateForm() {
    clearErrorMessages();
    let isValid = true;

    if (!selectedName || selectedName.length == 0) {
      addError({ error: "Invalid specification name", fieldName: "name" });
      isValid = false;
    }
    if (!selectedDescription || selectedDescription.length == 0) {
      addError({ error: "Missing description", fieldName: "description" });
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

    if (!selectedTemplateVersion || selectedTemplateVersion.length == 0) {
      addError({ error: "Missing template version", fieldName: "selectTemplateVersion" });
      isValid = false;
    }

    return isValid;
  }

  async function submitUpdateSpecification() {
    if (validateForm() && specification && fundingStreamId && fundingPeriodId) {
      setIsUpdating(true);
      const assignedTemplateIdsValue: any = {};
      assignedTemplateIdsValue[fundingStreamId] = selectedTemplateVersion;

      const updateSpecificationViewModel: UpdateSpecificationModel = {
        description: selectedDescription,
        fundingPeriodId: fundingPeriodId,
        fundingStreamId: fundingStreamId,
        name: selectedName,
        providerVersionId: providerSource === ProviderSource.CFS ? selectedProviderVersionId : undefined,
        providerSnapshotId:
          providerSource === ProviderSource.FDZ &&
          enableTrackProviderData === ProviderDataTrackingMode.Manual &&
          selectedProviderSnapshotId
            ? parseInt(selectedProviderSnapshotId)
            : undefined,
        assignedTemplateIds: assignedTemplateIdsValue,
        coreProviderVersionUpdates:
          providerSource === ProviderSource.FDZ ? enableTrackProviderData : undefined,
      };

      try {
        await specificationService.updateSpecificationService(updateSpecificationViewModel, specificationId);
        setIsUpdating(false);
        await clearSpecificationFromCache();
        const jobMonitoringFilter: JobMonitoringFilter = {
          specificationId: specificationId,
          jobTypes: [JobType.EditSpecificationJob],
          includeChildJobs: false,
          jobId: undefined,
        };
        dispatch(action.upsertJobObserverState(jobMonitoringFilter));
        history.push(`/ViewSpecification/${specificationId}`);
      } catch (error: any) {
        if (error.response && error.response.data["Name"]) {
          addError({ error: error.response.data["Name"], suggestion: errorSuggestion });
        } else {
          const axiosError = error as AxiosError;
          if (axiosError && axiosError.response && axiosError.response.status === 400) {
            addValidationErrors({
              validationErrors: axiosError.response.data,
              message: "Error trying to update specification",
            });
          } else {
            addError({ error: error, description: "Specification failed to update. Please try again" });
          }
        }
        setIsUpdating(false);
      }
    }
  }

  useEffect(() => {
    if (specification) {
      setSelectedName(specification.name);
      setSelectedDescription(specification.description ? specification.description : "");
      setEnableTrackProviderData(specification.coreProviderVersionUpdates);

      if (specification.providerVersionId && providerSource === ProviderSource.CFS) {
        setSelectedProviderVersionId(specification.providerVersionId);
        setSelectedProviderSnapshotId(undefined);
      }

      if (providerSource === ProviderSource.FDZ && specification.coreProviderVersionUpdates) {
        if (
          specification.coreProviderVersionUpdates === ProviderDataTrackingMode.Manual &&
          specification.providerSnapshotId
        ) {
          setSelectedProviderSnapshotId(specification.providerSnapshotId.toString());
        } else {
          setSelectedProviderSnapshotId(undefined);
        }
      }
    }
  }, [specification]);

  useEffect(() => {
    if (
      !isLoadingSpecification &&
      !isLoadingPublishedTemplates &&
      !!specification?.templateIds &&
      !!fundingStreamId &&
      !!publishedTemplates
    ) {
      const templates = publishedTemplates.map((publishedFundingTemplate) => ({
        name: publishedFundingTemplate.templateVersion,
        value: publishedFundingTemplate.templateVersion,
      }));
      setTemplateVersionData(templates);
      const selectedVersion = templates.find((t) => t.value === specification.templateIds[fundingStreamId]);
      if (selectedVersion) {
        setSelectedTemplateVersion(selectedVersion.value);
      }
    }
  }, [specification, publishedTemplates]);

  useEffect(() => {
    if (providerSource === ProviderSource.CFS && coreProviders) {
      clearErrorMessages(["selectCoreProvider"]);
      const providerData = coreProviders.map((data) => ({
        name: data.name,
        value: data.providerVersionId,
      }));
      setCoreProviderData(providerData);
      const selectedProviderVersion = providerData.find(
        (p) => specification && p.value === specification.providerVersionId
      );
      selectedProviderVersion && setSelectedProviderVersionId(selectedProviderVersion.value);
    }

    if (providerSnapshots && providerSource === ProviderSource.FDZ) {
      const providerData = providerSnapshots.map((coreProviderItem) => ({
        name: coreProviderItem.name,
        value: coreProviderItem.providerSnapshotId?.toString(),
      }));
      setCoreProviderData(providerData);
      const selectedProviderSnapshot = providerData.find(
        (p) => specification && p.value === specification.providerSnapshotId?.toString()
      );
      if (selectedProviderSnapshot) {
        setSelectedProviderSnapshotId(selectedProviderSnapshot.value);
      }
    }
  }, [providerSource, coreProviders, providerSnapshots]);

  useEffect(() => {
    // monitor background jobs
    addSub({
      filterBy: {
        specificationId: specificationId,
        jobTypes: [
          JobType.RefreshFundingJob,
          JobType.ApproveAllProviderFundingJob,
          JobType.ApproveBatchProviderFundingJob,
          JobType.PublishAllProviderFundingJob,
          JobType.PublishBatchProviderFundingJob,
          JobType.ReleaseProvidersToChannelsJob,
        ],
      },
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      onError: (err) => addError({ error: err, description: "Error while checking for specification jobs" }),
    });
    return () => removeAllSubs();
  }, []);

  const blockingActiveJob = jobNotifications?.find((n) => !!n.latestJob?.isActive)?.latestJob;

  const isLoading: boolean =
    isLoadingPublishedTemplates ||
    isLoadingFundingConfiguration ||
    isLoadingCoreProviders ||
    isLoadingProviderSnapshots ||
    isLoadingSpecification;

  return (
    <Main location={Section.Specifications}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
      </Breadcrumbs>
      <PermissionStatus
        requiredPermissions={missingPermissions}
        hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}
      />

      <MultipleErrorSummary errors={errors} />

      <LoadingStatusNotifier
        notifications={[
          {
            isActive: !!blockingActiveJob,
            title: "Specification is being updated in the background",
            subTitle: `Job running: ${blockingActiveJob?.jobDescription}`,
            description: "Please wait until the background job has finished",
          },
          {
            isActive: isUpdating,
            title: "Updating Specification",
            subTitle: "Waiting for job to run",
          },
          {
            isActive: isLoadingSpecification,
            title: "Loading specification",
          },
          {
            isActive: isLoadingFundingConfiguration,
            title: "Loading funding configuration",
          },
          {
            isActive: isLoadingPublishedTemplates,
            title: "Loading templates",
          },
          {
            isActive: isLoadingProviderSnapshots,
            title: "Loading provider snapshots",
          },
          {
            isActive: isLoadingCoreProviders,
            title: "Loading core providers",
          },
          {
            isActive: !isPermissionsFetched,
            title: "Loading permissions",
          },
        ]}
      />

      {!isLoading && !isUpdating && !blockingActiveJob && (
        <fieldset
          className="govuk-fieldset"
          id="update-specification-fieldset"
          data-testid="edit-specification-form"
        >
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
            <h1 className="govuk-fieldset__heading">Edit specification</h1>
          </legend>
          <div
            className={`govuk-form-group ${
              errors.filter((e) => e.fieldName === "name").length > 0 ? "govuk-form-group--error" : ""
            }`}
          >
            <label className="govuk-label" htmlFor="name" id="name-description">
              Specification name
            </label>
            <input
              className="govuk-input"
              id="name"
              name="name"
              aria-describedby="name-description"
              type="text"
              value={selectedName || ""}
              onChange={handleSpecificationNameChange}
            />
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="funding-stream">
              Funding stream
            </label>
            <h3 className="govuk-heading-m" id="funding-stream">
              {fundingStreamId}
            </h3>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="funding-period">
              Funding period
            </label>
            <h3 className="govuk-heading-m" id="funding-period">
              {specification && specification?.fundingPeriod?.name}
            </h3>
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
                  {errors.map(
                    (error) =>
                      error.fieldName === "trackProviderData" && (
                        <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                          <span className="govuk-visually-hidden">Error:</span> {error.message}
                        </span>
                      )
                  )}
                  <div className="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="trackProviderData-yes"
                        name="trackProviderData-yes"
                        type="radio"
                        value="yes"
                        checked={enableTrackProviderData === ProviderDataTrackingMode.UseLatest}
                        onChange={() => handleTrackProviderDataChange(true)}
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
                        onChange={() => handleTrackProviderDataChange(false)}
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
                disabled={coreProviderData.length === 0}
                value={
                  providerSource === ProviderSource.CFS
                    ? selectedProviderVersionId
                    : selectedProviderSnapshotId
                }
                onChange={handleCoreProviderChange}
              >
                <option value="">Select core provider</option>
                {coreProviderData.map((cp, index) => (
                  <option key={`provider-${index}`} value={cp.value}>
                    {cp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            className={`govuk-form-group ${
              errors.filter((e) => e.fieldName === "selectTemplateVersion").length > 0
                ? "govuk-form-group--error"
                : ""
            }`}
          >
            <label className="govuk-label" htmlFor="selectTemplateVersion">
              Template version
            </label>
            <select
              className="govuk-select"
              id="selectTemplateVersion"
              name="selectTemplateVersion"
              disabled={templateVersionData.length === 0}
              value={selectedTemplateVersion}
              onChange={handleTemplateVersionChange}
            >
              <option value="">Select template version</option>
              {templateVersionData
                .sort((a, b) => parseFloat(a.value) - parseFloat(b.value))
                .map((cp, index) => (
                  <option
                    key={`template-version-${index}`}
                    value={cp.value}
                    data-testid="templateVersion-option"
                  >
                    {cp.name}
                  </option>
                ))}
            </select>
          </div>

          <div
            className={`govuk-form-group ${
              errors.filter((e) => e.fieldName === "description").length > 0 ? "govuk-form-group--error" : ""
            }`}
          >
            <label className="govuk-label" htmlFor="description" id="description-hint">
              Can you provide more detail?
            </label>
            <textarea
              className="govuk-textarea"
              id="description"
              name="description"
              rows={8}
              aria-describedby="description-hint"
              onChange={handleDescriptionChange}
              value={selectedDescription}
            />
          </div>
          <div className="govuk-form-group">
            <button
              id="submit-specification-button"
              className="govuk-button govuk-!-margin-right-1"
              data-module="govuk-button"
              onClick={submitUpdateSpecification}
            >
              Save and continue
            </button>
            <Link
              id="cancel-update-specification"
              to={`/ViewSpecification/${specificationId}`}
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
            >
              Cancel
            </Link>
          </div>
        </fieldset>
      )}
      {!isUpdating && (
        <div className="govuk-form-group">
          <BackLink to={`/ViewSpecification/${specificationId}`} />
        </div>
      )}
    </Main>
  );
}
