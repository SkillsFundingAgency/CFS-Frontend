import {ErrorMessage} from "../../types/ErrorMessage";
import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {Header} from "../../components/Header";
import {Footer} from "../../components/Footer";
import {Section} from "../../types/Sections";
import {FundingPeriod, FundingStream} from "../../types/viewFundingTypes";
import {FundingStreamWithPeriodsResponse, TemplatePermissions} from "../../types/TemplateBuilderDefinitions";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {LoadingStatus} from "../../components/LoadingStatus";
import {createNewDraftTemplate, getAllFundingStreamsWithAvailablePeriods} from "../../services/templateBuilderDatasourceService";
import {useTemplatePermissions} from "../../hooks/TemplateBuilder/useTemplatePermissions";
import {useHistory} from "react-router";
import {FundingStreamAndPeriodSelection} from "../../components/TemplateBuilder/FundingStreamAndPeriodSelection";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";

export const CreateTemplate = () => {
    const [permittedFundingStreamsWithPeriods, setPermittedFundingStreamsWithPeriods] = useState<FundingStreamWithPeriodsResponse[]>([]);
    const [fundingStreams, setFundingStreams] = useState<FundingStream[]>([]);
    const [fundingPeriods, setFundingPeriods] = useState<FundingPeriod[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedFundingStreamId, setSelectedFundingStreamId] = useState<string>();
    const [selectedFundingPeriodId, setSelectedFundingPeriodId] = useState<string>();
    const [description, setDescription] = useState<string>("");
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
    const {canCreateTemplate, missingPermissions, fundingStreamPermissions} = useTemplatePermissions([TemplatePermissions.Create]);
    const history = useHistory();

    const fetchData = async () => {
        const result = await getAllFundingStreamsWithAvailablePeriods();
        return result.data;
    }

    useEffectOnce(() => {
        setIsLoading(true);
        try {
            const loadData = async () => {
                const fundingStreamWithPeriodsResponse = await fetchData();
                setIsLoading(false);
                const permitted = fundingStreamWithPeriodsResponse.filter(available =>
                    fundingStreamPermissions && 
                    fundingStreamPermissions.some(f => f.permission === TemplatePermissions.Create &&
                        f.fundingStreamId === available.fundingStream.id));
                setPermittedFundingStreamsWithPeriods(permitted);
                if (permitted.length > 0) {
                    const permittedFundingStreams = permitted.map(item => item.fundingStream);
                    setFundingStreams(permittedFundingStreams);
                    if (permittedFundingStreams && permittedFundingStreams.length > 0) {
                        setSelectedFundingStreamId(permittedFundingStreams[0].id);
                    }
                } else {
                    addErrorMessage("There are no funding streams to display", "fundingStreamId");
                }
            };
            loadData();
        } catch (err) {
            addErrorMessage(`Template options could not be loaded: ${err.message}.`);
            setIsLoading(false);
        }
    });

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

    useEffect(() => {
        clearErrorMessages();
        const streamWithPeriods = permittedFundingStreamsWithPeriods.find(item => item.fundingStream.id === selectedFundingStreamId);
        if (streamWithPeriods) {
            populateFundingPeriods(streamWithPeriods.fundingPeriods);
        }
    }, [selectedFundingStreamId]);

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const description = e.target.value;
        setDescription(description);
    }

    const handleFundingStreamChange = (fundingStreamId: string) => {
        clearErrorMessages();
        setSelectedFundingStreamId(fundingStreamId);
    }

    const handleFundingPeriodChange = (fundingPeriodId: string) => {
        clearErrorMessages();
        setSelectedFundingPeriodId(fundingPeriodId);
    }

    const handleSaveClick = async () => {
        if (!enableSaveButton) {
            return;
        }
        setEnableSaveButton(false);
        try {
            if (selectedFundingStreamId === undefined) {
                addErrorMessage("Funding stream is not defined", "fundingStreamId");
                return;
            }
            if (selectedFundingPeriodId === undefined) {
                addErrorMessage("Funding period is not defined", "fundingPeriodId");
                return;
            }

            setSaveMessage(`Saving template...`);

            const result = await createNewDraftTemplate(selectedFundingStreamId, selectedFundingPeriodId, description);
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
                    <Breadcrumb name={"Create a new template"} />
                </Breadcrumbs>
                <PermissionStatus requiredPermissions={missingPermissions} hidden={isLoading} />
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <MultipleErrorSummary errors={errors} />
                    </div>
                </div>
                <div className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">Create a new template</h1>
                    <h3 className="govuk-caption-xl govuk-!-padding-bottom-5">Build a new funding policy template</h3>
                </div>
                {canCreateTemplate &&
                    <form id="createTemplate">
                        <div className="govuk-grid-row" hidden={!isLoading}>
                            <LoadingStatus title={"Loading options..."} description={"Please wait whilst the options are loading"} />
                        </div>
                        {!isLoading &&
                        <>
                            <FundingStreamAndPeriodSelection
                                hideFundingStreamSelection={false}
                                fundingStreams={fundingStreams}
                                fundingPeriods={fundingPeriods}
                                errors={errors}
                                onFundingStreamChange={handleFundingStreamChange}
                                onFundingPeriodChange={handleFundingPeriodChange}
                            />
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full govuk-form-group">
                                    <label className="govuk-label" htmlFor="description">
                                        Description
                                </label>
                                    <textarea className="govuk-textarea" id="description" rows={8}
                                        aria-describedby="description-hint"
                                        maxLength={1000}
                                        onChange={handleDescriptionChange} />
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    {selectedFundingPeriodId && selectedFundingStreamId &&
                                        <button className="govuk-button" data-testid='save' onClick={handleSaveClick} disabled={!enableSaveButton}>Create
                                    Template</button>}
                                &nbsp;
                                <Link id="cancel-create-template" to="/Templates/List" className="govuk-button govuk-button--secondary"
                                        data-module="govuk-button">
                                        Back
                                </Link>
                                    {saveMessage.length > 0 ? <span className="govuk-error-message">{saveMessage}</span> : null}
                                </div>
                            </div>
                        </>}
                    </form>
                }
            </div>
            <Footer />
        </div>
    );
};
