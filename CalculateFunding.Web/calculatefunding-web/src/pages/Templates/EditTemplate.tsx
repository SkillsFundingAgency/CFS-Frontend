import React, {useState, useRef, useEffect} from 'react';
// @ts-ignore
import {Link, useParams} from 'react-router-dom';
import Sidebar from "react-sidebar";
import {useTemplatePermissions} from '../../hooks/TemplateBuilder/useTemplatePermissions';
import {SidebarContent} from "../../components/TemplateBuilder/SidebarContent";
import {Section} from '../../types/Sections';
import {Header} from '../../components/Header';
import {Footer} from '../../components/Footer';
import OrganisationChart from "../../components/TemplateBuilder/OrganisationChart";
import TemplateBuilderNode from "../../components/TemplateBuilder/TemplateBuilderNode";
import {TemplateButtons} from "../../components/TemplateBuilder/TemplateButtons";
import {TemplateBuilderToolBar} from "../../components/TemplateBuilder/TemplateBuilderToolBar";
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
    getAllFundingLines,
    cloneCalculation,
    updateTemplateDescription,
    getTemplateVersion,
    restoreTemplateContent,
    findNodeById,
    getAllTemplateLineIds,
    isCloneRoot,
    isClonedNode
} from "../../services/templateBuilderDatasourceService";
import {PermissionStatus} from "../../components/PermissionStatus";
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
    TemplateResponse,
    TemplateContentUpdateCommand,
    CalculationDictionaryItem,
    TemplateStatus,
    FundingLineDictionaryItem
} from '../../types/TemplateBuilderDefinitions';
import "../../styles/EditTemplate.scss";
import {DateFormatter} from '../../components/DateFormatter';
import {Breadcrumbs, Breadcrumb} from '../../components/Breadcrumbs';
import {LoadingStatus} from '../../components/LoadingStatus';
import {EditDescriptionModal} from '../../components/TemplateBuilder/EditDescriptionModal';
import deepClone from 'lodash/cloneDeep';
import {useTemplateUndo} from "../../hooks/TemplateBuilder/useTemplateUndo";
import {useEventListener} from "../../hooks/useEventListener";
import {useConfirmLeavePage} from "../../hooks/useConfirmLeavePage";
import {ErrorMessage} from '../../types/ErrorMessage';
import {useHistory, useLocation} from "react-router";
import {AutoComplete, AutoCompleteMode} from '../../components/AutoComplete';
import * as QueryString from "query-string";

enum Mode {
    View = 'view',
    Edit = 'edit'
}

