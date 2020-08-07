import React, {useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {
    createSpecificationService,
    getFundingPeriodsByFundingStreamIdService
} from "../../services/specificationService";
import {
    getDefaultTemplateVersionService,
    getFundingStreamsService, getTemplatesService
} from "../../services/policyService";
import {FundingPeriod, FundingStream} from "../../types/viewFundingTypes";
import {getProviderByFundingStreamIdService} from "../../services/providerVersionService";
import {CoreProviderSummary} from "../../types/CoreProviderSummary";
import {CreateSpecificationViewModel} from "../../types/Specifications/CreateSpecificationViewModel";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {ErrorSummary} from "../../components/ErrorSummary";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Section} from "../../types/Sections";
import {Link} from "react-router-dom";
import {useHistory} from "react-router";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {HubConnectionBuilder} from "@aspnet/signalr";
import {JobMessage} from "../../types/jobMessage";
import {PublishedFundingTemplate} from "../../types/TemplateBuilderDefinitions";

export function CreateSpecification() {
    const [fundingStreamData, setFundingStreamData] = useState<FundingStream[]>([]);
    const [fundingPeriodData, setFundingPeriodData] = useState<FundingPeriod[]>([]);
    const [coreProviderData, setCoreProviderData] = useState<CoreProviderSummary[]>([]);
    const [templateVersionData, setTemplateVersionData] = useState<PublishedFundingTemplate[]>([]);
    const [selectedName, setSelectedName] = useState<string>("");
    const [selectedFundingStream, setSelectedFundingStream] = useState<string>("");
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<string>("");
    const [selectedProviderVersionId, setSelectedProviderVersionId] = useState<string>("");
    const [selectedTemplateVersion, setSelectedTemplateVersion] = useState<string>("");
    const [selectedDescription, setSelectedDescription] = useState<string>("");
    const [formValid, setFormValid] = useState({
        formSubmitted: false,
        formValid: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [fundingPeriodIsLoading, setFundingPeriodIsLoading] = useState<boolean>(false);
    const [createSpecificationFailOutcome, setCreateSpecificationFailOutcome] = useState<string>("");
    const [createSpecificationFailed, setCreateSpecificationFailed] = useState<boolean>(false);
    let history = useHistory();

    useEffectOnce(() => {

        createHubConnection();

        const getStreams = async () => {
            const streamResult = await getFundingStreamsService(true);
            setFundingStreamData(streamResult.data as FundingStream[]);
        };
        getStreams().then(result => {
            return true;
        });
    });

    function populateFundingPeriods(fundingStream: string) {
        if (fundingStream !== "") {
            setFundingPeriodIsLoading(true);
            const getFundingPeriods = async () => {
                const periodResult = await getFundingPeriodsByFundingStreamIdService(fundingStream);
                setFundingPeriodData(periodResult.data)
                setFundingPeriodIsLoading(false);
            };
            getFundingPeriods().then(result => {
                return true;
            });
        }
    }

    function populateCoreProviders(fundingPeriod: string) {
        if (fundingPeriod !== "") {
            const getCoreProviders = async () => {
                const coreProviderResult = await getProviderByFundingStreamIdService(fundingPeriod);
                setCoreProviderData(coreProviderResult.data)
            };
            getCoreProviders().then(result => {
                return true;
            });
        }
    }

    function populateTemplateVersion(fundingStreamId: string, fundingPeriodId: string) {
        if (fundingPeriodId !== "" && fundingStreamId !== "") {
            getTemplatesService(fundingStreamId, fundingPeriodId).then(templatesResult => {
                if (templatesResult.status === 200 || templatesResult.status === 201) {
                    const publishedFundingTemplates = templatesResult.data as PublishedFundingTemplate[];
                    getDefaultTemplateVersionService(fundingStreamId, fundingPeriodId).then(result => {
                        const defaultTemplateVersionId = (result.data != null && result.data !== "" ? parseFloat(result.data).toFixed(1) : "") as string;
                        if (defaultTemplateVersionId !== "") {
                            setTemplateVersionData(publishedFundingTemplates);
                            setSelectedTemplateVersion(defaultTemplateVersionId);
                        }
                        else {
                            setTemplateVersionData(publishedFundingTemplates);
                        }
                    }).catch(() => {
                        setTemplateVersionData(publishedFundingTemplates);
                    });
                }
            })
        }
    }

    function saveSpecificationName(e: React.ChangeEvent<HTMLInputElement>) {
        const specificationName = e.target.value;
        setSelectedName(specificationName);
    }

    function selectFundingStream(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingStreamId = e.target.value;
        setSelectedFundingStream(fundingStreamId);
        populateFundingPeriods(fundingStreamId);
        populateCoreProviders(fundingStreamId);

    }

    function selectFundingPeriod(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingPeriodId = e.target.value;
        setSelectedFundingPeriod(fundingPeriodId);
        populateTemplateVersion(selectedFundingStream, fundingPeriodId);
    }

    function selectCoreProvider(e: React.ChangeEvent<HTMLSelectElement>) {
        const coreProviderId = e.target.value;
        setSelectedProviderVersionId(coreProviderId);
    }

    function selectTemplateVersion(e: React.ChangeEvent<HTMLSelectElement>) {
        const templateVersionId = e.target.value;
        setSelectedTemplateVersion(templateVersionId);
    }

    function saveDescriptionName(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const specificationDescription = e.target.value;
        setSelectedDescription(specificationDescription);
    }

    function submitSaveSpecification() {
        if (selectedName !== "" && selectedFundingStream !== "" && selectedFundingPeriod !== "" && selectedProviderVersionId !== "" && selectedDescription !== "") {
            setFormValid({formValid: true, formSubmitted: true});
            setIsLoading(true);
            setCreateSpecificationFailed(false);
            let assignedTemplateIdsValue: any = {};
            assignedTemplateIdsValue[selectedFundingStream] = selectedTemplateVersion;
            let createSpecificationViewModel: CreateSpecificationViewModel = {
                description: selectedDescription,
                fundingPeriodId: selectedFundingPeriod,
                fundingStreamId: selectedFundingStream,
                name: selectedName,
                providerVersionId: selectedProviderVersionId,
                assignedTemplateIds: assignedTemplateIdsValue
            };

            const createSpecification = async () => {
                const createSpecificationResult = await createSpecificationService(createSpecificationViewModel);
                return createSpecificationResult;
            };
            createSpecification().then((result) => {
                if (result.status === 200) {
                    let response = result.data as SpecificationSummary;
                    history.push(`/ViewSpecification/${response.id}`);
                } else {
                    setCreateSpecificationFailed(true);
                    setIsLoading(false);
                }
            }).catch(() => {
                setCreateSpecificationFailed(true);
                setIsLoading(false);
            });
        } else {
            setFormValid({formSubmitted: true, formValid: false})
        }
    }

    async function createHubConnection() {
        const hubConnect = new HubConnectionBuilder()
            .withUrl(`/api/notifications`)
            .build();
        try {
            await hubConnect.start();

            hubConnect.on('NotificationEvent', (message: JobMessage) => {
                if (message.jobType === "CreateSpecificationJob" && message.completionStatus !== "Succeeded") {
                    setCreateSpecificationFailOutcome(message.outcome);
                    hubConnect.stop();
                }
            });

            await hubConnect.invoke("StartWatchingForAllNotifications");

        } catch (err) {
            await hubConnect.stop();
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
                <div hidden={!createSpecificationFailed}
                    className="govuk-error-summary"
                    aria-labelledby="error-summary-title" role="alert"
                    data-module="govuk-error-summary">
                    <h2 className="govuk-error-summary__title">
                        There is a problem
                    </h2>
                    <div className="govuk-error-summary__body">
                        <ul className="govuk-list govuk-error-summary__list">
                            <li>
                                <p className="govuk-body">
                                    Specification failed to create, please try again
                                </p>
                            </li>
                            <li>
                                {createSpecificationFailOutcome}
                            </li>
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
                        <label className="govuk-label" htmlFor="address-line-1">
                            Specification name
                        </label>
                        <input className="govuk-input" id="address-line-1" name="address-line-1" type="text"
                            onChange={(e) => saveSpecificationName(e)} />
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Funding streams
                        </label>
                        <select className="govuk-select" id="sort" name="sort" onChange={(e) => selectFundingStream(e)}>
                            <option value="-1">Select funding Stream</option>
                            {fundingStreamData.map((fs, index) => <option key={index} value={fs.id}>{fs.name}</option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Funding period
                        </label>
                        <select className="govuk-select" id="sort" name="sort" disabled={fundingPeriodData.length === 0 || fundingPeriodIsLoading} onChange={(e) => selectFundingPeriod(e)}>
                            <option value="-1">Select funding period</option>
                            {fundingPeriodData.map((fp, index) => <option key={index} value={fp.id}>{fp.name}</option>)}
                        </select>
                        <LoadingFieldStatus title={"Funding streams loading"} hidden={!fundingPeriodIsLoading} />
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Core provider data
                        </label>
                        <select className="govuk-select" id="sort" name="sort" disabled={coreProviderData.length === 0} onChange={(e) => selectCoreProvider(e)}>
                            <option value="-1">Select core provider</option>
                            {coreProviderData.map((cp, index) => <option key={index}
                                value={cp.providerVersionId}>{cp.name}</option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Template version
                        </label>
                        <select className="govuk-select" id="sort" name="sort" disabled={templateVersionData.length === 0}
                            onChange={(e) => selectTemplateVersion(e)} value={selectedTemplateVersion || "-1"}>
                            <option value="-1">Select template version</option>
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
