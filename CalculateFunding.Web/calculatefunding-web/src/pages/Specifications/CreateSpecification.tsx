import React, {useEffect, useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {createSpecificationService, getFundingPeriodsByFundingStreamIdService} from "../../services/specificationService";
import {
    getFundingConfiguration,
    getFundingStreamsService,
    getPublishedTemplatesByStreamAndPeriod
} from "../../services/policyService";
import {FundingConfiguration, FundingPeriod, FundingStream} from "../../types/viewFundingTypes";
import {getProviderByFundingStreamIdService} from "../../services/providerVersionService";
import {CoreProviderSummary, ProviderSnapshot, ProviderSource} from "../../types/CoreProviderSummary";
import {CreateSpecificationViewModel} from "../../types/Specifications/CreateSpecificationViewModel";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {ErrorSummary} from "../../components/ErrorSummary";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Section} from "../../types/Sections";
import {Link} from "react-router-dom";
import {useHistory} from "react-router";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {HubConnectionBuilder} from "@microsoft/signalr";
import {JobMessage} from "../../types/jobMessage";
import {PublishedFundingTemplate} from "../../types/TemplateBuilderDefinitions";
import {ErrorMessage} from "../../types/ErrorMessage";
import {getProviderSnapshotsForFundingStreamService} from "../../services/providerService";
import {CompletionStatus} from "../../types/CompletionStatus";
import {RunningStatus} from "../../types/RunningStatus";

