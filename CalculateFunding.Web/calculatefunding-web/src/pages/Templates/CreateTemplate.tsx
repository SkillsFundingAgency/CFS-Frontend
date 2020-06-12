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
    const [fundingStreamErrorMessages, setFundingStreamErrorMessages] = useState<string[]>([]);
    const [fundingPeriodErrorMessages, setFundingPeriodErrorMessages] = useState<string[]>([]);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
    let permissions: FundingStreamPermissions[] = useSelector((state: AppState) => state.userPermissions.fundingStreamPermissions);
    const history = useHistory();

    useEffectOnce(() => {
        try {
            const loadData = async () => {
                const data = await fetchData();
                setAvailableFundingStreamsWithPeriods(data);
            };
            loadData();
        } catch (err) {
            setErrorMessages(errors => [...errors, `Template options could not be loaded: ${err.message}.`]);
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
        setFundingPeriodErrorMessages([]);
        setFundingStreamErrorMessages([]);
        const streamWithPeriods = permittedFundingStreamsWithPeriods.find(item => item.fundingStream.id === selectedFundingStreamId);
        if (streamWithPeriods != undefined) {
            populateFundingPeriods(streamWithPeriods.fundingPeriods);
        }
    }, [selectedFundingStreamId]);

    function populateFundingPeriods(fundingPeriods: FundingPeriod[]) {
        setFundingPeriods([]);

        // get funding periods
        if (fundingPeriods == undefined || fundingPeriods.length === 0) {
            setFundingPeriodErrorMessages(errors => [...errors,
                "No funding periods available for this funding stream. You will not be able to select a funding period if a template for this funding stream and period already exists. Please select a different funding stream."]);
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

    function showSaveMessageOnce(message: string) {
        setSaveMessage(message);
        setTimeout(function () {
            setSaveMessage("");
        }, 5000);
    }

    const handleFundingStreamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const fundingStreamId = e.target.value;
        setSelectedFundingStreamId(fundingStreamId);
    }

    const handleFundingPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFundingPeriodErrorMessages([]);
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
                setFundingStreamErrorMessages(errors => [...errors, "Funding stream is not defined"]);
                return;
            }
            if (selectedFundingPeriodId == undefined) {
                setFundingPeriodErrorMessages(errors => [...errors, "Funding period is not defined"]);
                return;
            }

            setSaveMessage(`Saving template...`);

            const result = await createNewDraftTemplate(selectedFundingStreamId, selectedFundingPeriodId, description);
            if (result.status === 201) {
                showSaveMessageOnce(`Template created successfully`);

                history.push("/Templates/Build/" + result.data);
            } else {
                setErrorMessages(errors => [...errors, `Template creation failed: ` + result.status + ` ` + result.statusText + ` ` + result.data]);
            }
        } catch (err) {
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
                                <div className={"govuk-form-group " + (fundingStreamErrorMessages.length ? 'govuk-form-group--error' : '')}>
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
                                    {fundingStreamErrorMessages && <div className="govuk-error-summary__body">
                                        <ul className="govuk-list govuk-error-summary__list govuk-error-message">
                                            {fundingStreamErrorMessages.map((error, index) =>
                                                <li key={index}>
                                                    <p>{error}</p>
                                                </li>
                                            )}
                                        </ul>
                                    </div>}
                                </div>
                                {fundingStreams.length > 0 && 
                                    <div className={"govuk-form-group " + (fundingPeriodErrorMessages.length ? 'govuk-form-group--error' : '')}>
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
                                    {fundingPeriodErrorMessages.length > 0 &&
                                    <div className="govuk-error-govuk-error-message" role="alert">
                                        <span className="govuk-visually-hidden">Error:</span>
                                        <ul className="govuk-list govuk-error-summary__list govuk-error-message">
                                                {fundingPeriodErrorMessages.map((error, index) =>
                                                    <li key={index}>
                                                        <p>{error}</p>
                                                    </li>
                                                )}
                                            </ul>
                                    </div>}
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
                            {errorMessages && errorMessages.length > 0 &&
                            <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert">
                                <h2 className="govuk-error-summary__title" id="error-summary-title">
                                    There is a problem
                                </h2>
                                <div className="govuk-error-summary__body">
                                    <ul className="govuk-list govuk-error-summary__list">
                                        {errorMessages.map((error, index) =>
                                            <li key={index}>
                                                <p>{error}</p>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            }
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
