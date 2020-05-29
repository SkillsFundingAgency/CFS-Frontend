import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from "react-sidebar";
import { SidebarContent } from "../components/SidebarContent";
import { Section } from '../types/Sections';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import OrganisationChart from "../components/OrganisationChart";
import TemplateBuilderNode from "../components/TemplateBuilderNode";
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
    getLastUsedId
} from "../services/templateBuilderDatasourceService";
import { PermissionStatus } from "../components/PermissionStatus";
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
    TemplateResponse, TemplateContentUpdateCommand, TemplateFundingPeriod
} from '../types/TemplateBuilderDefinitions';
import { FundingStreamPermissions } from "../types/FundingStreamPermissions";
import "../styles/TemplateBuilder.scss";
import { useSelector } from "react-redux";
import { AppState } from "../states/AppState";
import { useEffectOnce } from '../hooks/useEffectOnce';
import { DateFormatter } from '../components/DateFormatter';
import { Breadcrumbs, Breadcrumb } from '../components/Breadcrumbs';
import { LoadingStatus } from '../components/LoadingStatus';
import { getFundingPeriodsByFundingStreamIdService } from "../services/specificationService";
import { FundingPeriod, FundingStream } from "../types/viewFundingTypes";

enum Mode {
    View = 'view',
    Edit = 'edit'
}