export function CreateSpecification() {
    const [fundingStreamData, setFundingStreamData] = useState<FundingStream[]>([]);
    const [fundingPeriodData, setFundingPeriodData] = useState<FundingPeriod[]>([]);
    const [coreProviderData, setCoreProviderData] = useState<CoreProviderSummary[]>([]);
    const [providerSnapshots, setProviderSnapshots] = useState<ProviderSnapshot[]>([]);
    const [templateVersionData, setTemplateVersionData] = useState<PublishedFundingTemplate[]>([]);
    const [selectedName, setSelectedName] = useState<string>("");
    const [selectedFundingStream, setSelectedFundingStream] = useState<string>("");
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<string>("");
    const [selectedProviderVersionId, setSelectedProviderVersionId] = useState<string>("");
    const [selectedProviderSnapshotId, setSelectedProviderSnapshotId] = useState<any>(null);
    const [selectedTemplateVersion, setSelectedTemplateVersion] = useState<string>("");
    const [selectedDescription, setSelectedDescription] = useState<string>("");
    const [formValid, setFormValid] = useState({
        formSubmitted: false,
        formValid: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [fundingPeriodIsLoading, setFundingPeriodIsLoading] = useState<boolean>(false);
    const [newSpecificationId, setNewSpecificationId] = useState<string>('');
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [providerSource, setProviderSource] = useState<ProviderSource>();
    let history = useHistory();

    useEffect(() => {
        const getStreams = async () => {
            try {
                const streamResult = await getFundingStreamsService(true);
                setFundingStreamData(streamResult.data as FundingStream[]);
            } catch {
                addErrorMessage("There was a problem loading the funding streams. Please try refreshing the page.");
            }
        };

        getStreams();
    }, []);

    useEffect(() => {
        const updateFundingPeriods = async () => {
            try {
                setFundingPeriodIsLoading(true);
                setFundingPeriodData([]);
                const periodResult = await getFundingPeriodsByFundingStreamIdService(selectedFundingStream);
                setFundingPeriodData(periodResult.data);
            } catch (err) {
                if (err.response.status === 404) {
                    addErrorMessage("No funding periods exist for your selection.");
                } else {
                    addErrorMessage("There was a problem loading the funding periods. Please try again.");
                }
            } finally {
                setFundingPeriodIsLoading(false);
            }
        };

        if (selectedFundingStream !== "") {
            updateFundingPeriods();
        }
    }, [selectedFundingStream]);

    useEffect(() => {
        const updateTemplateVersions = async (fundingStreamId: string, fundingPeriodId: string) => {
            try {
                setTemplateVersionData([]);
                const publishedFundingTemplates = (await getPublishedTemplatesByStreamAndPeriod(fundingStreamId, fundingPeriodId)).data;
                setTemplateVersionData(publishedFundingTemplates);
            } catch (err) {
                if (err.response.status == 404) {
                    addErrorMessage("No published template exists for your selections.")
                } else {
                    addErrorMessage("There was a problem loading the template versions. Please try again.");
                }
            }
        };

        const updateCoreProviderData = async (providerSource: ProviderSource) => {
            setProviderSource(providerSource);
            try {
                if (providerSource === ProviderSource.CFS) {
                    const coreProviderResult = await getProviderByFundingStreamIdService(selectedFundingStream);
                    setCoreProviderData(coreProviderResult.data as CoreProviderSummary[]);
                } else if (providerSource === ProviderSource.FDZ) {
                    const coreProviderSnapshotsResult = await getProviderSnapshotsForFundingStreamService(selectedFundingStream);
                    const providerSnapshots = coreProviderSnapshotsResult.data as ProviderSnapshot[];
                    setProviderSnapshots(providerSnapshots);
                }
            } catch (err) {
                if (err.response != null) {
                    if (err.response.status === 404) {
                        addErrorMessage("No provider data exists for your selections.");
                    } else {
                        addErrorMessage("There was a problem loading the core providers. Please try again.");
                    }
                }
            }
        };

        if (selectedFundingPeriod !== "" && selectedFundingStream !== "") {
            getFundingConfiguration(selectedFundingStream, selectedFundingPeriod)
                .then(response => {
                    const fundingConfig = response.data;
                    updateTemplateVersions(selectedFundingStream, selectedFundingPeriod);
                    updateCoreProviderData(fundingConfig.providerSource);
                    setSelectedTemplateVersion(parseFloat(fundingConfig.defaultTemplateVersion).toFixed(1).toString());
                })
                .catch((err) => {
                    if (err.response != null && err.response.status !== 404) {
                        addErrorMessage("There was a problem fetching the data. Please try again.");
                    }
                });
        }
    }, [selectedFundingPeriod]);

    useEffect(() => {
        if (newSpecificationId.length === 0) return;

        const createHubConnection = async () => {
            const hubConnect = new HubConnectionBuilder()
                .withUrl(`/api/notifications`)
                .build();
            hubConnect.keepAliveIntervalInMilliseconds = 1000 * 60 * 3;
            hubConnect.serverTimeoutInMilliseconds = 1000 * 60 * 6;

            try {
                await hubConnect.start();

                hubConnect.on('NotificationEvent', (message: JobMessage) => {
                    if (message.jobType === "AssignTemplateCalculationsJob" &&
                        message.runningStatus === RunningStatus.Completed &&
                        message.specificationId === newSpecificationId) {
                        setIsLoading(false);
                        hubConnect.invoke("StopWatchingForAllNotifications").then(() => {
                            hubConnect.stop();
                        });
                        if (message.completionStatus !== CompletionStatus.Succeeded) {
                            addErrorMessage(message.outcome);
                        } else {
                            history.push(`/ViewSpecification/${newSpecificationId}`);
                        }
                    }
                });

                await hubConnect.invoke("StartWatchingForAllNotifications");

            } catch (err) {
                await hubConnect.stop();
                history.push(`/ViewSpecification/${newSpecificationId}`);
            }
        };

        createHubConnection();
    }, [newSpecificationId]);

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    function saveSpecificationName(e: React.ChangeEvent<HTMLInputElement>) {
        const specificationName = e.target.value;
        setSelectedName(specificationName);
    }

    function selectFundingStream(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingStreamId = e.target.value;
        clearErrorMessages();
        setSelectedFundingPeriod("");
        setSelectedProviderVersionId("");
        setSelectedTemplateVersion("");
        setSelectedFundingStream(fundingStreamId);
        setTemplateVersionData([]);
    }

    function selectFundingPeriod(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingPeriodId = e.target.value;
        clearErrorMessages();
        setSelectedTemplateVersion("");
        setSelectedFundingPeriod(fundingPeriodId);
    }

    function selectCoreProvider(e: React.ChangeEvent<HTMLSelectElement>) {
        const coreProviderId : string = e.target.value as string;
        if (providerSource?.toString() === ProviderSource[ProviderSource.CFS])
        {
            setSelectedProviderVersionId(coreProviderId);
        }
        else if (providerSource?.toString() === ProviderSource[ProviderSource.FDZ])
        {
            setSelectedProviderSnapshotId(parseInt(coreProviderId));
        }
    }

    function selectTemplateVersion(e: React.ChangeEvent<HTMLSelectElement>) {
        const templateVersionId = e.target.value;
        setSelectedTemplateVersion(templateVersionId);
    }

    function saveDescriptionName(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const specificationDescription = e.target.value;
        setSelectedDescription(specificationDescription);
    }

    async function submitSaveSpecification() {
        if (selectedName !== "" && selectedFundingStream !== "" &&
            selectedFundingPeriod !== "" && (selectedProviderVersionId !== "" || selectedProviderSnapshotId !== null)
            && selectedDescription !== "") {
            setFormValid({formValid: true, formSubmitted: true});
            setIsLoading(true);
            clearErrorMessages();
            setNewSpecificationId('');
            let assignedTemplateIdsValue: any = {};
            assignedTemplateIdsValue[selectedFundingStream] = selectedTemplateVersion;

            let createSpecificationViewModel: CreateSpecificationViewModel = {
                description: selectedDescription,
                fundingPeriodId: selectedFundingPeriod,
                fundingStreamId: selectedFundingStream,
                name: selectedName,
                providerVersionId: "",
                assignedTemplateIds: assignedTemplateIdsValue
            };

            if (providerSource?.toString() === ProviderSource[ProviderSource.CFS])
            {
                createSpecificationViewModel.providerVersionId = selectedProviderVersionId;
            }
            else if (providerSource?.toString() === ProviderSource[ProviderSource.FDZ])
            {
                createSpecificationViewModel.providerSnapshotId = selectedProviderSnapshotId
            }

            try {
                const createSpecificationResult = await createSpecificationService(createSpecificationViewModel);
                const specificationSummary = createSpecificationResult.data as SpecificationSummary;
                setNewSpecificationId(specificationSummary.id);
            } catch {
                setIsLoading(false);
                addErrorMessage("Specification failed to create. Please try again.");
            }
        } else {
            setFormValid({formSubmitted: true, formValid: false})
        }
    }

    return <div>
        <Header location={Section.Specifications} />
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"} />
                <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
                <Breadcrumb name={"Create specification"} />
            </Breadcrumbs>
            <div className="govuk-main-wrapper">
                <LoadingStatus title={"Creating Specification"}
                    subTitle={"Please wait whilst we create the specification"}
                    description={"This can take a few minutes"} id={"create-specification"}
                    hidden={!isLoading} />
                <div hidden={errors.length === 0}
                    className="govuk-error-summary"
                    aria-labelledby="error-summary-title" role="alert"
                    data-module="govuk-error-summary">
                    <h2 className="govuk-error-summary__title">
                        There is a problem
                    </h2>
                    <div className="govuk-error-summary__body">
                        <ul className="govuk-list govuk-error-summary__list">
                            {errors.map((error, i) =>
                                <li key={i}>
                                    <p className="govuk-body">
                                        {!error.fieldName && <span className="govuk-error-message">{error.message}</span>}
                                    </p>
                                </li>
                            )}
                            <li>If the problem persists please contact the <a href="https://dfe.service-now.com/serviceportal" className="govuk-link">helpdesk</a></li>
                        </ul>
                    </div>
                </div>
                <fieldset className="govuk-fieldset" id="create-specification-fieldset" hidden={isLoading}>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 className="govuk-fieldset__heading">
                            Create specification
                        </h1>
                    </legend>
                    <div className="govuk-form-group"
                        hidden={(!formValid.formValid && !formValid.formSubmitted) || (formValid.formValid && formValid.formSubmitted)}>
                        <ErrorSummary title="Form not valid" error="Please complete all fields" suggestion="" />
                    </div>
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="specification-name">
                            Specification name
                        </label>
                        <input className="govuk-input" id="aspecification-name" name="specification-name" type="text"
                            onChange={saveSpecificationName} />
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="funding-stream">
                            Funding streams
                        </label>
                        <select className="govuk-select" id="funding-stream" name="funding-stream" onChange={selectFundingStream}>
                            <option value="">Select funding Stream</option>
                            {fundingStreamData.map((fs, index) => <option key={index} value={fs.id}>{fs.name}</option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="funding-period">
                            Funding period
                        </label>
                        <select className="govuk-select" id="funding-period" name="funding-period"
                            disabled={fundingPeriodData.length === 0 || fundingPeriodIsLoading} onChange={selectFundingPeriod}>
                            <option value="">Select funding period</option>
                            {fundingPeriodData.map((fp, index) => <option key={index} value={fp.id}>{fp.name}</option>)}
                        </select>
                        <LoadingFieldStatus title={"Funding periods loading"} hidden={!fundingPeriodIsLoading} />
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="core-provider-data">
                            Core provider data
                        </label>
                        <select className="govuk-select" id="core-provider-data" name="core-provider-data"
                            disabled={coreProviderData.length === 0 && providerSnapshots.length === 0} onChange={selectCoreProvider}>
                            <option value="">Select core provider</option>
                            {
                                coreProviderData.length > 0 ?
                                    coreProviderData.map((cp, index) => <option key={index}
                                                                                value={cp.providerVersionId}>{cp.name}</option>)
                                    : null
                            }
                            {
                                providerSnapshots.length > 0 ?
                                    providerSnapshots.map((cp, index) => <option key={index}
                                                                                value={cp.providerSnapshotId}>{cp.name}</option>)
                                    : null
                            }
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="template-version">
                            Template version
                        </label>
                        <select className="govuk-select" id="template-version" name="template-version" disabled={templateVersionData.length === 0}
                            onChange={selectTemplateVersion} value={selectedTemplateVersion || ""}>
                            <option value="">Select template version</option>
                            {templateVersionData.map((publishedFundingTemplate, index) =>
                                <option key={index} value={publishedFundingTemplate.templateVersion}>
                                    {publishedFundingTemplate.templateVersion}
                                </option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="more-detail">
                            Can you provide more detail?
                        </label>
                        <textarea className="govuk-textarea" id="more-detail" name="more-detail" rows={8}
                            aria-describedby="more-detail-hint"
                            onChange={(e) => saveDescriptionName(e)}></textarea>
                    </div>
                    <div className="govuk-form-group">
                        <button id="submit-specification-button" className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                            onClick={submitSaveSpecification}>
                            Save and continue
                        </button>
                        <Link id="cancel-create-specification" to="/SpecificationsList" className="govuk-button govuk-button--secondary"
                            data-module="govuk-button">
                            Cancel
                        </Link>
                    </div>
                </fieldset>
            </div>
        </div>
        <Footer />
    </div>
}
