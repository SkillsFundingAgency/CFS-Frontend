import React, {useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import * as specificationService from "../../services/specificationService";
import * as providerVersionService from "../../services/providerVersionService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {RouteComponentProps, useHistory} from "react-router";
import {Section} from "../../types/Sections";
import {CoreProviderSummary, ProviderSnapshot, ProviderSource} from "../../types/CoreProviderSummary";
import {UpdateSpecificationViewModel} from "../../types/Specifications/UpdateSpecificationViewModel";
import {Link} from "react-router-dom";
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
    const [selectedTemplateVersion, setSelectedTemplateVersion] = useState<string>();
    const [selectedDescription, setSelectedDescription] = useState<string>("");

    const {specification, isLoadingSpecification} =
        useSpecificationSummary(specificationId,
            err => addError({error: err, description: "Error while loading specification"}),
            result => {
                setSelectedName(result.name);
                setSelectedDescription(result.description ? result.description : "");
            });

    const fundingStreamId = specification && specification.fundingStreams[0].id
    const fundingPeriodId = specification && specification.fundingPeriod.id;

    const {isLoadingFundingConfiguration} =
        useFundingConfiguration(fundingStreamId, fundingPeriodId,
            err => addError({error: err, description: "Error while loading funding configuration"}),
            result => setProviderSource(result.providerSource));

    const [providerSource, setProviderSource] = useState<ProviderSource>();
    const [coreProviderData, setCoreProviderData] = useState<NameValuePair[]>([]);

    const {data: coreProviders, isLoading: isLoadingCoreProviders} = useQuery<CoreProviderSummary[], AxiosError>(
        `coreProviderSummary-for-${fundingStreamId}`,
        async () => (await providerVersionService.getCoreProvidersByFundingStream(fundingStreamId as string)).data,
        {
            enabled: providerSource === ProviderSource.CFS,
            retry: false,
            onError: err => err.response?.status !== 404 && 
                addError({error: err, description: "Could not find a provider data source", fieldName: "selectCoreProvider"}),
            onSuccess: results => {
                if (providerSource === ProviderSource.CFS) {
                    clearErrorMessages(["selectCoreProvider"]);
                    const providerData = results.map(coreProviderItem => ({
                        name: coreProviderItem.name,
                        value: coreProviderItem.providerVersionId
                    }));
                    setCoreProviderData(providerData);
                    const selectedProviderVersion = providerData.find(p => specification && p.value === specification.providerVersionId);
                    selectedProviderVersion && setSelectedProviderVersionId(selectedProviderVersion.value);
                }
            }
        }
    );
    
    const {data: providerSnapshots, isLoading: isLoadingProviderSnapshots} = useQuery<ProviderSnapshot[], AxiosError>(
        `coreProviderSummary-for-${fundingStreamId}`,
        async () => (await providerService.getProviderSnapshotsByFundingStream(fundingStreamId as string)).data,
        {
            enabled: providerSource === ProviderSource.FDZ,
            retry: false,
            onError: err => err.response?.status !== 404 && 
                addError({error: err, description: "Could not find a provider data source", fieldName: "selectCoreProvider"}),
            onSuccess: results => {
                clearErrorMessages(["selectCoreProvider"]);
                if (results && providerSource === ProviderSource.FDZ) {
                    const providerData = results.map(coreProviderItem => ({
                        name: coreProviderItem.name,
                        value: coreProviderItem.providerSnapshotId?.toString()
                    }));
                    setCoreProviderData(providerData);
                    const selectedProviderSnapshot = providerData.find(p => specification && p.value === specification.providerSnapshotId?.toString());
                    if (selectedProviderSnapshot) {
                        setSelectedProviderVersionId(selectedProviderSnapshot.value);
                    }
                }
            }
        }
    );

    const [templateVersionData, setTemplateVersionData] = useState<NameValuePair[]>([]);
    const {data: publishedFundingTemplates, isLoading: isLoadingPublishedFundingTemplates} = useQuery<PublishedFundingTemplate[], AxiosError>(
        `published-funding-templates-for-${fundingStreamId}-${fundingPeriodId}`,
        async () => (await policyService.getPublishedTemplatesByStreamAndPeriod(fundingStreamId as string, fundingPeriodId as string)).data,
        {
            enabled: (fundingStreamId && fundingStreamId.length > 0 && fundingPeriodId && fundingPeriodId.length > 0) === true,
            retry: false,
            onError: err => err.response?.status !== 404 && 
                addError({error: err, description: "Could not find any published funding templates", fieldName: "selectTemplateVersion"}),
            onSuccess: results => {
                clearErrorMessages(["selectTemplateVersion"]);
                if (specification && fundingStreamId) {
                    const templateVersionData = results.map(publishedFundingTemplate => ({
                        name: publishedFundingTemplate.templateVersion,
                        value: publishedFundingTemplate.templateVersion
                    }));
                    setTemplateVersionData(templateVersionData);
                    const selectedVersion = templateVersionData.find(t => t.value === specification.templateIds[fundingStreamId]);
                    if (selectedVersion) {
                        setSelectedTemplateVersion(selectedVersion.value);
                    }
                }
            }
        }
    );

    const [isUpdating, setIsUpdating] = useState(false);
    const history = useHistory();
    const {errors, addError, clearErrorMessages} = useErrors();
    const errorSuggestion = <p>If the problem persists please contact the <a href="https://dfe.service-now.com/serviceportal" className="govuk-link">helpdesk</a></p>;

    function saveSpecificationName(e: React.ChangeEvent<HTMLInputElement>) {
        const specificationName = e.target.value;
        setSelectedName(specificationName);
        clearErrorMessages(["name"]);
    }

    function selectCoreProvider(e: React.ChangeEvent<HTMLSelectElement>) {
        const coreProviderId = e.target.value;
        setSelectedProviderVersionId(coreProviderId);
        clearErrorMessages(["selectCoreProvider"]);
    }

    function selectTemplateVersion(e: React.ChangeEvent<HTMLSelectElement>) {
        const templateVersionId = e.target.value;
        setSelectedTemplateVersion(templateVersionId);
        clearErrorMessages(["selectedTemplateVersion"]);
    }

    function saveDescriptionName(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const specificationDescription = e.target.value;
        setSelectedDescription(specificationDescription);
        clearErrorMessages(["description"]);
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
        if (!selectedProviderVersionId || selectedProviderVersionId.length == 0) {
            addError({error: "Missing core provider version", fieldName: "selectCoreProvider"});
            isValid = false;
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

            const updateSpecificationViewModel: UpdateSpecificationViewModel = {
                description: selectedDescription,
                fundingPeriodId: fundingPeriodId,
                fundingStreamId: fundingStreamId,
                name: selectedName,
                providerVersionId: providerSource === ProviderSource.CFS ? selectedProviderVersionId : undefined,
                providerSnapshotId: providerSource === ProviderSource.FDZ && selectedProviderVersionId ? parseInt(selectedProviderVersionId) : undefined,
                assignedTemplateIds: assignedTemplateIdsValue,
            };

            try {
                await specificationService.updateSpecificationService(updateSpecificationViewModel, specificationId);
                setIsUpdating(false);
                history.push(`/ViewSpecification/${specificationId}`);
            } catch (error) {
                if (error.response && error.response.data["Name"] !== undefined) {
                    addError({error: error.response.data["Name"], description: `Failed to save`, suggestion: errorSuggestion});
                } else {
                    addError({error: error, description: `Specification failed to update, please try again`});
                }
                setIsUpdating(false);
            }
        }
    }

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
                {(isLoading || isUpdating) &&
                <LoadingStatus title={isUpdating ? "Updating Specification" :
                    `Loading ${isLoadingSpecification ? "specification" :
                        isLoadingFundingConfiguration ? "funding configuration" :
                            isLoadingPublishedFundingTemplates ? "templates" :
                                isLoadingProviderSnapshots ? "provider snapshots" :
                                    isLoadingCoreProviders ? "core providers" : ""}`}
                               subTitle="Please wait"
                               description={isUpdating ? "This can take a few minutes" : ""} />
                }

                <MultipleErrorSummary errors={errors}/>

                {!isLoading && !isUpdating &&
                <fieldset className="govuk-fieldset" id="update-specification-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 className="govuk-fieldset__heading">
                            Edit specification
                        </h1>
                    </legend>
                    <div className={`govuk-form-group ${errors.filter(e => e.fieldName === "name").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <label className="govuk-label" htmlFor="name" id="name-description">
                            Specification name
                        </label>
                        <input className="govuk-input"
                               id="name"
                               name="name"
                               aria-describedby="name-description"
                               type="text"
                               value={selectedName}
                               onChange={saveSpecificationName}/>
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
                        <h3 className="govuk-heading-m" id="funding-period">{specification && specification.fundingPeriod.name}</h3>
                    </div>

                    <div className={`govuk-form-group ${errors.filter(e => e.fieldName === "selectCoreProvider").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <label className="govuk-label" htmlFor="selectCoreProvider">
                            Core provider data
                        </label>
                        <select className="govuk-select"
                                id="selectCoreProvider"
                                name="selectCoreProvider"
                                disabled={coreProviderData.length === 0}
                                value={selectedProviderVersionId}
                                onChange={selectCoreProvider}>
                            <option value="">Select core provider</option>
                            {coreProviderData.map((cp, index) =>
                                <option key={`provider-${index}`}
                                        value={cp.value}>
                                    {cp.name}
                                </option>)}
                        </select>
                    </div>

                    <div className={`govuk-form-group ${errors.filter(e => e.fieldName === "selectTemplateVersion").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <label className="govuk-label" htmlFor="selectTemplateVersion">
                            Template version
                        </label>
                        <select className="govuk-select"
                                id="selectTemplateVersion"
                                name="selectTemplateVersion"
                                disabled={templateVersionData.length === 0}
                                value={selectedTemplateVersion}
                                onChange={selectTemplateVersion}>
                            <option value="">Select template version</option>
                            {templateVersionData.map((cp, index) =>
                                <option key={`template-version-${index}`}
                                        value={cp.value}>
                                    {cp.name}
                                </option>)}
                        </select>
                    </div>

                    <div className={`govuk-form-group ${errors.filter(e => e.fieldName === "description").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <label className="govuk-label" htmlFor="description" id="description-hint">
                            Can you provide more detail?
                        </label>
                        <textarea className="govuk-textarea"
                                  id="description"
                                  name="description"
                                  rows={8}
                                  aria-describedby="description-hint"
                                  onChange={saveDescriptionName}
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
                {isUpdating &&
                <div className="govuk-form-group">
                    <Link id="cancel-update-specification" to={`/ViewSpecification/${specificationId}`}
                          className="govuk-button govuk-button--secondary"
                          data-module="govuk-button">
                        Back
                    </Link>
                </div>
                }
            </div>
        </div>
        <Footer/>
    </div>
}
