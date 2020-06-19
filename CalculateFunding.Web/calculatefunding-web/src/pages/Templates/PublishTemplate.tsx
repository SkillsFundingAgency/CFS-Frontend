﻿﻿import React, {useEffect, useRef, useState} from 'react';
import {Link, useParams} from "react-router-dom";
import {Header} from "../../components/Header";
import {Footer} from "../../components/Footer";
import {Section} from "../../types/Sections";
import {ErrorMessage} from "../../types/ErrorMessage";
import {useTemplatePermissions} from "../../hooks/useTemplatePermissions";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import OrganisationChart from "../../components/OrganisationChart";
import TemplateBuilderNode from "../../components/TemplateBuilderNode";
import {
    FundingLineDictionaryEntry,
    Template,
    TemplateFundingLine,
    TemplateResponse
} from "../../types/TemplateBuilderDefinitions";
import {
    datasourceToTemplateFundingLines,
    getTemplateById,
    publishTemplate,
    templateFundingLinesToDatasource
} from "../../services/templateBuilderDatasourceService";

export const PublishTemplate = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isPublishing, setIsPublishing] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [publishMessage, setPublishMessage] = useState<string>('');
    const [publishErrorMessage, setPublishErrorMessage] = useState<string>('');
    const [publishNote, setPublishNote] = useState<string>('');
    const orgchart = useRef();
    const [ds, setDS] = useState<Array<FundingLineDictionaryEntry>>([]);
    const [template, setTemplate] = useState<TemplateResponse>();
    const {canApproveTemplate, missingPermissions} = useTemplatePermissions(["approve"], template ? [template.fundingStreamId] : []);
    let errorCount = 0;
    let {templateId} = useParams();

    useEffectOnce(() => {
        fetchData();
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const templateResult = await getTemplateById(templateId);
            const templateResponse = templateResult.data as TemplateResponse;
            setTemplate(templateResponse);
            if (templateResponse) {
                if (templateResponse.templateJson) {
                    const template = JSON.parse(templateResponse.templateJson) as Template;
                    if (template) {
                        const fundingLines = templateFundingLinesToDatasource(template.fundingTemplate.fundingLines)
                        setDS(fundingLines);
                    } else {
                        addErrorMessage("The template content could not be loaded.", "content");
                    }
                }
            }
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            addErrorMessage(err.message);
        }
    };

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const error: ErrorMessage = {id: ++errorCount, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        errorCount = 0;
        setErrors([]);
    }

    function validateForm() {
        clearErrorMessages();
        let isValid = true;
        if (!template) {
            isValid = false;
            addErrorMessage("Can't find template data.", "content");
        } else {
            const fundingLines: TemplateFundingLine[] = datasourceToTemplateFundingLines(ds);
            if (!fundingLines || fundingLines.length === 0) {
                isValid = false;
                addErrorMessage("You can't publish an empty template. Go back to edit the contents.", "content");
            }
            if (template.status != 'Draft') {
                isValid = false;
                addErrorMessage("This template version has already been published.", "status");
            }
        }
        if (isValid && !publishNote && publishNote.length === 0) {
            isValid = false;
            addErrorMessage("You must enter a publish note.", "publishNote");
        }

        return isValid;
    }

    const handlePublishNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const note = e.target.value;
        setPublishNote(note);
        validateForm();
    }

    const handlePublishClick = async () => {
        try {
            if (validateForm()) {
                setPublishMessage("Publishing template...");
                setIsPublishing(true);

                await publishTemplate(templateId, publishNote);

                await fetchData();
                setIsPublishing(false);

                setPublishMessage("Published successfully");
            }
        } catch (err) {
            setIsPublishing(false);
            const errorMessage = `Template could not be published: ${err.message}.`;
            addErrorMessage(errorMessage);
            setPublishErrorMessage(errorMessage);
            setTimeout(function () {setPublishErrorMessage("");}, 5000);
        }
    };


    return (
        <div>
            <Header location={Section.Templates}/>
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate Funding"} url={"/"}/>
                    <Breadcrumb name={"Templates"} url={"/Templates/View"}/>
                    <Breadcrumb name={"Publish a template"}/>
                </Breadcrumbs>

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
                    <h1 className="govuk-heading-xl">Publish Template</h1>
                    {canApproveTemplate &&
                    <h3 className="govuk-caption-xl govuk-!-padding-bottom-5">Check the information below before publishing</h3>}
                    <PermissionStatus requiredPermissions={missingPermissions ? missingPermissions : []} />
                </div>

                {canApproveTemplate && <div>
                    <div className="govuk-grid-row" hidden={!isLoading}>
                        <LoadingStatus title={"Loading..."} description={"Please wait whilst the template is loading"}/>
                    </div>
                    <div className="govuk-grid-row" hidden={isLoading}>
                        <div className="govuk-grid-column-full">
                            <form id="publishTemplate">
                                <span className="govuk-caption-m">Template Name</span>
                                <h3 className="govuk-heading-m" data-testid="template-name">{template && template.name}</h3>
                                <span className="govuk-caption-m">Funding stream</span>
                                <h3 className="govuk-heading-m">{template && template.fundingStreamId}</h3>
                                <span className="govuk-caption-m">Funding period</span>
                                <h3 className="govuk-heading-m">{template && template.fundingPeriodId}</h3>
                                <span className="govuk-caption-m">Description</span>
                                <h3 className="govuk-heading-m">{template && template.description}</h3>
                                <span className="govuk-caption-m">Version</span>
                                <h3 className="govuk-heading-m">{template && template.majorVersion + "." + template.minorVersion}</h3>
                                <div
                                    className={"govuk-form-group " + (errors.some(error => error.fieldName === "status") ? 'govuk-form-group--error' : '')}>
                                    <span className="govuk-caption-m">Status</span>
                                    <h3 className="govuk-heading-m" id="status">{template && template.status}</h3>
                                    {errors.map(error => error.fieldName === "status" &&
                                        <span id={"status-error-" + error.id} className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}</span>
                                    )}
                                </div>
                                <div
                                    className={"govuk-form-group " + (errors.some(error => error.fieldName === "publishNote") ? 'govuk-form-group--error' : '')}>
                                    <label className="govuk-label" htmlFor="description">
                                        Add publish note
                                    </label>
                                    <textarea className="govuk-textarea" id="publishNote" rows={4}
                                              maxLength={1000}
                                              onClick={clearErrorMessages}
                                              onChange={handlePublishNoteChange}/>
                                    {errors.map(error => error.fieldName === "publishNote" &&
                                        <span id={"publishNote-error-" + error.id} className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}</span>
                                    )}
                                </div>
                                <div id="content"
                                     className={"gov-org-chart-container " + (errors.some(error => error.fieldName === "content") ? 'govuk-form-group--error' : '')}>
                                    <OrganisationChart
                                        ref={orgchart}
                                        NodeTemplate={TemplateBuilderNode}
                                        datasource={ds}
                                        chartClass="myChart"
                                        collapsible={true}
                                        draggable={true}
                                        pan={true}
                                        zoom={true}
                                        multipleSelect={false}
                                        editMode={false}
                                    />
                                    {errors.map(error => error.fieldName === "content" &&
                                        <span id={"status-error-" + error.id} className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}</span>
                                    )}
                                </div>
                                {publishMessage.length > 0 ?
                                    <div className="govuk-form-group"><strong className="govuk-tag govuk-tag--green">{publishMessage}</strong></div>
                                    : null}
                                {publishErrorMessage.length > 0 ?
                                    <div className="govuk-form-group"><strong className="govuk-tag govuk-tag--red">{publishErrorMessage}</strong></div>
                                    : null}

                                {template && template.status !== "Published" &&
                                <button className="govuk-button" data-testid="publish"
                                        disabled={isPublishing || isLoading || !canApproveTemplate || !template || errors.length > 0}
                                        onClick={handlePublishClick}>Publish
                                </button>}
                                &nbsp;
                                {template && template.status !== "Published" && 
                                <Link id="cancel" to="/Templates/View" className="govuk-button govuk-button--secondary" data-module="govuk-button">
                                    Back
                                </Link>}
                                {template && template.status === "Published" &&
                                <Link id="continue" to="/Templates/View" className="govuk-button govuk-button--primary" data-module="govuk-button">
                                    Continue
                                </Link>}
                            </form>
                        </div>
                    </div>
                </div>}
            </div>
            <Footer/>
        </div>
    );
};
