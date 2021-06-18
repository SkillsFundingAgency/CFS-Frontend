import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import * as specificationService from "../../services/specificationService";
import * as providerVersionService from "../../services/providerVersionService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {RouteComponentProps, useHistory} from "react-router";
import {Section} from "../../types/Sections";
import {CoreProviderSummary, ProviderSnapshot, ProviderSource} from "../../types/CoreProviderSummary";
import {UpdateSpecificationModel} from "../../types/Specifications/UpdateSpecificationModel";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PublishedFundingTemplate} from "../../types/TemplateBuilderDefinitions";
import * as policyService from "../../services/policyService";
import {useErrors} from "../../hooks/useErrors";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {useFundingConfiguration} from "../../hooks/useFundingConfiguration";
import {useQuery} from "react-query";
import {AxiosError} from "axios";
import * as providerService from "../../services/providerService";
import {ProviderDataTrackingMode} from "../../types/Specifications/ProviderDataTrackingMode";
import {Link} from "react-router-dom";
import {Footer} from "../../components/Footer";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {PermissionStatus} from "../../components/PermissionStatus";
import {useSpecificationPermissions} from "../../hooks/Permissions/useSpecificationPermissions";
import {Permission} from "../../types/Permission";
import {BackLink} from "../../components/BackLink";
import {UpdateCoreProviderVersion} from "../../types/Provider/UpdateCoreProviderVersion";
import {useDispatch} from 'react-redux';
import * as action from "../../actions/jobObserverActions";
import {JobMonitoringFilter} from '../../hooks/Jobs/useJobMonitor';

export interface EditSpecificationRouteProps {
    specificationId: string;
}

interface NameValuePair {
    name: string,
    value: string
}

