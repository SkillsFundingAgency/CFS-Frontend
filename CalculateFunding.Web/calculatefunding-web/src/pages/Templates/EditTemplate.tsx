import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from "react-sidebar";
import { useTemplatePermissions } from '../../hooks/useTemplatePermissions';
import { SidebarContent } from "../../components/SidebarContent";
import { Section } from '../../types/Sections';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import OrganisationChart from "../../components/OrganisationChart";
import TemplateBuilderNode from "../../components/TemplateBuilderNode";
import { TemplateButtons } from "../../components/TemplateButtons";
import {
    addNode,
    removeNode,
    cloneNode as cloneNodeDatasource,
    moveNode,
    updateNode as updateDatasource,
    datasourceToTemplateFundingLines,
    getTemplateById,
    templateFundingLinesToDatasource,
    saveTemplateContent,
    getLastUsedId,
    getAllCalculations,
    cloneCalculation,
    updateTemplateDescription,
    getTemplateVersion,
    restoreTemplateContent
} from "../../services/templateBuilderDatasourceService";
import { PermissionStatus } from "../../components/PermissionStatus";
import {
    NodeType,
    FundingLineType,
    FundingLineUpdateModel,
    CalculationUpdateModel,
    FundingLineDictionaryEntry,
    FundingLine,
    Calculation,
    FundingLineOrCalculationSelectedItem,
    FundingLineOrCalculation,
    TemplateFundingLine,
    Template,
    TemplateResponse, TemplateContentUpdateCommand, CalculationDictionaryItem, TemplateStatus
} from '../../types/TemplateBuilderDefinitions';
import "../../styles/EditTemplate.scss";
import { useEffectOnce } from '../../hooks/useEffectOnce';
import { DateFormatter } from '../../components/DateFormatter';
import { Breadcrumbs, Breadcrumb } from '../../components/Breadcrumbs';
import { LoadingStatus } from '../../components/LoadingStatus';
import { EditDescriptionModal } from '../../components/EditDescriptionModal';
import deepClone from 'lodash/cloneDeep';
import { useTemplateUndo } from "../../hooks/useTemplateUndo";
import { useEventListener } from "../../hooks/useEventListener";
import { ErrorMessage } from '../../types/ErrorMessage';
import { useHistory } from "react-router";

enum Mode {
    View = 'view',
    Edit = 'edit'
}

