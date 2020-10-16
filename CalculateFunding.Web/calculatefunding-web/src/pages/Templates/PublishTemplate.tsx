import React, {useRef, useState} from 'react';
import {Link, useParams} from "react-router-dom";
import {Header} from "../../components/Header";
import {Footer} from "../../components/Footer";
import {Section} from "../../types/Sections";
import {ErrorMessage} from "../../types/ErrorMessage";
import {useTemplatePermissions} from "../../hooks/TemplateBuilder/useTemplatePermissions";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import OrganisationChart from "../../components/TemplateBuilder/OrganisationChart";
import TemplateBuilderNode from "../../components/TemplateBuilder/TemplateBuilderNode";
import {
    CalculationDictionaryItem, FundingLine,
    FundingLineDictionaryEntry, FundingLineOrCalculationSelectedItem,
    Template,
    TemplateFundingLine,
    TemplateResponse
} from "../../types/TemplateBuilderDefinitions";
import {
    datasourceToTemplateFundingLines, getAllCalculations,
    getTemplateById,
    publishTemplate,
    templateFundingLinesToDatasource
} from "../../services/templateBuilderDatasourceService";
import {SidebarContent} from "../../components/TemplateBuilder/SidebarContent";
import Sidebar from "react-sidebar";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";

export const PublishTemplate = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isPublishing, setIsPublishing] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [publishMessage, setPublishMessage] = useState<string>('');
    const [publishErrorMessage, setPublishErrorMessage] = useState<string>('');
    const [publishNote, setPublishNote] = useState<string>('');
    const [selectedNodes, setSelectedNodes] = useState<Set<FundingLineOrCalculationSelectedItem>>(new Set());
    const orgchart = useRef<HTMLDivElement>(null);
    const [ds, setDS] = useState<Array<FundingLineDictionaryEntry>>([]);
    const [template, setTemplate] = useState<TemplateResponse>();
    const {canApproveTemplate, missingPermissions} = useTemplatePermissions(["approve"], template ? [template.fundingStreamId] : []);
    let errorCount = 0;
    let {templateId} = useParams();

    useEffectOnce(() => {
        window.scrollTo(0, 0);
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
                        const fundingLines = templateFundingLinesToDatasource(template.fundingTemplate.fundingLines);
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

    function clearErrorMessages(fieldName?: string) {
        if (errors.length > 0) {
            if (fieldName === undefined) {
                setErrors([]);
            } else if (errors.some(e => e.fieldName === fieldName)) {
                setErrors(errors.filter(e => e.fieldName !== fieldName))
            }
        }
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
            if (template.status !== 'Draft') {
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
        clearErrorMessages("publishNote");
        const note = e.target.value;
        setPublishNote(note);
        if (!note && note.length === 0) {
            addErrorMessage("You must enter a publish note.", "publishNote");
        }
    };

    const handlePublishClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
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
            setPublishMessage("");
            setPublishErrorMessage(errorMessage);
            setTimeout(function () {setPublishErrorMessage("");}, 5000);
        }
    };

    function getCalculations(): CalculationDictionaryItem[] {
        const fundingLines: FundingLine[] = ds.map(fl => fl.value);
        return getAllCalculations(fundingLines);
    }

    const openSideBar = (open: boolean) => {
        setIsSidebarOpen(open);
        if (!open) {
            clearSelectedNode();
        }
    };

    const readSelectedNode = (node: FundingLineOrCalculationSelectedItem) => {
        setSelectedNodes(new Set([node]));
    };

    const clearSelectedNode = () => {
        setSelectedNodes(new Set());
    };

    return (
        <div>
            <Header location={Section.Templates} />
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate Funding"} url={"/"} />
                    <Breadcrumb name={"Templates"} url={"/Templates/List"} />
                    <Breadcrumb name={"Publish a template"} />
                </Breadcrumbs>

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <MultipleErrorSummary errors={errors} />
                    </div>
                </div>

                <div className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">Publish Template</h1>
                    {canApproveTemplate &&
                        <h3 className="govuk-caption-xl govuk-!-padding-bottom-5">Check the information below before publishing</h3>}
                    <PermissionStatus requiredPermissions={missingPermissions ? missingPermissions : []} hidden={isLoading} />
                </div>

                {canApproveTemplate && <div>
                    <div className="govuk-grid-row" hidden={!isLoading}>
                        <LoadingStatus title={"Loading..."} description={"Please wait whilst the template is loading"} />
                    </div>
                    <div className="govuk-grid-row" hidden={isLoading}>
                        <div className="govuk-grid-column-full">
                            <form id="publishTemplate">
                                <span className="govuk-caption-m">Template Name</span>
                                <h3 className="govuk-heading-m" data-testid="template-name">{template && template.name}</h3>
                                <span className="govuk-caption-m">Funding stream</span>
                                <h3 className="govuk-heading-m">{template && template.fundingStreamName}</h3>
                                <span className="govuk-caption-m">Funding period</span>
                                <h3 className="govuk-heading-m">{template && template.fundingPeriodName}</h3>
                                <span className="govuk-caption-m">Description</span>
                                <h3 className="govuk-heading-m">{template && template.description}</h3>
                                <span className="govuk-caption-m">Version</span>
                                <h3 className="govuk-heading-m">{template && template.majorVersion + "." + template.minorVersion}</h3>
                                <div
                                    className={"govuk-form-group " + (errors.some(error => error.fieldName === "status") ? 'govuk-form-group--error' : '')}>
                                    <span className="govuk-caption-m">Status</span>
                                    <h3 className="govuk-heading-m" id="status">{template && template.status}</h3>
                                    {errors.map(error => error.fieldName === "status" &&
                                        <span key={error.id} id={"status-error-" + error.id} className="govuk-error-message">
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
                                        onChange={handlePublishNoteChange} />
                                    {errors.map(error => error.fieldName === "publishNote" &&
                                        <span key={error.id} id={"publishNote-error-" + error.id} className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}</span>
                                    )}
                                </div>
                                <div id="content"
                                    className={"gov-org-chart-container " + (errors.some(error => error.fieldName === "content") ? 'govuk-form-group--error' : '')}>
                                    <OrganisationChart
                                        ref={orgchart}
                                        NodeTemplate={TemplateBuilderNode}
                                        onClickNode={readSelectedNode}
                                        onClickChart={clearSelectedNode}
                                        openSideBar={openSideBar}
                                        isEditMode={false}
                                        datasource={ds}
                                        chartClass="myChart"
                                        collapsible={true}
                                        draggable={true}
                                        pan={true}
                                        zoom={true}
                                        multipleSelect={false}
                                    />
                                    {errors.map(error => error.fieldName === "content" &&
                                        <span id={"status-error-" + error.id} className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}</span>
                                    )}
                                </div>
                                {publishMessage.length > 0 && errors.length === 0 ?
                                    <div className="govuk-form-group"><strong className="govuk-tag govuk-tag--green">{publishMessage}</strong></div>
                                    : null}
                                {publishErrorMessage.length > 0 ?
                                    <div className="govuk-form-group"><strong className="govuk-tag govuk-tag--red">{publishErrorMessage}</strong></div>
                                    : null}

                                {template && template.status !== "Published" &&
                                    <button className="govuk-button" data-testid="publish"
                                        disabled={isPublishing || isLoading || !canApproveTemplate || !template}
                                        onClick={handlePublishClick}>Publish
                                </button>}
                                &nbsp;
                                {template && template.status !== "Published" &&
                                    <Link id="cancel" to="/Templates/List" className="govuk-button govuk-button--secondary" data-module="govuk-button">
                                        Back
                                </Link>}
                                {template && template.status === "Published" &&
                                    <Link id="continue" to="/Templates/List" className="govuk-button govuk-button--primary" data-module="govuk-button">
                                        Continue
                                </Link>}
                                <Sidebar sidebar={
                                    <SidebarContent
                                        data={selectedNodes}
                                        calcs={getCalculations()}
                                        isEditMode={false}
                                        openSideBar={openSideBar}
                                    />}
                                    open={isSidebarOpen}
                                    onSetOpen={openSideBar}
                                    pullRight={true}
                                    styles={{
                                        sidebar: {
                                            background: "white",
                                            position: "fixed",
                                            padding: "20px 20px",
                                            width: "500px"
                                        }, root: {position: "undefined"}, content: {
                                            position: "undefined",
                                            top: "undefined",
                                            left: "undefined",
                                            right: "undefined",
                                            bottom: "undefined"
                                        }
                                    }}
                                ><span></span></Sidebar>
                            </form>
                        </div>
                    </div>
                </div>}
            </div>
            <Footer />
        </div>
    );
};