export function EditTemplate() {
    const orgchart = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLSpanElement>(null);
    const itemRefs = useRef({});
    const {templateId, version} = useParams();
    const [enableUndo, setEnableUndo] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [ds, setDS] = useState<Array<FundingLineDictionaryEntry>>([]);
    const [nextId, setNextId] = useState(0);
    const [template, setTemplate] = useState<TemplateResponse>();
    const [mode, setMode] = useState<string>(Mode.View);
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Set<FundingLineOrCalculationSelectedItem>>(new Set());
    const [showModal, setShowModal] = useState<boolean>(false);
    const [allFundingLinesAndCalculations, setAllFundingLinesAndCalculations] = useState<string[]>([]);
    const [focusNodeId, setFocusNodeId] = useState<string>('');
    const [chartScale, setChartScale] = useState<number>(1);
    const [targetScale, setTargetScale] = useState<number>(1);
    const [undos, setUndos] = useState<number>(0);
    const [redos, setRedos] = useState<number>(0);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const {canEditTemplate, canApproveTemplate, canCreateTemplate, missingPermissions} =
        useTemplatePermissions(["edit"], template ? [template.fundingStreamId] : []);
    const {
        initialiseState,
        updatePresentState,
        undo,
        redo,
        clearPresentState,
        clearRedoState,
        clearUndoState,
        undoCount,
        redoCount
    } = useTemplateUndo(setDS, enableUndo);
    const history = useHistory();

    const keyPressHandler = (e: React.KeyboardEvent) => {
        if (e.keyCode === 90 && e.ctrlKey) {
            undo();
        }
        if (e.keyCode === 89 && e.ctrlKey) {
            redo();
        }
        if (e.keyCode === 27) {
            setIsFullScreen(false);
        }
    };

    useEventListener('keydown', keyPressHandler);

    useConfirmLeavePage(isDirty && !isSaving);

    const location = useLocation();

    useEffect(() => {
        const params = QueryString.parse(location.search);
        if (params.disableUndo) {
            setEnableUndo(false);
        }
    }, [location]);

    useEffect(() => {
        const initialisePage = () => {
            window.scrollTo(0, 0);
            clearErrorMessages();
            setSaveMessage("");
            setIsSaving(false);
            setIsDirty(false);
            fetchData();
            clearPresentState();
            clearUndoState();
            clearRedoState();
        };
        initialisePage();
    }, [templateId, version]);

    useEffect(() => {
        if (template && template.isCurrentVersion && canEditTemplate) {
            setMode(Mode.Edit);
        } else {
            setMode(Mode.View);
        }
    }, [template, canEditTemplate]);

    useEffect(() => {
        const calculateUndoCounts = async () => {
            const undos = await undoCount();
            const redos = await redoCount();
            setUndos(undos);
            setRedos(redos);
        }
        const allCalcs = getCalculations(true).map(c => `__C${c.id}__CAL: ${c.name} (${c.templateCalculationId})${c.id.includes(":") ? "*" : ""}`);
        const allFundingLines = getFundingLines(true).map(fl => `__F${fl.id}__FUN: ${fl.name} (${fl.templateLineId})${fl.id.includes(":") ? "*" : ""}`);
        setAllFundingLinesAndCalculations(allCalcs.concat(allFundingLines));
        calculateUndoCounts();
    }, [ds]);

    const addNodeToRefs = (id: string, ref: React.MutableRefObject<any>) => {
        (itemRefs.current as any)[id] = ref;
    };

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    function getCalculations(includeClones = false): CalculationDictionaryItem[] {
        const fundingLines: FundingLine[] = ds.map(fl => fl.value);
        return getAllCalculations(fundingLines, includeClones);
    }

    function getFundingLines(includeClones = false): FundingLineDictionaryItem[] {
        const fundingLines: FundingLine[] = ds.map(fl => fl.value);
        return getAllFundingLines(fundingLines, includeClones);
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
                    const fundingLines = templateFundingLinesToDatasource(templateJson.fundingTemplate.fundingLines);
                    initialiseState(fundingLines);
                    setNextId(getLastUsedId(templateJson.fundingTemplate.fundingLines) + 1);
                } else {
                    addErrorMessage("The template content could not be loaded.");
                }
            }
        } catch (err) {
            addErrorMessage(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const update = (ds: FundingLineDictionaryEntry[]) => {
        updatePresentState(ds);
        setIsDirty(true);
        showSaveMessage("");
    };

    const openSideBar = (open: boolean) => {
        setOpenSidebar(open);
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

    const updateNode = async (node: FundingLineUpdateModel | CalculationUpdateModel) => {
        await updateDatasource(ds, node);
        update((deepClone(ds)));
    };

    const incrementNextId = () => {
        setNextId(nextId + 1);
    };

    const refreshNextId = () => {
        setNextId(getLastUsedId(ds) + 1);
    };

    const onClickAdd = async (id: string, newChild: FundingLine | Calculation) => {
        await addNode(ds, id, newChild, incrementNextId);
        update((deepClone(ds)));
    };

    const onClickDelete = async (id: string) => {
        try {
            await removeNode(ds, id);
            update((deepClone(ds)));
        } catch (err) {
            addErrorMessage(err.message);
        }
    };

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
    };

    function showSaveMessage(message: string) {
        setSaveMessage(message);
    }

    const handleRestoreTemplateClick = async (templateVersion: number) => {
        try {
            clearErrorMessages();

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
            };

            const restoreResult = await restoreTemplateContent(templateContentUpdateCommand,
                template.templateId,
                templateVersion);

            if (restoreResult.status === 200) {
                history.push(`/Templates/${template.templateId}/Versions/${restoreResult.data}`);
            } else {
                addErrorMessage(`Template restore failed: ${restoreResult.status} ${restoreResult.statusText}`);
                showSaveMessage("Template failed to be restored due to errors.");
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
            showSaveMessage("Template failed to be restored due to errors.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveContentClick = async () => {
        try {
            clearErrorMessages();

            if (template === undefined) {
                addErrorMessage("Can't find template data to update");
                return;
            }

            const fundingLines: TemplateFundingLine[] = datasourceToTemplateFundingLines(ds);
            if (!fundingLines || fundingLines.length === 0) {
                showSaveMessage("You can't save an empty template. Add one or more funding lines and try again.");
                return;
            }

            setIsSaving(true);
            setSaveMessage("Saving template...");

            const templateContentUpdateCommand: TemplateContentUpdateCommand = {
                templateId: template.templateId,
                templateFundingLinesJson: JSON.stringify(fundingLines)
            };

            const saveResponse = await saveTemplateContent(templateContentUpdateCommand);
            if (!version) {
                clearUndoState();
                clearRedoState();
                await fetchData();
                setIsDirty(false);
                showSaveMessage("Template saved successfully.");
            } else {
                if (saveResponse.status === 200 || saveResponse.status === 201) {
                    setIsDirty(false);
                    history.push(`/Templates/${template.templateId}/Versions/${saveResponse.data}`);
                } else {
                    addErrorMessage(`Template save failed: ${saveResponse.status} ${saveResponse.statusText}`);
                    showSaveMessage("Template failed to save due to errors.");
                }
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
                addErrorMessage(`Template could not be saved: ${err.message}.`, "template");
            }
            showSaveMessage("Template failed to save due to errors.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublishClick = () => {
        if (!template) return;
        history.push(`/Templates/Publish/${template.templateId}`);
    };

    const handleAddFundingLineClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const keyCount = ds.length > 0 ? ds.reduce((prev, current) => {
            return (prev.key > current.key ? prev : current)
        }).key : 0;
        const id = nextId;
        incrementNextId();

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
        setFocusNodeId(`n${id}`);
    };

    const handleUndo = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        undo();
        if (undos === 0) {
            setIsDirty(false);
        }
    };

    const handleRedo = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        redo();
        setIsDirty(true);
    };

    const toggleEditDescription = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        clearErrorMessages();
        setShowModal(!showModal);
    };

    const saveDescription = async (description: string) => {
        if (!template) return;
        try {
            const saveResponse = await updateTemplateDescription(template.templateId, description);
            if (saveResponse.status !== 200) {
                addErrorMessage("Description changes could not be saved", "description");
            } else {
                const updatedTemplate: TemplateResponse = Object.assign({}, template, {description: description});
                setTemplate(updatedTemplate);
            }
        } catch (err) {
            addErrorMessage(`Description changes could not be saved: ${err.message}.`, "description");
        }
    };

    const handleScroll = (fieldName: string | undefined) => {
        if (!fieldName) return;
        let ref: React.RefObject<HTMLElement> | null = null;

        if (fieldName === "description") {
            ref = descriptionRef;
        } else if (fieldName === "template") {
            ref = orgchart;
        }

        ref && ref.current && ref.current.scrollIntoView({behavior: 'smooth', block: 'start'});
    };

    const search = async (result: string) => {
        if (!result || result.trim().length === 0) {
            setFocusNodeId("");
            return;
        }
        if (result.startsWith("C")) {
            const id = result.substring(1);
            setFocusNodeId(id);
            const dataNode = await findNodeById(ds, id);
            const node: FundingLineOrCalculationSelectedItem = {
                key: dataNode.dsKey,
                value: dataNode as Calculation
            };
            readSelectedNode(node);
            setOpenSidebar(true);
        }
        if (result.startsWith("F")) {
            const id = result.substring(1);
            setFocusNodeId(id);
            const dataNode = await findNodeById(ds, id);
            const node: FundingLineOrCalculationSelectedItem = {
                key: dataNode.dsKey,
                value: dataNode as FundingLine
            };
            readSelectedNode(node);
            setOpenSidebar(true);
        }
    };

    const checkIfTemplateLineIdInUse = (templateLineId: number) => {
        const allTemplateLineIds: number[] = getAllTemplateLineIds(ds);
        return allTemplateLineIds.includes(templateLineId);
    };

    const checkFundingLineNameInUse = (name: string) => {
        const allNames: string[] = ds.map(fl => fl.value.name);
        return allNames.includes(name);
    };

    const canBeDeleted = (id: string) => {
        const fundingLines: FundingLine[] = ds.map(fl => fl.value);
        return !isClonedNode(id) || isCloneRoot(fundingLines, id);
    };

    const fullScreenStyle: React.CSSProperties = {
        zIndex: 1,
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        position: "fixed"
    }

    const toolBarFullScreenStyle: React.CSSProperties = {
        zIndex: 10,
        width: "100%",
        top: 10,
        left: 0,
        position: "fixed"
    }

    const saveMessageFullScreenStyle: React.CSSProperties = {
        zIndex: 10,
        width: "90%",
        bottom: 33,
        left: 100,
        position: "fixed"
    }

    return (
        <div>
            <Header location={Section.Templates} />
            <div className="govuk-width-container">
                <PermissionStatus requiredPermissions={missingPermissions ? missingPermissions : []} hidden={isLoading} />
                <LoadingStatus title={"Loading Template"} hidden={!isLoading} id={"template-builder-loader"}
                    subTitle={"Please wait while the template loads."} />
                {!version && <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"Templates"} url={"/Templates/List"} data-testid='template-listing-link' />
                    <Breadcrumb name={template ? template.name : ""} />
                </Breadcrumbs>}
                {version && <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"Templates"} url={"/Templates/List"} data-testid='template-listing-link' />
                    <Breadcrumb name={template ? template.name : "Template"} url={`/Templates/${templateId}/Edit`} />
                    <Breadcrumb name={"Versions"} url={`/Templates/${templateId}/Versions`} />
                    <Breadcrumb name={isLoading ? "Loading..." : template ? `${template.majorVersion}.${template.minorVersion}` : ""} />
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
                                            {errors.map((error, i) =>
                                                <li key={i}>
                                                    {error.fieldName &&
                                                        <button onClick={() => handleScroll(error.fieldName)}
                                                            className="govuk-link govuk-link-red">
                                                            {error.message}
                                                        </button>}
                                                    {!error.fieldName &&
                                                        <span className="govuk-error-message">{error.message}</span>}
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-0" data-testid="template-name">{template && template.name}</h1>
                    <h3 className="govuk-caption-l govuk-!-padding-top-0">{template &&
                        <span>{template.fundingStreamName} for {template.fundingPeriodName}</span>
                    }
                    </h3>

                    {template && ((template.isCurrentVersion && canEditTemplate) || (template.description && template.description.trim().length > 0)) &&
                        <details className="govuk-details govuk-!-margin-top-3 govuk-!-margin-bottom-3" data-module="govuk-details">
                            <summary className="govuk-details__summary">
                                <span className="govuk-details__summary-text">
                                    What is {template.fundingStreamId} {template.fundingPeriodId}?
                            </span>
                            </summary>
                            <div
                                className={`govuk-details__text ${errors.filter(error => error.fieldName === "description").length > 0 ? 'govuk-form-group--error' : ''}`}>
                                <span className="govuk-caption-m" id="description" ref={descriptionRef}>Description</span>
                                {errors.map(error => error.fieldName === "description" &&
                                    <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                        <span className="govuk-visually-hidden">Error:</span> {error.message}
                                    </span>
                                )}
                                <p className="govuk-body">
                                    {`${(template.description && template.description.trim()) || ''} `}
                                    {template.isCurrentVersion && canEditTemplate &&
                                        <>
                                            {template.description && template.description.trim().length > 0 &&
                                                <button id="edit-description-link"
                                                    onClick={toggleEditDescription}
                                                    className="govuk-link govuk-link--no-visited-state">
                                                    Edit
                                    </button>}
                                            {(!template.description || (template.description.trim().length === 0)) &&
                                                <button id="add-description-link"
                                                    onClick={toggleEditDescription}
                                                    className="govuk-link govuk-link--no-visited-state">
                                                    Add
                                    </button>}
                                        </>
                                    }
                                </p>
                            </div>
                        </details>}

                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <span className="govuk-caption-m">Version</span>
                            <span
                                className="govuk-heading-m govuk-!-margin-bottom-2">{template && `${template.majorVersion}.${template.minorVersion}`} &nbsp;</span>
                            {template && template.status === TemplateStatus.Draft && template.isCurrentVersion &&
                                <span><strong className="govuk-tag govuk-tag--blue">IN PROGRESS</strong></span>}
                            {template && template.status === TemplateStatus.Draft && !template.isCurrentVersion &&
                                <span><strong className="govuk-tag govuk-tag--grey">DRAFT</strong></span>}
                            {template && template.status === TemplateStatus.Published &&
                                <span><strong className="govuk-tag govuk-tag--green">PUBLISHED</strong><br />
                                </span>}
                            {template &&
                                <div className="govuk-body">
                                    <Link id="versions-link"
                                        to={`/Templates/${templateId}/Versions`}
                                        data-testid='template-versions-link'
                                        className="govuk-link--no-visited-state">
                                        View all versions
                                </Link>
                                </div>}
                        </div>
                    </div>
                    {template && template.status === TemplateStatus.Published &&
                        <>
                            <span className="govuk-caption-m">Publish Notes</span>
                            <p className="govuk-body">
                                {template && template.comments}
                            </p>
                        </>}
                    {mode === Mode.Edit && canEditTemplate &&
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full" style={isFullScreen ? toolBarFullScreenStyle : {}}>
                                <div className="govuk-grid-column-one-third govuk-!-padding-left-0 search-container">
                                    <AutoComplete suggestions={allFundingLinesAndCalculations}
                                        callback={search} includePager={true} mode={AutoCompleteMode.PrefixedId} />
                                </div>
                                <div className="govuk-grid-column-two-thirds govuk-!-padding-left-0 govuk-!-padding-right-0">
                                    <p className="govuk-body govuk-visually-hidden" aria-label="Template actions">Template actions</p>
                                    <ul className="govuk-list inline-block-list">
                                        <li>
                                            <a href="#"
                                                data-testid='redo'
                                                onClick={handleRedo}
                                                className="govuk-link-m govuk-link--no-visited-state right-align govuk-!-margin-bottom-0 govuk-!-margin-right-0">
                                                <span>↪</span> Redo ({redos})
                                        </a>
                                        </li>
                                        <li>
                                            <a href="#"
                                                data-testid='undo'
                                                onClick={handleUndo}
                                                className="govuk-link-m govuk-link--no-visited-state right-align govuk-!-margin-right-2 govuk-!-margin-bottom-0">
                                                <span>↩</span> Undo ({undos})
                                        </a>
                                        </li>
                                        <li>
                                            <a href="#"
                                                data-testid='add-funding-line'
                                                onClick={handleAddFundingLineClick}
                                                className="govuk-link-m govuk-link--no-visited-state right-align govuk-!-margin-right-2 govuk-!-margin-bottom-0">
                                                <span>+</span> Add a new funding line
                                        </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>}
                    <div className="govuk-!-margin-bottom-0 gov-org-chart-container" style={isFullScreen ? fullScreenStyle : {}}>
                        <div id="template"
                            className={`govuk-form-group govuk-!-margin-bottom-0 ${errors.filter(error => error.fieldName === "template").length > 0 ? 'govuk-form-group--error' : ''}`}>
                            {errors.map((error, i) => error.fieldName === "template" &&
                                <span key={`error${i}`} className="govuk-error-message govuk-!-margin-bottom-1">
                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                </span>
                            )}
                            <div id="template-builder-container" className="template-builder-container">
                                <OrganisationChart
                                    ref={orgchart}
                                    itemRefs={itemRefs}
                                    NodeTemplate={TemplateBuilderNode}
                                    datasource={ds}
                                    chartClass="myChart"
                                    collapsible={true}
                                    draggable={true}
                                    pan={true}
                                    zoom={true}
                                    multipleSelect={false}
                                    isEditMode={mode === Mode.Edit}
                                    onClickNode={readSelectedNode}
                                    onClickChart={clearSelectedNode}
                                    openSideBar={openSideBar}
                                    onClickAdd={onClickAdd}
                                    changeHierarchy={changeHierarchy}
                                    cloneNode={cloneNode}
                                    nextId={nextId}
                                    addNodeToRefs={addNodeToRefs}
                                    focusNodeId={focusNodeId}
                                    chartScale={chartScale}
                                    targetScale={targetScale}
                                />
                                <TemplateBuilderToolBar
                                    orgChart={orgchart}
                                    setChartScale={setChartScale}
                                    chartScale={chartScale}
                                    setTargetScale={setTargetScale}
                                    targetScale={targetScale}
                                    isFullScreen={isFullScreen}
                                    setIsFullScreen={setIsFullScreen}
                                />
                            </div>
                        </div>
                    </div>
                    {template && <TemplateButtons
                        isEditMode={mode === Mode.Edit}
                        canEditTemplate={canEditTemplate}
                        canApproveTemplate={canApproveTemplate}
                        canCreateTemplate={canCreateTemplate}
                        templateId={template.templateId}
                        templateStatus={template.status}
                        hasTemplateContent={template.templateJson !== null && template.templateJson.trim().length > 0}
                        templateVersion={template.version}
                        unsavedChanges={isDirty}
                        isSaving={isSaving}
                        isCurrentVersion={template.isCurrentVersion}
                        isFullScreen={isFullScreen}
                        handleSave={handleSaveContentClick}
                        handleRestore={handleRestoreTemplateClick}
                        handlePublish={handlePublishClick}
                    />}
                    <p className="govuk-body">
                        Last updated: <DateFormatter date={template ? template.lastModificationDate : new Date()} />
                        {` by ${template && template.authorName}`}
                    </p>
                    {saveMessage.length > 0 ? <span className="govuk-error-message" style={isFullScreen ? saveMessageFullScreenStyle : {}}>{saveMessage}</span> : null}
                    <Link to={version !== undefined ? `/Templates/${templateId}/Versions` : "/Templates/List"}
                        id="back-button"
                        className="govuk-link govuk-back-link govuk-link--no-visited-state">
                        Back
                    </Link>
                    <Sidebar sidebar={
                        <SidebarContent
                            data={selectedNodes}
                            isEditMode={mode === Mode.Edit}
                            calcs={getCalculations()}
                            updateNode={updateNode}
                            openSideBar={openSideBar}
                            deleteNode={onClickDelete}
                            cloneCalculation={onCloneCalculation}
                            checkIfTemplateLineIdInUse={checkIfTemplateLineIdInUse}
                            checkFundingLineNameInUse={checkFundingLineNameInUse}
                            refreshNextId={refreshNextId}
                            canBeDeleted={canBeDeleted}
                        />}
                        open={openSidebar}
                        onSetOpen={openSideBar}
                        pullRight={true}
                        styles={{
                            sidebar: {
                                background: "white",
                                position: "fixed",
                                padding: "20px 20px",
                                width: "500px",
                                zIndex: "10"
                            }, root: {position: "undefined"}, content: {
                                position: "undefined",
                                top: "undefined",
                                left: "undefined",
                                right: "undefined",
                                bottom: "undefined"
                            }
                        }}
                    ><span></span></Sidebar>
                </div>
            </div>
            {mode === Mode.Edit && canEditTemplate && !isLoading &&
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