export function EditSpecification({match}: RouteComponentProps<EditSpecificationRouteProps>) {
    const specificationId = match.params.specificationId;

    const [selectedName, setSelectedName] = useState<string>("");
    const [selectedProviderVersionId, setSelectedProviderVersionId] = useState<string>();
    const [selectedProviderSnapshotId, setSelectedProviderSnapshotId] = useState<string | undefined>();
    const [selectedTemplateVersion, setSelectedTemplateVersion] = useState<string>();
    const [selectedDescription, setSelectedDescription] = useState<string>("");
    const [enableTrackProviderData, setEnableTrackProviderData] = useState<ProviderDataTrackingMode | undefined>();

    const {isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions} =
        useSpecificationPermissions(specificationId, [Permission.CanEditSpecification]);

    const {specification, isLoadingSpecification, clearSpecificationFromCache} =
    useSpecificationSummary(
        specificationId,
        err => addError({
                error: err,
                description: "Error while loading specification"
        }));

    const fundingStreamId = specification && specification?.fundingStreams?.length > 0 ? specification?.fundingStreams[0]?.id : null;
    const fundingPeriodId = specification && specification?.fundingPeriod?.id;

    const {fundingConfiguration, isLoadingFundingConfiguration} =
        useFundingConfiguration(fundingStreamId, fundingPeriodId,
            err => addError({error: err, description: "Error while loading funding configuration"}));

    const providerSource = fundingConfiguration?.providerSource;
    const [coreProviderData, setCoreProviderData] = useState<NameValuePair[]>([]);

    const {hasJob, latestJob} =
        useLatestSpecificationJobWithMonitoring(specificationId,
            [JobType.RefreshFundingJob, JobType.ApproveAllProviderFundingJob,
                JobType.ApproveBatchProviderFundingJob, JobType.PublishAllProviderFundingJob,
                JobType.PublishBatchProviderFundingJob],
            err => addError({error: err, description: "Error while checking for specification jobs"}));

    const {data: coreProviders, isLoading: isLoadingCoreProviders} = useQuery<CoreProviderSummary[], AxiosError>(
        `coreProviderSummary-for-${fundingStreamId}`,
        async () => (await providerVersionService.getCoreProvidersByFundingStream(fundingStreamId as string)).data,
        {
            enabled: providerSource === ProviderSource.CFS,
            retry: false,
            refetchOnWindowFocus: false,
            onError: err => err.response?.status !== 404 &&
                addError({
                    error: err,
                    description: "Could not find a provider data source",
                    fieldName: "selectCoreProvider"
                }),
        }
    );

    const {data: providerSnapshots, isLoading: isLoadingProviderSnapshots} = useQuery<ProviderSnapshot[], AxiosError>(
        `coreProviderSummary-for-${fundingStreamId}`,
        async () => (await providerService.getProviderSnapshotsByFundingStream(fundingStreamId as string)).data,
        {
            enabled: providerSource === ProviderSource.FDZ,
            retry: false,
            refetchOnWindowFocus: false,
            onError: err => err.response?.status !== 404 &&
                addError({
                    error: err,
                    description: "Could not find a provider data source",
                    fieldName: "selectCoreProvider"
                }),
            onSuccess: results => {
                clearErrorMessages(["selectCoreProvider"]);
            }
        }
    );

    const [templateVersionData, setTemplateVersionData] = useState<NameValuePair[]>([]);
    const {
        data: publishedFundingTemplates,
        isLoading: isLoadingPublishedFundingTemplates
    } = useQuery<PublishedFundingTemplate[], AxiosError>(
        `published-funding-templates-for-${fundingStreamId}-${fundingPeriodId}`,
        async () => (await policyService.getPublishedTemplatesByStreamAndPeriod(fundingStreamId as string, fundingPeriodId as string)).data,
        {
            enabled: (fundingStreamId && fundingStreamId.length > 0 && fundingPeriodId && fundingPeriodId.length > 0) === true,
            retry: false,
            refetchOnWindowFocus: false,
            onError: err => err.response?.status !== 404 &&
                addError({
                    error: err,
                    description: "Could not find any published funding templates",
                    fieldName: "selectTemplateVersion"
                }),
            onSuccess: results => {
                clearErrorMessages(["selectTemplateVersion"]);
            }
        }
    );

    const [isUpdating, setIsUpdating] = useState(false);
    const history = useHistory();
    const dispatch = useDispatch();
    const {errors, addError, clearErrorMessages} = useErrors();
    const errorSuggestion = <p>If the problem persists please contact the <a
        href="https://dfe.service-now.com/serviceportal" className="govuk-link">helpdesk</a></p>;

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
        let isValid: boolean = true;

        if (!selectedName || selectedName.length == 0) {
            addError({error: "Invalid specification name", fieldName: "name"})
            isValid = false;
        }
        if (!selectedDescription || selectedDescription.length == 0) {
            addError({error: "Missing description", fieldName: "description"})
            isValid = false;
        }
        if (providerSource) {
            if (providerSource === ProviderSource.CFS && (!selectedProviderVersionId || selectedProviderVersionId.length == 0)) {
                addError({error: "Missing core provider version", fieldName: "selectCoreProvider"});
                isValid = false;
            }
            if (providerSource === ProviderSource.FDZ && fundingConfiguration?.updateCoreProviderVersion !== UpdateCoreProviderVersion.Manual && enableTrackProviderData === undefined) {
                addError({
                    error: "Please select whether you want to track latest core provider data",
                    fieldName: "trackProviderData"
                });
                isValid = false;
            }
            if (providerSource === ProviderSource.FDZ && (fundingConfiguration?.updateCoreProviderVersion === UpdateCoreProviderVersion.Manual || enableTrackProviderData === ProviderDataTrackingMode.Manual) &&
                (!selectedProviderSnapshotId || selectedProviderSnapshotId.length == 0)) {
                addError({error: "Missing core provider version", fieldName: "selectCoreProvider"});
                isValid = false;
            }
        }

        if (!selectedTemplateVersion || selectedTemplateVersion.length == 0) {
            addError({error: "Missing template version", fieldName: "selectTemplateVersion"})
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
                providerSnapshotId: providerSource === ProviderSource.FDZ && enableTrackProviderData === ProviderDataTrackingMode.Manual && selectedProviderSnapshotId ?
                    parseInt(selectedProviderSnapshotId) : undefined,
                assignedTemplateIds: assignedTemplateIdsValue,
                coreProviderVersionUpdates: providerSource === ProviderSource.FDZ ? enableTrackProviderData : undefined
            };

            try {
                await specificationService.updateSpecificationService(updateSpecificationViewModel, specificationId);
                setIsUpdating(false);
                await clearSpecificationFromCache();
                const jobMonitoringFilter: JobMonitoringFilter = {
                    specificationId: specificationId,
                    jobTypes: [JobType.EditSpecificationJob],
                    includeChildJobs: false,
                    jobId: undefined
                }
                dispatch(action.upsertJobObserverState(jobMonitoringFilter));
                history.push(`/ViewSpecification/${specificationId}`);
            } catch (error) {
                if (error.response && error.response.data["Name"] !== undefined) {
                    addError({
                        error: error.response.data["Name"],
                        description: `Failed to save`,
                        suggestion: errorSuggestion
                    });
                } else {
                    addError({error: error, description: `Specification failed to update, please try again`});
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
                if (specification.coreProviderVersionUpdates === ProviderDataTrackingMode.Manual && specification.providerSnapshotId) {
                    setSelectedProviderSnapshotId(specification.providerSnapshotId.toString());
                } else {
                    setSelectedProviderSnapshotId(undefined);
                }
            }
        }
    }, [specification])

    useEffect(() => {
        if (specification && fundingStreamId && publishedFundingTemplates) {
            const templates = publishedFundingTemplates.map(publishedFundingTemplate => ({
                name: publishedFundingTemplate.templateVersion,
                value: publishedFundingTemplate.templateVersion
            }));
            setTemplateVersionData(templates);
            const selectedVersion = templates.find(t => t.value === specification.templateIds[fundingStreamId]);
            if (selectedVersion) {
                setSelectedTemplateVersion(selectedVersion.value);
            }
        }
    }, [specification, publishedFundingTemplates])

    useEffect(() => {
        if (providerSource === ProviderSource.CFS && coreProviders) {
            clearErrorMessages(["selectCoreProvider"]);
            const providerData = coreProviders.map(data => ({
                name: data.name,
                value: data.providerVersionId
            }));
            setCoreProviderData(providerData);
            const selectedProviderVersion = providerData.find(p => specification && p.value === specification.providerVersionId);
            selectedProviderVersion && setSelectedProviderVersionId(selectedProviderVersion.value);
        }

        if (providerSnapshots && providerSource === ProviderSource.FDZ) {
            const providerData = providerSnapshots.map(coreProviderItem => ({
                name: coreProviderItem.name,
                value: coreProviderItem.providerSnapshotId?.toString()
            }));
            setCoreProviderData(providerData);
            const selectedProviderSnapshot = providerData.find(p => specification && p.value === specification.providerSnapshotId?.toString());
            if (selectedProviderSnapshot) {
                setSelectedProviderSnapshotId(selectedProviderSnapshot.value);
            }
        }
    }, [providerSource, coreProviders, providerSnapshots])

    const isLoading: boolean = isLoadingPublishedFundingTemplates || isLoadingFundingConfiguration || isLoadingCoreProviders || isLoadingProviderSnapshots || isLoadingSpecification;

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"View specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={"Edit specification"}/>
            </Breadcrumbs>
            <div className="govuk-main-wrapper">

                <PermissionStatus requiredPermissions={missingPermissions}
                                  hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}/>

                <MultipleErrorSummary errors={errors}/>

                {(isLoading || isUpdating || (hasJob && !latestJob?.isComplete)) &&
                <LoadingStatus title={isUpdating ? "Updating Specification" :
                    `Loading ${
                        (hasJob && !latestJob?.isComplete) ? "specification jobs" :
                            isLoadingSpecification ? "specification" :
                                isLoadingFundingConfiguration ? "funding configuration" :
                                    isLoadingPublishedFundingTemplates ? "templates" :
                                        isLoadingProviderSnapshots ? "provider snapshots" :
                                            isLoadingCoreProviders ? "core providers" : ""}`}
                               subTitle="Please wait"
                               description={isUpdating ? "This can take a few minutes" : ""}/>
                }
                {!isLoading && !isUpdating && (!hasJob || latestJob?.isComplete) &&
                <fieldset className="govuk-fieldset" id="update-specification-fieldset"
                          data-testid="edit-specification-form">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 className="govuk-fieldset__heading">
                            Edit specification
                        </h1>
                    </legend>
                    <div
                        className={`govuk-form-group ${errors.filter(e => e.fieldName === "name").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <label className="govuk-label" htmlFor="name" id="name-description">
                            Specification name
                        </label>
                        <input className="govuk-input"
                               id="name"
                               name="name"
                               aria-describedby="name-description"
                               type="text"
                               value={selectedName || ''}
                               onChange={handleSpecificationNameChange}/>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="funding-stream">
                            Funding stream
                        </label>
                        <h3 className="govuk-heading-m" id="funding-stream">{fundingStreamId}</h3>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="funding-period">
                            Funding period
                        </label>
                        <h3 className="govuk-heading-m"
                            id="funding-period">{specification && specification?.fundingPeriod?.name}</h3>
                    </div>

                    {providerSource === ProviderSource.FDZ && (fundingConfiguration?.updateCoreProviderVersion === (UpdateCoreProviderVersion.ToLatest || UpdateCoreProviderVersion.Paused)) &&
                    <div
                        className={`govuk-form-group ${errors.filter(e => e.fieldName === "trackProviderData").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" id="trackProviderData"
                                  aria-describedby="trackProviderData-hint" role="radiogroup">
                            <legend className="govuk-label" id="trackProviderData-label">
                                Track latest core provider data?
                            </legend>
                            <div id="trackProviderData-hint" className="govuk-hint">
                                Select yes if you wish to use the latest available provider data.
                            </div>
                            {errors.map(error => error.fieldName === "trackProviderData" &&
                                <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}
                                        </span>
                            )}
                            <div className="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input"
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
                                    <input className="govuk-radios__input"
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
                    }

                    {(providerSource === ProviderSource.CFS || fundingConfiguration?.updateCoreProviderVersion === UpdateCoreProviderVersion.Manual || enableTrackProviderData === ProviderDataTrackingMode.Manual) &&
                    <div
                        className={`govuk-form-group ${errors.filter(e => e.fieldName === "selectCoreProvider").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <label className="govuk-label" htmlFor="selectCoreProvider">
                            Core provider data
                        </label>
                        <select className="govuk-select"
                                id="selectCoreProvider"
                                name="selectCoreProvider"
                                disabled={coreProviderData.length === 0}
                                value={providerSource === ProviderSource.CFS ? selectedProviderVersionId : selectedProviderSnapshotId}
                                onChange={handleCoreProviderChange}>
                            <option value="">Select core provider</option>
                            {coreProviderData.map((cp, index) =>
                                <option key={`provider-${index}`}
                                        value={cp.value}>
                                    {cp.name}
                                </option>)}
                        </select>
                    </div>
                    }

                    <div
                        className={`govuk-form-group ${errors.filter(e => e.fieldName === "selectTemplateVersion").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <label className="govuk-label" htmlFor="selectTemplateVersion">
                            Template version
                        </label>
                        <select className="govuk-select"
                                id="selectTemplateVersion"
                                name="selectTemplateVersion"
                                disabled={templateVersionData.length === 0}
                                value={selectedTemplateVersion}
                                onChange={handleTemplateVersionChange}>
                            <option value="">Select template version</option>
                            {templateVersionData
                                .sort((a, b) => parseFloat(a.value) - parseFloat(b.value))
                                .map((cp, index) =>
                                    <option key={`template-version-${index}`}
                                            value={cp.value}
                                            data-testid="templateVersion-option">
                                        {cp.name}
                                    </option>)}
                        </select>
                    </div>

                    <div
                        className={`govuk-form-group ${errors.filter(e => e.fieldName === "description").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <label className="govuk-label" htmlFor="description" id="description-hint">
                            Can you provide more detail?
                        </label>
                        <textarea className="govuk-textarea"
                                  id="description"
                                  name="description"
                                  rows={8}
                                  aria-describedby="description-hint"
                                  onChange={handleDescriptionChange}
                                  value={selectedDescription}/>
                    </div>
                    <div className="govuk-form-group">
                        <button id="submit-specification-button" className="govuk-button govuk-!-margin-right-1"
                                data-module="govuk-button"
                                onClick={submitUpdateSpecification}>
                            Save and continue
                        </button>
                        <Link id="cancel-update-specification" to={`/ViewSpecification/${specificationId}`}
                              className="govuk-button govuk-button--secondary"
                              data-module="govuk-button">
                            Cancel
                        </Link>
                    </div>
                </fieldset>
                }
                {!isUpdating &&
                <div className="govuk-form-group">
                    <BackLink to={`/ViewSpecification/${specificationId}`}/>
                </div>
                }
            </div>
        </div>
        <Footer/>
    </div>
}