export function TemplateBuilder() {
    const orgchart = useRef();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [ds, setDS] = useState<Array<FundingLineDictionaryEntry>>([]);
    const [template, setTemplate] = useState<TemplateResponse>();
    const [fundingPeriod, setFundingPeriod] = useState<FundingPeriod>();
    const [fundingStream, setFundingStream] = useState<FundingStream>();
    const [mode, setMode] = useState<string>(Mode.Edit);
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Set<FundingLineOrCalculationSelectedItem>>(new Set());
    const [nextId, setNextId] = useState(0);
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const [canEditTemplate, setCanEditTemplate] = useState<boolean>(false);
    const [canCreateTemplate, setCanCreateTemplate] = useState<boolean>(false);
    const [canDeleteTemplate, setCanDeleteTemplate] = useState<boolean>(false);
    const [canApproveTemplate, setCanApproveTemplate] = useState<boolean>(false);
    let permissions: FundingStreamPermissions[] = useSelector((state: AppState) => state.userPermissions.fundingStreamPermissions);

    function getCreatePermission() {
        if (!permissions) {
            return false;
        }
        return permissions.some(p => p.canCreateTemplates);
    }
    function getEditPermission() {
        if (!permissions) {
            return false;
        }
        return permissions.some(p => p.canEditTemplates);
    }

    function getDeletePermission() {
        if (!permissions) {
            return false;
        }
        return permissions.some(p => p.canDeleteTemplates);
    }

    function getApprovePermission() {
        if (!permissions) {
            return false;
        }
        return permissions.some(p => p.canApproveTemplates);
    }

    let { templateId } = useParams();

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const templateResult = await getTemplateById(templateId);
            const templateResponse = templateResult.data as TemplateResponse;
            setTemplate(templateResponse);
            if (templateResponse.templateJson) {
                const template = JSON.parse(templateResponse.templateJson) as Template;
                if (template && template !== null) {
                    const fundingLines = templateFundingLinesToDatasource(template.fundingTemplate.fundingLines)
                    setDS(fundingLines);
                    setNextId(getLastUsedId(template.fundingTemplate.fundingLines) + 1);
                }
                else {
                    setIsError(true);
                    setErrorMessages(errors => [...errors, "The template content could not be loaded."]);
                }
            }
            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
            setIsError(true);
            setErrorMessages(errors => [...errors, err.message]);
        }
    };

    useEffectOnce(() => {
        fetchData();
    });

    useEffect(() => {
        let missing: string[] = [];

        if (!canEditTemplate) {
            missing.push("edit");
        } else {
            setMode(Mode.Edit);
        }
        if (!canDeleteTemplate) {
            missing.push("delete");
        }
        if (!canApproveTemplate) {
            missing.push("approve");
        }

        setMissingPermissions(missing);
    }, [canEditTemplate, canDeleteTemplate, canApproveTemplate]);

    useEffect(() => {
        setCanCreateTemplate(getCreatePermission());
        setCanEditTemplate(getEditPermission());
        setCanDeleteTemplate(getDeletePermission());
        setCanApproveTemplate(getApprovePermission());
    }, [permissions]);

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
        setDS([...ds]);
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
        setDS([...ds]);
    }

    const onClickDelete = async (id: string) => {
        await removeNode(ds, id);
        setDS([...ds]);
    }

    const cloneNode = async (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => {
        await cloneNodeDatasource(ds, draggedItemData, draggedItemDsKey, dropTargetId, dropTargetDsKey);
        setDS([...ds]);
    };

    const changeHierarchy = async (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => {
        await moveNode(ds, draggedItemData, draggedItemDsKey, dropTargetId, dropTargetDsKey);
        setDS([...ds]);
    };

    function showSaveMessageOnce(message: string) {
        setSaveMessage(message);
        setTimeout(function () { setSaveMessage(""); }, 5000);
    }

    const handleSaveContentClick = async () => {
        try {
            if (template == undefined) {
                setIsError(true);
                setErrorMessages(errors => [...errors, "Can't find template data to update"]);
                return;
            }
    
            setSaveMessage("Saving template...");
            const fundingLines: TemplateFundingLine[] = datasourceToTemplateFundingLines(ds);
            if (!fundingLines || fundingLines.length === 0 || fundingLines === null) {
                showSaveMessageOnce("You can't save an empty template. Add one or more funding lines and try again.");
                return;
            }
            const templateUpdated: Template = {
                $schema: "https://fundingschemas.blob.core.windows.net/schemas/funding-template-schema-1.1.json",
                schemaVersion: "1.1",
                fundingTemplate: {
                    fundingLines: fundingLines,
                    fundingPeriod: {
                        id: template.fundingPeriodId,
                        period: "2021",
                        name: template.fundingPeriodId,
                        type: "FY",
                        startDate: "2020-04-01T00:00:00+00:00",
                        endDate: "2021-03-31T00:00:00+00:00"
                    },
                    fundingStream: {
                        code: template.fundingStreamId,
                        name: template.fundingStreamId
                    },
                    fundingTemplateVersion: "#version#"
                }
            };
            const templateContentUpdateCommand: TemplateContentUpdateCommand = {
                templateId: template.templateId,
                templateJson: JSON.stringify(templateUpdated)
            }

            await saveTemplateContent(templateContentUpdateCommand);
            await fetchData();
            showSaveMessageOnce("Template saved successfully.");
        }
        catch (err) {
            setSaveMessage(`Template could not be saved: ${err.message}.`);
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
        setDS([...ds]);
    }

    return (
        <div>
            <Header location={Section.Templates} />
            <div className="govuk-width-container">
                <PermissionStatus requiredPermissions={missingPermissions} />
                <LoadingStatus title={"Loading Template"} hidden={!isLoading} id={"template-builder-loader"}
                    subTitle={"Please wait while the template loads."} />
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"Templates"} url={"/templates"} />
                    <Breadcrumb name={template ? template.name : ""} />
                </Breadcrumbs>
                {!isError ?
                    <>
                        <div className="govuk-main-wrapper">
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    <h1 className="govuk-heading-l">{template && template.name}</h1>
                                    <span className="govuk-caption-m">Funding stream</span>
                                    <h3 className="govuk-heading-m">{template && template.fundingStreamId}</h3>
                                    <span className="govuk-caption-m">Funding period</span>
                                    <h3 className="govuk-heading-m">{template && template.fundingPeriodId}</h3>
                                    <span className="govuk-caption-m">Description</span>
                                    <h3 className="govuk-heading-m">{template && template.description}</h3>
                                    <span className="govuk-caption-m">Major Version</span>
                                    <h3 className="govuk-heading-m">{template && template.majorVersion}</h3>
                                    <span className="govuk-caption-m">Minor Version</span>
                                    <h3 className="govuk-heading-m">{template && template.minorVersion}</h3>
                                    <span className="govuk-caption-m">Status</span>
                                    <h3 className="govuk-heading-m">{template && template.status}</h3>
                                    <span className="govuk-caption-m">Version</span>
                                    <h3 className="govuk-heading-m">Version {template && template.version}</h3>
                                    <span className="govuk-caption-m">Last Updated Date</span>
                                    <h3 className="govuk-heading-m"><DateFormatter date={template ? template.lastModificationDate : null} utc={false} /></h3>
                                    <span className="govuk-caption-m">Last Updated Author</span>
                                    <h3 className="govuk-heading-m">{template && template.authorName}</h3>
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
                                        <button className="govuk-button govuk-!-margin-right-2 " data-testid='add'
                                            onClick={handleAddFundingLineClick}>Add new funding line</button>}
                                    {mode === Mode.Edit && (template == undefined && canCreateTemplate || template !== undefined && canEditTemplate) &&
                                        <button className="govuk-button" data-testid='save'
                                            onClick={handleSaveContentClick}>Save and continue
                                        </button>}
                                    {saveMessage.length > 0 ? <span className="govuk-error-message">{saveMessage}</span> : null}
                                </div>
                            </div>
                        </div>
                        <div className="gov-org-chart-container">
                            <OrganisationChart
                                ref={orgchart}
                                NodeTemplate={TemplateBuilderNode}
                                datasource={ds}
                                chartClass="myChart"
                                collapsible={false}
                                draggable={true}
                                pan={true}
                                zoom={true}
                                onClickNode={readSelectedNode}
                                onClickChart={clearSelectedNode}
                                openSideBar={openSideBar}
                                editMode={mode === Mode.Edit}
                                onClickAdd={onClickAdd}
                                changeHierarchy={changeHierarchy}
                                cloneNode={cloneNode}
                                nextId={nextId}
                            />
                            {mode === Mode.Edit &&
                                <Sidebar
                                    sidebar={<SidebarContent
                                        data={selectedNodes}
                                        updateNode={updateNode}
                                        openSideBar={openSideBar}
                                        deleteNode={onClickDelete}
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
                    </> :
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
            </div>
            <Footer />
        </div>
    )
}
