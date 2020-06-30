import React, { useState, useRef, useEffect, RefObject } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from "react-sidebar";
import { useTemplatePermissions } from '../../hooks/useTemplatePermissions';
import { SidebarContent } from "../../components/SidebarContent";
import { Section } from '../../types/Sections';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import OrganisationChart from "../../components/OrganisationChart";
import TemplateBuilderNode from "../../components/TemplateBuilderNode";
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
    updateTemplateDescription
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
    TemplateResponse, TemplateContentUpdateCommand, CalculationDictionaryItem
} from '../../types/TemplateBuilderDefinitions';
import "../../styles/TemplateBuilder.scss";
import { useEffectOnce } from '../../hooks/useEffectOnce';
import { DateFormatter } from '../../components/DateFormatter';
import { Breadcrumbs, Breadcrumb } from '../../components/Breadcrumbs';
import { LoadingStatus } from '../../components/LoadingStatus';
import { EditDescriptionModal } from '../../components/EditDescriptionModal';
import deepClone from 'lodash/cloneDeep';
import { useTemplateUndo } from "../../hooks/useTemplateUndo";
import { useEventListener } from "../../hooks/useEventListener";
import { ErrorMessage } from '../../types/ErrorMessage';

enum Mode {
    View = 'view',
    Edit = 'edit'
}

export function TemplateBuilder() {
    const orgchart = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLSpanElement>(null);
    let { templateId } = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [ds, setDS] = useState<Array<FundingLineDictionaryEntry>>([]);
    const [nextId, setNextId] = useState(0);
    const [template, setTemplate] = useState<TemplateResponse>();
    const [mode, setMode] = useState<string>(Mode.Edit);
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Set<FundingLineOrCalculationSelectedItem>>(new Set());
    const [showModal, setShowModal] = useState<boolean>(false);
    const { canCreateTemplate, canEditTemplate, missingPermissions } = useTemplatePermissions(["edit"], template ? [template.fundingStreamId] : []);
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

    const keyPressHandler = (e: React.KeyboardEvent) => {
        if (e.keyCode === 90 && e.ctrlKey) {
            undo();
        }
        if (e.keyCode === 89 && e.ctrlKey) {
            redo();
        }
    }
    useEventListener('keydown', keyPressHandler);

    useEffectOnce(() => {
        clearErrorMessages();
        fetchData();
        clearPresentState();
        clearUndoState();
        clearRedoState();
    });

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
            const templateResult = await getTemplateById(templateId);
            const templateResponse = templateResult.data as TemplateResponse;
            setTemplate(templateResponse);
            if (templateResponse.templateJson) {
                const templateJson = JSON.parse(templateResponse.templateJson) as Template;
                if (templateJson && templateJson !== null) {
                    const fundingLines = templateFundingLinesToDatasource(templateJson.fundingTemplate.fundingLines)
                    initialiseState(fundingLines);
                    setNextId(getLastUsedId(templateJson.fundingTemplate.fundingLines) + 1);
                }
                else {
                    addErrorMessage("The template content could not be loaded.");
                }
            }
            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
            addErrorMessage(err.message);
        }
    };

    const update = (ds: FundingLineDictionaryEntry[]) => {
        updatePresentState(ds);
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
        setTimeout(function () { setSaveMessage(""); }, 5000);
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

            setSaveMessage("Saving template...");
            const fundingLines: TemplateFundingLine[] = datasourceToTemplateFundingLines(ds);
            if (!fundingLines || fundingLines.length === 0 || fundingLines === null) {
                showSaveMessageOnce("You can't save an empty template. Add one or more funding lines and try again.");
                return;
            }
            const templateContentUpdateCommand: TemplateContentUpdateCommand = {
                templateId: template.templateId,
                templateFundingLinesJson: JSON.stringify(fundingLines)
            }

            await saveTemplateContent(templateContentUpdateCommand);
            await fetchData();
            showSaveMessageOnce("Template saved successfully.");
        }
        catch (err) {
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
    };

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

    const toggleEditDescription = () => {
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
        }
        catch (err) {
            addErrorMessage(`Description changes could not be saved: ${err.message}.`, "description");
        }
    }

    const handleScroll = (fieldName: string | undefined) => {
        if (!fieldName) return;
        let ref: React.RefObject<HTMLElement> | null = null;

        switch (fieldName) {
            case "description":
                ref = descriptionRef;
            case "template":
                ref = orgchart;
            default:
                break;
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
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"Templates"} url={"/Templates/View"} />
                    <Breadcrumb name={template ? template.name : ""} />
                </Breadcrumbs>
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
                                                    {error.fieldName && <a href={"#" + error.fieldName} onClick={() => handleScroll(error.fieldName)}>{error.message}</a>}
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
                    <div className={`govuk-form-group ${errors.filter(error => error.fieldName === "description").length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <span className="govuk-caption-m" id="description" ref={descriptionRef}>Description</span>
                        {errors.map(error => error.fieldName === "description" &&
                            <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                <span className="govuk-visually-hidden">Error:</span> {error.message}
                            </span>
                        )}
                        <p className="govuk-body">{template && template.description} <button className="govuk-link" onClick={toggleEditDescription}>Edit</button></p>
                    </div>
                    <span className="govuk-caption-m">Major Version</span>
                    <p className="govuk-body">{template && template.majorVersion}</p>
                    <span className="govuk-caption-m">Minor Version</span>
                    <p className="govuk-body">{template && template.minorVersion}</p>
                    <span className="govuk-caption-m">Status</span>
                    <p className="govuk-body">{template && template.status}</p>
                    <span className="govuk-caption-m">Version</span>
                    <p className="govuk-body">Version {template && template.version}</p>
                    <span className="govuk-caption-m">Last Updated Date</span>
                    <p className="govuk-body"><DateFormatter date={template ? template.lastModificationDate : new Date()} utc={false} /></p>
                    <span className="govuk-caption-m">Last Updated Author</span>
                    <p className="govuk-body">{template && template.authorName}</p>
                    {canEditTemplate &&
                        <div className="govuk-form-group">
                            <div className="govuk-radios govuk-radios--inline">
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input" id="edit-mode" name="edit-mode" type="radio" value="edit"
                                        checked={mode === Mode.Edit} onChange={handleModeChange} data-testid='edit' />
                                    <label className="govuk-label govuk-radios__label" htmlFor="edit-mode">
                                        Edit
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input" id="edit-mode-2" name="edit-mode" type="radio" value="view"
                                        checked={mode === Mode.View} onChange={handleModeChange} data-testid='view' />
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
                    <div id="template" className={`govuk-form-group ${errors.filter(error => error.fieldName === "template").length > 0 ? 'govuk-form-group--error' : ''}`}>
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
                    {mode === Mode.Edit && (template == undefined && canCreateTemplate || template !== undefined && canEditTemplate) &&
                        <button className="govuk-button govuk-!-margin-right-1" data-testid='save'
                            onClick={handleSaveContentClick}>Save and continue
                                </button>}
                    <Link id="cancel-create-template" to="/Templates/View" className="govuk-button govuk-button--secondary"
                        data-module="govuk-button">
                        Back
                            </Link>
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
                    originalDescription={template ? template.description : ""}
                    showModal={showModal}
                    toggleModal={setShowModal}
                    saveDescription={saveDescription} />
            }
            <Footer />
        </div >
    )
}
