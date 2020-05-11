import React, { useState, useRef, useEffect } from 'react';
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
    updateNode as updateDatasource
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
    FundingLineOrCalculation
} from '../types/TemplateBuilderDefinitions';
import { FundingStreamPermissions } from "../types/FundingStreamPermissions";
import "../styles/TemplateBuilder.scss";
import { useSelector } from "react-redux";
import { AppState } from "../states/AppState";

enum Mode {
    View = 'view',
    Edit = 'edit'
}

const initialId: number = 0; // ToDo: Calculate last id from datasource when loading from server

export function TemplateBuilder() {
    const orgchart = useRef();
    const [ds, setDS] = useState<Array<FundingLineDictionaryEntry>>([]);
    const [mode, setMode] = useState<string>(Mode.Edit);
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Set<FundingLineOrCalculationSelectedItem>>(new Set());
    const [nextId, setNextId] = useState(initialId);
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const [canEditTemplate, setCanEditTemplate] = useState<boolean>(false);
    const [canDeleteTemplate, setCanDeleteTemplate] = useState<boolean>(false);
    const [canApproveTemplate, setCanApproveTemplate] = useState<boolean>(false);
    let permissions: FundingStreamPermissions[] = useSelector((state: AppState) => state.userPermissions.fundingStreamPermissions);

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
            fundingLineCode: `Code ${id}`
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
                <div className="govuk-main-wrapper">
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h1 className="govuk-heading-l">Build policy template</h1>
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
                            {canEditTemplate && mode === Mode.Edit && <button className="govuk-button" data-testid='add' onClick={handleAddFundingLineClick}>Add new funding line</button>}
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
            </div>
            <Footer />
        </div>
    )
}
