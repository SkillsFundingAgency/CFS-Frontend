import {ErrorMessage} from "../../types/ErrorMessage";

﻿import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {useHistory} from 'react-router-dom';
import {Header} from "../../components/Header";
import {Footer} from "../../components/Footer";
import {AppState} from "../../states/AppState";
import {Section} from "../../types/Sections";
import {FundingPeriod, FundingStream} from "../../types/viewFundingTypes";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {FundingStreamWithPeriodsResponse} from "../../types/TemplateBuilderDefinitions";
import {PermissionStatus} from "../../components/PermissionStatus";
import {useSelector} from "react-redux";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {LoadingStatus} from "../../components/LoadingStatus";
import {createNewDraftTemplate, getAllFundingStreamsWithAvailablePeriods} from "../../services/templateBuilderDatasourceService";

export const CreateTemplate = () => {
    const [canCreateTemplate, setCanCreateTemplate] = useState<boolean>(false);
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [availableFundingStreamsWithPeriods, setAvailableFundingStreamsWithPeriods] = useState<FundingStreamWithPeriodsResponse[]>([]);
    const [permittedFundingStreamsWithPeriods, setPermittedFundingStreamsWithPeriods] = useState<FundingStreamWithPeriodsResponse[]>([]);
    const [fundingStreams, setFundingStreams] = useState<FundingStream[]>([]);
    const [fundingPeriods, setFundingPeriods] = useState<FundingPeriod[]>([]);
    const [selectedFundingStreamId, setSelectedFundingStreamId] = useState<string>();
    const [selectedFundingPeriodId, setSelectedFundingPeriodId] = useState<string>();
    const [description, setDescription] = useState<string>("");
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
    let permissions: FundingStreamPermissions[] = useSelector((state: AppState) => state.userPermissions.fundingStreamPermissions);
    let errorCount = 0;
    const history = useHistory();

    useEffectOnce(() => {
        try {
            const loadData = async () => {
                const data = await fetchData();
                setAvailableFundingStreamsWithPeriods(data);
            };
            loadData();
        } catch (err) {
            addErrorMessage(`Template options could not be loaded: ${err.message}.`);
            setIsLoading(false);
        }
    });

    useEffect(() => {
        const permissionsToApply = permissions ? permissions : [];
        setCanCreateTemplate(permissionsToApply.some((permission: FundingStreamPermissions) => permission.canCreateTemplates));
        setMissingPermissions(canCreateTemplate ? [] : ["create"]);
    }, [canCreateTemplate, permissions]);

    useEffect(() => {
        // filter funding streams according to permissions
        const permitted = availableFundingStreamsWithPeriods.filter(available =>
            permissions.some(permission =>
                permission.fundingStreamId === available.fundingStream.id && permission.canCreateTemplates));
        setPermittedFundingStreamsWithPeriods(permitted);
    }, [availableFundingStreamsWithPeriods]);

    useEffect(() => {
        if (permittedFundingStreamsWithPeriods && permittedFundingStreamsWithPeriods.length > 0) {
            setFundingStreams(permittedFundingStreamsWithPeriods.map(item => item.fundingStream));
            setIsLoading(false);
        }
    }, [permittedFundingStreamsWithPeriods]);

    useEffect(() => {
        if (fundingStreams && fundingStreams.length > 0) {
            setSelectedFundingStreamId(fundingStreams[0].id);
        }
    }, [fundingStreams]);

    useEffect(() => {
        clearErrorMessages();
        const streamWithPeriods = permittedFundingStreamsWithPeriods.find(item => item.fundingStream.id === selectedFundingStreamId);
        if (streamWithPeriods != undefined) {
            populateFundingPeriods(streamWithPeriods.fundingPeriods);
        }
    }, [selectedFundingStreamId]);

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const error: ErrorMessage = {id: ++errorCount, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        errorCount = 0;
        setErrors([]);
    }

    function populateFundingPeriods(fundingPeriods: FundingPeriod[]) {
        setFundingPeriods([]);

        // get funding periods
        if (fundingPeriods == undefined || fundingPeriods.length === 0) {
            addErrorMessage("No funding periods available for this funding stream. You will not be able to select a funding period if a template for this funding stream and period already exists. Please select a different funding stream.",
                "fundingPeriodId");
            setEnableSaveButton(false);
            return;
        }
        // set funding periods
        setFundingPeriods(fundingPeriods);
        setSelectedFundingPeriodId(fundingPeriods[0].id);
        setEnableSaveButton(true);
    }

    const fetchData = async () => {
        const result = await getAllFundingStreamsWithAvailablePeriods();
        return result.data;
    }

    const handleFundingStreamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const fundingStreamId = e.target.value;
        setSelectedFundingStreamId(fundingStreamId);
    }

    const handleFundingPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        clearErrorMessages();
        const fundingPeriodId = e.target.value;
        setSelectedFundingPeriodId(fundingPeriodId);
        setEnableSaveButton(true);
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const description = e.target.value;
        setDescription(description);
    }

    const handleSaveClick = async () => {
        if (!enableSaveButton) {
            return;
        }
        setEnableSaveButton(false);
        try {
            if (selectedFundingStreamId == undefined) {
                addErrorMessage("Funding stream is not defined", "fundingStreamId");
                return;
            }
            if (selectedFundingPeriodId == undefined) {
                addErrorMessage("Funding period is not defined", "fundingPeriodId");
                return;
            }

            setSaveMessage(`Saving template...`);

            const result = await createNewDraftTemplate(selectedFundingStreamId, selectedFundingPeriodId, description);
            if (result.status === 201) {
                history.push("/Templates/Build/" + result.data);
            } else {
                addErrorMessage(`Template creation failed: ` + result.status + ` ` + result.statusText + ` ` + result.data);
            }
        } catch (err) {
            addErrorMessage(`Template could not be saved: ${err.message}.`);
            setSaveMessage(`Template could not be saved: ${err.message}.`);
            setEnableSaveButton(true);
        }
    }

    return (
        <div>
            <Header location={Section.Templates}/>
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate Funding"} url={"/"}/>
                    <Breadcrumb name={"Templates"} url={"/Templates/View"}/>
                    <Breadcrumb name={"Create a new template"}/>
                </Breadcrumbs>
                <PermissionStatus requiredPermissions={missingPermissions}/>

                {errors.length > 0 &&
                <div className="govuk-error-summary"
                     aria-labelledby="error-summary-title" role="alert" tabIndex="-1" data-module="govuk-error-summary">
                    <h2 className="govuk-error-summary__title" id="error-summary-title">
                        There is a problem
                    </h2>
                    <div className="govuk-error-summary__body">
                        <ul className="govuk-list govuk-error-summary__list">
                            {errors.map((error, index) =>
                                <li key={error.id}>
                                    {error.fieldName && <a href={"#" + error.fieldName}>{error.message}</a>}
                                    {!error.fieldName && <span className="govuk-error-message">{error.message}</span>}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>}

                <div className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">Create a new template</h1>
                    <h3 className="govuk-caption-xl govuk-!-padding-bottom-5">Build a new funding policy template</h3>
                </div>

                {canCreateTemplate && <div>
                    <div className="govuk-grid-row" hidden={!isLoading}>
                        <LoadingStatus title={"Loading options..."} description={"Please wait whilst the options are loading"}/>
                    </div>
                    <div className="govuk-grid-row" hidden={isLoading}>
                        <div className="govuk-grid-column-full">
                            <form id="createTemplate">
                                <div
                                    className={"govuk-form-group " + (errors.some(error => error.fieldName === "fundingStreamId") ? 'govuk-form-group--error' : '')}>
                                    <label className="govuk-label" htmlFor="fundingStreamId">
                                        Select a funding stream
                                    </label>
                                    {fundingStreams &&
                                    <select className="govuk-select" id="fundingStreamId" name="fundingStreamId"
                                            onChange={handleFundingStreamChange}>
                                        {fundingStreams.map(stream =>
                                            <option key={stream.id} value={stream.id}>{stream.name}</option>)
                                        }
                                    </select>}
                                    {errors.map(error => error.fieldName === "fundingStreamId" &&
                                        <span className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}</span>
                                    )}
                                </div>
                                {fundingStreams.length > 0 &&
                                <div
                                    className={"govuk-form-group " + (errors.some(error => error.fieldName === "fundingPeriodId") ? 'govuk-form-group--error' : '')}>
                                    <label className="govuk-label" htmlFor="fundingPeriodId">
                                        Select a funding period
                                    </label>
                                    {fundingPeriods.length > 0 &&
                                    <select className="govuk-select" id="fundingPeriodId" name="fundingPeriodId"
                                            onChange={handleFundingPeriodChange}>
                                        {fundingPeriods.map(period =>
                                            <option key={period.id} value={period.id}>{period.name}</option>)
                                        }
                                    </select>}
                                    {errors.map(error => error.fieldName === "fundingPeriodId" &&
                                        <span className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}</span>
                                    )}
                                </div>
                                }
                                <div className="govuk-form-group">
                                    <label className="govuk-label" htmlFor="description">
                                        Description
                                    </label>
                                    <textarea className="govuk-textarea" id="description" rows={8}
                                              aria-describedby="description-hint"
                                              maxLength={1000}
                                              onChange={handleDescriptionChange}/>
                                </div>
                            </form>
                            {selectedFundingPeriodId && selectedFundingStreamId &&
                            <button className="govuk-button" data-testid='save' onClick={handleSaveClick} disabled={!enableSaveButton}>Create
                                Template</button>}
                            &nbsp;
                            <Link id="cancel-create-template" to="/Templates/View" className="govuk-button govuk-button--secondary"
                                  data-module="govuk-button">
                                Back
                            </Link>
                            {saveMessage.length > 0 ? <span className="govuk-error-message">{saveMessage}</span> : null}
                        </div>
                    </div>
                </div>}
            </div>
            <Footer/>
        </div>
    );
};
