import React, {useState} from "react";
import {TemplatePermissions, TemplateResponse} from "../../types/TemplateBuilderDefinitions";
import {FundingPeriod, FundingStream} from "../../types/viewFundingTypes";
import {ErrorMessage} from "../../types/ErrorMessage";
import {useTemplatePermissions} from "../../hooks/TemplateBuilder/useTemplatePermissions";
import {
    cloneNewTemplateFromExisting,
    getAllFundingStreamsWithAvailablePeriods,
    getTemplateVersion
} from "../../services/templateBuilderDatasourceService";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PermissionStatus} from "../../components/PermissionStatus";
import {LoadingStatus} from "../../components/LoadingStatus";
// @ts-ignore
import {Link, useParams} from "react-router-dom";
import {Footer} from "../../components/Footer";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {useHistory} from "react-router";
import {FundingStreamAndPeriodSelection} from "../../components/TemplateBuilder/FundingStreamAndPeriodSelection";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {BackLink} from "../../components/BackLink";

export const CloneTemplate = () => {
    const {templateId, version} = useParams();
    const [fundingStream, setFundingStream] = useState<FundingStream>();
    const [fundingPeriods, setFundingPeriods] = useState<FundingPeriod[]>([]);
    const [templateToClone, setTemplateToClone] = useState<TemplateResponse>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedFundingPeriodId, setSelectedFundingPeriodId] = useState<string>();
    const [description, setDescription] = useState<string>("");
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
    const {canCreateTemplate, missingPermissions, fundingStreamPermissions} = useTemplatePermissions([TemplatePermissions.Create]);
    const history = useHistory();

    const fetchAvailableFundingConfigurations = async () => {
        const result = await getAllFundingStreamsWithAvailablePeriods();
        return result.data;
    }

    useEffectOnce(() => {
        setIsLoading(true);

        const fetchTemplateToClone = async (templateId: string, version: number) => {
            try {
                setIsLoading(true);
                const templateResult = await getTemplateVersion(templateId, version);
                if (templateResult.status !== 200) {
                    addErrorMessage("Could not fetch template from which to clone. " + templateResult.statusText);
                }
                const templateResponse = templateResult.data as TemplateResponse;
                setTemplateToClone(templateResponse);
                setFundingStream({id: templateResponse.fundingStreamId, name: templateResponse.fundingStreamName});
                await loadAvailable(templateResponse.fundingStreamId);
            } catch (err) {
                addErrorMessage(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const loadAvailable = async (fundingStreamId: string) => {
            if (!fundingStreamId) {
                return;
            }
            const fundingStreamWithPeriodsResponse = await fetchAvailableFundingConfigurations();
            setIsLoading(false);

            // extract funding stream matching the template we're cloning from
            const streamWithPeriods = fundingStreamWithPeriodsResponse
                .find(x => x.fundingStream.id === fundingStreamId);
            if (!streamWithPeriods) {
                addErrorMessage("No available funding streams with periods", "fundingStreamId");
                return;
            }
            // user has sufficient permissions?
            if (fundingStreamPermissions && !fundingStreamPermissions.some(f => f.permission === TemplatePermissions.Create &&
                f.fundingStreamId === fundingStreamId)) {
                addErrorMessage("Insufficient permissions to clone a template with this funding stream", "fundingStreamId");
                return;
            }
            populateFundingPeriods(streamWithPeriods.fundingPeriods);
        };

        try {
            fetchTemplateToClone(templateId, version);
        } catch
        (err) {
            addErrorMessage(`Template options could not be loaded: ${err.message}.`);
            setIsLoading(false);
        }
    }
    );

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const description = e.target.value;
        setDescription(description);
    }

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    function populateFundingPeriods(fundingPeriods: FundingPeriod[]) {
        setFundingPeriods([]);
        if (!fundingPeriods || fundingPeriods.length === 0) {
            addErrorMessage("No funding periods available for this funding stream. You will not be able to select a funding period if a template for this funding stream and period already exists. Please select a different funding stream.",
                "fundingPeriodId");
            setEnableSaveButton(false);
            return;
        }
        setFundingPeriods(fundingPeriods);
        setSelectedFundingPeriodId(fundingPeriods[0].id);
        setEnableSaveButton(true);
    }

    const handleFundingPeriodChange = (fundingPeriodId: string) => {
        clearErrorMessages();
        setSelectedFundingPeriodId(fundingPeriodId);
    }

    const handleSaveClick = async () => {
        if (!templateToClone || !enableSaveButton || !fundingStream) {
            return;
        }
        setEnableSaveButton(false);
        try {
            if (selectedFundingPeriodId === undefined) {
                addErrorMessage("Funding period is not defined", "fundingPeriodId");
                return;
            }

            setSaveMessage(`Saving template...`);

            const result = await cloneNewTemplateFromExisting(templateToClone.templateId, templateToClone.version, templateToClone.fundingStreamId, selectedFundingPeriodId, description);
            if (result.status === 201) {
                history.push(`/Templates/${result.data}/Edit`);
            } else {
                addErrorMessage(`Template creation failed: ` + result.status + ` ` + result.statusText + ` ` + result.data);
            }
        } catch (err) {
            addErrorMessage(`Template could not be saved: ${err.message}. Try refreshing the page and saving again.`);
            setSaveMessage(`Template could not be saved: ${err.message}.`);
            setEnableSaveButton(true);
        }
    }


    return (
        <div>
            <Header location={Section.Templates} />
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate Funding"} url={"/"} />
                    <Breadcrumb name={"Templates"} url={"/Templates/List"} />
                    <Breadcrumb name={isLoading ? "Loading..." : templateToClone ? templateToClone.name : "Template"}
                        url={`/Templates/${templateId}/Edit`} />
                    <Breadcrumb name={isLoading ? "Loading..." : templateToClone ? `Version ${templateToClone.majorVersion}.${templateToClone.minorVersion}` : ""}
                        url={templateToClone && `/Templates/${templateToClone.templateId}/Versions/${templateToClone.version}`} />
                    <Breadcrumb name={"Clone template"} />
                </Breadcrumbs>
                <PermissionStatus requiredPermissions={missingPermissions} hidden={isLoading} />
                {canCreateTemplate &&
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <MultipleErrorSummary errors={errors} />
                        </div>
                    </div>
                }
                <div className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">Clone a template</h1>
                    {templateToClone &&
                        <h3 className="govuk-caption-xl govuk-!-padding-bottom-5">
                            Clone a template of {templateToClone.name} version {templateToClone.majorVersion}.{templateToClone.minorVersion}
                        </h3>}
                    {canCreateTemplate &&
                        <form id="cloneTemplate">
                            <div className="govuk-grid-row" hidden={!isLoading}>
                                <LoadingStatus title={"Loading options..."} description={"Please wait whilst the options are loading"} />
                            </div>
                            {fundingStream && !isLoading &&
                                <FundingStreamAndPeriodSelection
                                    hideFundingStreamSelection={true}
                                    selectedFundingStreamId={fundingStream.id}
                                    selectedFundingPeriodId={selectedFundingPeriodId}
                                    fundingStreams={[fundingStream]}
                                    fundingPeriods={fundingPeriods}
                                    errors={errors}
                                    onFundingPeriodChange={handleFundingPeriodChange}
                                />}
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    <label className="govuk-label" htmlFor="description">
                                        Template description
                                </label>
                                    <textarea className="govuk-textarea" id="description" rows={8}
                                        aria-describedby="description-hint"
                                        maxLength={1000}
                                        onChange={handleDescriptionChange} />
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    {selectedFundingPeriodId &&
                                        <button className="govuk-button" data-testid='save'
                                            onClick={handleSaveClick}
                                            disabled={!enableSaveButton}>
                                            Clone Template
                                </button>}
                                    {saveMessage.length > 0 ? <span className="govuk-error-message">{saveMessage}</span> : null}
                                </div>
                            </div>

                            <BackLink to={`/Templates/${templateId}/Edit?version=${version}`} />
                        </form>
                    }
                </div>
            </div>
            <Footer />
        </div>
    );
};