export function EditTemplate() {
    const orgchart = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLSpanElement>(null);
    let { templateId, version } = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [ds, setDS] = useState<Array<FundingLineDictionaryEntry>>([]);
    const [nextId, setNextId] = useState(0);
    const [template, setTemplate] = useState<TemplateResponse>();
    const [mode, setMode] = useState<string>(Mode.Edit);
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Set<FundingLineOrCalculationSelectedItem>>(new Set());
    const [showModal, setShowModal] = useState<boolean>(false);
    const { canEditTemplate, canApproveTemplate, missingPermissions } = useTemplatePermissions(["edit"], template ? [template.fundingStreamId] : []);
    const {
        initialiseState,
        updatePresentState,
        undo,
        redo,
        clearPresentState,
        clearRedoState,
        clearUndoState,
        canUndo,
        canRedo
    } = useTemplateUndo(setDS);
    const history = useHistory();

    const keyPressHandler = (e: React.KeyboardEvent) => {
        if (e.keyCode === 90 && e.ctrlKey) {
            undo();
        }
        if (e.keyCode === 89 && e.ctrlKey) {
            redo();
        }
    }
    useEventListener('keydown', keyPressHandler);

    useEffect(() => {
        const initialisePage = () => {
            window.scrollTo(0, 0);
            clearErrorMessages();
            fetchData();
            clearPresentState();
            clearUndoState();
            clearRedoState();
        }
        initialisePage();
    }, [templateId, version]);

    useEffect(() => {
        if (canEditTemplate) {
            setMode(Mode.Edit);
        } else {
            setMode(Mode.View);
        }
    }, [canEditTemplate]);

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = { id: errorCount + 1, fieldName: fieldName, message: errorMessage };
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    function getCalculations(): CalculationDictionaryItem[] {
        const fundingLines: FundingLine[] = ds.map(fl => fl.value);
        return getAllCalculations(fundingLines);
    }

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const templateResult = !version ? await getTemplateById(templateId) : await getTemplateVersion(templateId, version);
            const templateResponse = templateResult.data as TemplateResponse;
            setTemplate(templateResponse);
            if (templateResponse.templateJson) {
                const templateJson = JSON.parse(templateResponse.templateJson) as Template;
                if (templateJson) {
                    const fundingLines = templateFundingLinesToDatasource(templateJson.fundingTemplate.fundingLines)
                    initialiseState(fundingLines);
                    setNextId(getLastUsedId(templateJson.fundingTemplate.fundingLines) + 1);
                } else {
                    addErrorMessage("The template content could not be loaded.");
                }
            }
            if (!templateResponse.isCurrentVersion) {
                setMode(Mode.View);
            }
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            addErrorMessage(err.message);
        }
    };

    const update = (ds: FundingLineDictionaryEntry[]) => {
        updatePresentState(ds);
        setIsDirty(true);
    }

    const openSideBar = (open: boolean) => {
        setOpenSidebar(open);
        if (!open) {
            clearSelectedNode();
        }
    }

    const readSelectedNode = (node: FundingLineOrCalculationSelectedItem) => {
        setSelectedNodes(new Set([node]));
    };

    const clearSelectedNode = () => {
        setSelectedNodes(new Set());
    };

    const updateNode = async (node: FundingLineUpdateModel | CalculationUpdateModel) => {
        await updateDatasource(ds, node);
        update((deepClone(ds)));
    }

    const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMode(e.target.value);
        setOpenSidebar(false);
    }

    const incrementNextId = () => {
        setNextId(nextId + 1);
    }

    const onClickAdd = async (id: string, newChild: FundingLine | Calculation) => {
        await addNode(ds, id, newChild, incrementNextId);
        update((deepClone(ds)));
    }

    const onClickDelete = async (id: string) => {
        await removeNode(ds, id);
        update((deepClone(ds)));
    }

    const cloneNode = async (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => {
        await cloneNodeDatasource(ds, draggedItemData, draggedItemDsKey, dropTargetId, dropTargetDsKey);
        update((deepClone(ds)));
    };

    const changeHierarchy = async (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => {
        await moveNode(ds, draggedItemData, draggedItemDsKey, dropTargetId, dropTargetDsKey);
        update((deepClone(ds)));
    };

    const onCloneCalculation = async (targetCalculationId: string, sourceCalculationId: string) => {
        await cloneCalculation(ds, targetCalculationId, sourceCalculationId);
        update((deepClone(ds)));
    }

    function showSaveMessageOnce(message: string) {
        setSaveMessage(message);
        setTimeout(function () {
            setSaveMessage("");
        }, 5000);
    }

    const handleRestoreTemplateClick = async (templateVersion: number) => {
        try {
            if (template === undefined) {
                addErrorMessage("Can't find template data to update");
                return;
            }
            setIsSaving(true);
            setSaveMessage("Restoring template...");
            const fundingLines: TemplateFundingLine[] = datasourceToTemplateFundingLines(ds);

            const templateContentUpdateCommand: TemplateContentUpdateCommand = {
                templateId: template.templateId,
                templateFundingLinesJson: JSON.stringify(fundingLines)
            }

            const restoreResult = await restoreTemplateContent(templateContentUpdateCommand,
                template.templateId,
                templateVersion);

            if (restoreResult.status === 200) {
                history.push(`/Templates/${template.templateId}/Versions/${restoreResult.data}`);
            }
            else {
                addErrorMessage(`Template restore failed: ${restoreResult.status} ${restoreResult.statusText}`);
            }
        } catch (err) {
            const errStatus = err.response.status;
            if (errStatus === 400) {
                const errResponse = err.response.data;
                if (errResponse.hasOwnProperty("FundingLine")) {
                    errResponse["FundingLine"].forEach((error: string) => {
                        addErrorMessage(error, "template");
                    });
                }
                if (errResponse.hasOwnProperty("Calculation")) {
                    errResponse["Calculation"].forEach((error: string) => {
                        addErrorMessage(error, "template");
                    });
                }
            } else {
                addErrorMessage(`Template could not be restored: ${err.message}.`, "template");
            }
            setSaveMessage("Template failed to be restored due to errors.");
        }
        finally {
            setIsSaving(false);
        }
    }

    const handleSaveContentClick = async () => {
        clearUndoState();
        clearRedoState();
        clearErrorMessages();

        try {
            if (template === undefined) {
                addErrorMessage("Can't find template data to update");
                return;
            }
            setIsSaving(true);
            setSaveMessage("Saving template...");
            const fundingLines: TemplateFundingLine[] = datasourceToTemplateFundingLines(ds);
            if (!fundingLines || fundingLines.length === 0) {
                showSaveMessageOnce("You can't save an empty template. Add one or more funding lines and try again.");
                return;
            }
            const templateContentUpdateCommand: TemplateContentUpdateCommand = {
                templateId: template.templateId,
                templateFundingLinesJson: JSON.stringify(fundingLines)
            }

            await saveTemplateContent(templateContentUpdateCommand);
            await fetchData();
            setIsDirty(false);
            showSaveMessageOnce("Template saved successfully.");
        } catch (err) {
            const errStatus = err.response.status;
            if (errStatus === 400) {
                const errResponse = err.response.data;
                if (errResponse.hasOwnProperty("FundingLine")) {
                    errResponse["FundingLine"].forEach((error: string) => {
                        addErrorMessage(error, "template");
                    });
                }
                if (errResponse.hasOwnProperty("Calculation")) {
                    errResponse["Calculation"].forEach((error: string) => {
                        addErrorMessage(error, "template");
                    });
                }
            } else {
                addErrorMessage(`Template could not be saved: ${err.message}.`, "template");
            }
            setSaveMessage("Template failed to save due to errors.");
        }
        finally {
            setIsSaving(false);
        }
    };

    const handlePublishClick = () => {
        if (!template) return;
        history.push(`/Templates/Publish/${template.templateId}`);
    }

    const handleAddFundingLineClick = () => {
        const keyCount = ds.length > 0 ? ds.reduce((prev, current) => {
            return (prev.key > current.key ? prev : current)
        }).key : 0;
        const id = nextId;
        setNextId(nextId + 1);

        const fundingLine: FundingLine = {
            id: `n${id}`,
            templateLineId: id,
            kind: NodeType.FundingLine,
            type: FundingLineType.Information,
            name: `Funding Line ${id}`,
            fundingLineCode: undefined
        };

        const fundingLineEntry: FundingLineDictionaryEntry = {
            key: keyCount + 1,
            value: fundingLine
        };

        ds.push(fundingLineEntry);
        update((deepClone(ds)));
    }

    const handleUndo = () => {
        undo();
    }

    const handleRedo = () => {
        redo();
    }

    const toggleEditDescription = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        clearErrorMessages();
        setShowModal(!showModal);
    }

    const saveDescription = async (description: string) => {
        if (!template) return;
        try {
            const saveResponse = await updateTemplateDescription(template.templateId, description);
            if (saveResponse.status !== 200) {
                addErrorMessage("Description changes could not be saved", "description");
            } else {
                const updatedTemplate: TemplateResponse = Object.assign({}, template, { description: description });
                setTemplate(updatedTemplate);
            }
        } catch (err) {
            addErrorMessage(`Description changes could not be saved: ${err.message}.`, "description");
        }
    }

    const handleScroll = (fieldName: string | undefined) => {
        if (!fieldName) return;
        let ref: React.RefObject<HTMLElement> | null = null;

        if (fieldName === "description") {
            ref = descriptionRef;
        } else if (fieldName === "template") {
            ref = orgchart;
        }

        ref && ref.current && ref.current.scrollIntoView();
    }

    return (
        <div>
            <Header location={Section.Templates} />
            <div className="govuk-width-container">
                <PermissionStatus requiredPermissions={missingPermissions ? missingPermissions : []} />
                <LoadingStatus title={"Loading Template"} hidden={!isLoading} id={"template-builder-loader"}
                    subTitle={"Please wait while the template loads."} />
                {!version && <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"Templates"} url={"/Templates/List"} />
                    <Breadcrumb name={template ? template.name : ""} />
                </Breadcrumbs>}
                {version && <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"Templates"} url={"/Templates/List"} />
                    {template &&
                        <Breadcrumb name={template.name} url={`/Templates/${templateId}/Edit`} />
                    }
                    <Breadcrumb name={"Versions"} url={`/Templates/${templateId}/Versions`} />
                    {template &&
                        <Breadcrumb name={`${template.majorVersion}.${template.minorVersion}`} />
                    }
                </Breadcrumbs>}
                <div className="govuk-main-wrapper">
                    {errors.length > 0 &&
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                                    <h2 className="govuk-error-summary__title" id="error-summary-title">
                                        There is a problem
                                </h2>
                                    <div className="govuk-error-summary__body">
                                        <ul className="govuk-list govuk-error-summary__list">
                                            {errors.map(error =>
                                                <li key={error.id}>
                                                    {error.fieldName &&
                                                        <a href={"#" + error.fieldName} onClick={() => handleScroll(error.fieldName)}>{error.message}</a>}
                                                    {!error.fieldName && <span className="govuk-error-message">{error.message}</span>}
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    <h1 className="govuk-heading-l">{template && template.name}</h1>
                    <span className="govuk-caption-m">Funding stream</span>
                    <h3 className="govuk-heading-m">{template && template.fundingStreamId}</h3>
                    <span className="govuk-caption-m">Funding period</span>
                    <h3 className="govuk-heading-m">{template && template.fundingPeriodId}</h3>
                    <div
                        className={`govuk-form-group ${errors.filter(error => error.fieldName === "description").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <span className="govuk-caption-m" id="description" ref={descriptionRef}>Description</span>
                        {errors.map(error => error.fieldName === "description" &&
                            <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                <span className="govuk-visually-hidden">Error:</span> {error.message}
                            </span>
                        )}
                        <p className="govuk-body">
                            {`${(template && template.description && template.description.trim()) || ''} `}
                            {template && template.isCurrentVersion &&
                                <>
                                    {template.description && template.description.trim().length > 0 &&
                                        <button id="edit-description-link"
                                            onClick={toggleEditDescription}
                                            className="govuk-link govuk-link--no-visited-state">
                                            Edit
                                </button>}
                                    {(template.description === null || template.description.trim().length === 0) &&
                                        <button id="add-description-link"
                                            onClick={toggleEditDescription}
                                            className="govuk-link govuk-link--no-visited-state">
                                            Add
                                </button>}
                                </>
                            }
                        </p>
                    </div>
                    <span className="govuk-caption-m">Version</span>
                    <div className="govuk-body">
                        <span className="govuk-heading-m">{template && `${template.majorVersion}.${template.minorVersion}`} &nbsp;</span>
                        {template && template.status === TemplateStatus.Draft && template.isCurrentVersion &&
                            <span><strong className="govuk-tag govuk-tag--blue">In Progress</strong></span>}
                        {template && template.status === TemplateStatus.Draft && !template.isCurrentVersion &&
                            <span><strong className="govuk-tag govuk-tag--grey">Draft</strong></span>}
                        {template && template.status === TemplateStatus.Published &&
                            <span><strong className="govuk-tag govuk-tag--green">Published</strong><br />
                            </span>}
                        {template &&
                            <div>
                                <Link id="versions-link"
                                    to={`/Templates/${templateId}/Versions`}
                                    className="govuk-link--no-visited-state">
                                    View all versions
                                </Link>
                            </div>}
                    </div>
                    {template && template.status === TemplateStatus.Published &&
                        <>
                            <span className="govuk-caption-m">Publish Notes</span>
                            <p className="govuk-body">
                                {template && template.comments}
                            </p>
                        </>}
                    <span className="govuk-caption-m">Last Update</span>
                    <p className="govuk-body">
                        <DateFormatter date={template ? template.lastModificationDate : new Date()} utc={false} />
                        {` by ${template && template.authorName}`}
                    </p>
                    {canEditTemplate && (!version || (template && template.isCurrentVersion)) &&
                        <div className="govuk-form-group">
                            <div className="govuk-radios govuk-radios--inline">
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input" id="edit-mode" name="edit-mode" type="radio" value="edit"
                                        checked={mode === Mode.Edit} onChange={handleModeChange} data-testid='edit-option' />
                                    <label className="govuk-label govuk-radios__label" htmlFor="edit-mode">
                                        Edit
                                </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input" id="edit-mode-2" name="edit-mode" type="radio" value="view"
                                        checked={mode === Mode.View} onChange={handleModeChange} data-testid='view-option' />
                                    <label className="govuk-label govuk-radios__label" htmlFor="edit-mode-2">
                                        View
                                </label>
                                </div>
                            </div>
                        </div>}
                    {mode === Mode.Edit && canEditTemplate &&
                        <>
                            <button className="govuk-button govuk-!-margin-right-1" data-testid='add'
                                onClick={handleAddFundingLineClick}>
                                Add new funding line
                        </button>
                            <button className="govuk-button govuk-button--secondary govuk-!-margin-right-1 " data-testid='undo'
                                onClick={handleUndo} disabled={!canUndo}>
                                Undo
                        </button>
                            <button className="govuk-button govuk-button--secondary" data-testid='redo'
                                onClick={handleRedo} disabled={!canRedo}>
                                Redo
                        </button>
                        </>}
                </div>
                <div className="gov-org-chart-container">
                    <div id="template"
                        className={`govuk-form-group ${errors.filter(error => error.fieldName === "template").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        {errors.map(error => error.fieldName === "template" &&
                            <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                <span className="govuk-visually-hidden">Error:</span> {error.message}
                            </span>
                        )}
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
                            onClickNode={readSelectedNode}
                            onClickChart={clearSelectedNode}
                            openSideBar={openSideBar}
                            editMode={mode === Mode.Edit}
                            onClickAdd={onClickAdd}
                            changeHierarchy={changeHierarchy}
                            cloneNode={cloneNode}
                            nextId={nextId}
                        />
                    </div>
                    {template && <TemplateButtons
                        isEditMode={mode === Mode.Edit}
                        canEditTemplate={canEditTemplate}
                        canApproveTemplate={canApproveTemplate}
                        templateId={template.templateId}
                        templateStatus={template.status}
                        hasTemplateContent={template.templateJson !== null && template.templateJson.trim().length > 0}
                        templateVersion={template.version}
                        cameFromVersionList={version !== undefined}
                        unsavedChanges={isDirty}
                        isSaving={isSaving}
                        isCurrentVersion={template.isCurrentVersion}
                        handleSave={handleSaveContentClick}
                        handleRestore={handleRestoreTemplateClick}
                        handlePublish={handlePublishClick}
                    />}
                    {saveMessage.length > 0 ? <span className="govuk-error-message">{saveMessage}</span> : null}
                    {mode === Mode.Edit &&
                        <Sidebar
                            sidebar={<SidebarContent
                                data={selectedNodes}
                                calcs={getCalculations()}
                                updateNode={updateNode}
                                openSideBar={openSideBar}
                                deleteNode={onClickDelete}
                                cloneCalculation={onCloneCalculation}
                            />}
                            open={openSidebar}
                            onSetOpen={openSideBar}
                            pullRight={true}
                            styles={{
                                sidebar: {
                                    background: "white",
                                    position: "fixed",
                                    padding: "20px 20px",
                                    width: "500px"
                                }, root: { position: "undefined" }, content: {
                                    position: "undefined",
                                    top: "undefined",
                                    left: "undefined",
                                    right: "undefined",
                                    bottom: "undefined"
                                }
                            }}
                        ><span></span></Sidebar>}
                </div>
            </div>
            {
                mode === Mode.Edit && canEditTemplate && !isLoading &&
                <EditDescriptionModal
                    originalDescription={template && template.description ? template.description : ""}
                    showModal={showModal}
                    toggleModal={setShowModal}
                    saveDescription={saveDescription} />
            }
            <Footer />
        </div>
    )
}