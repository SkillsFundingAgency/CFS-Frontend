import React, { useState, useRef } from 'react';
import JSONDigger from "json-digger";
import Sidebar from "react-sidebar";
import { SidebarContent } from "../components/SidebarContent";
import { Section } from '../types/Sections';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import OrganisationChart from "../components/OrganisationChart";
import TemplateBuilderNode from "../components/TemplateBuilderNode";
import { NodeType, FundingLineType, FundingLineUpdateModel, CalculationUpdateModel, FundingLineDictionaryEntry, FundingLine, Calculation, FundingLineOrCalculationSelectedItem } from '../types/TemplateBuilderDefinitions';
import "../styles/TemplateBuilder.scss";

enum Mode {
    View = 'view',
    Edit = 'edit'
}

const initialId: number = 0;
const fundingLineIdField = "id";
const fundingLineChildrenField = "children";

export function TemplateBuilder() {
    const orgchart = useRef();
    const [ds, setDS] = useState<Array<FundingLineDictionaryEntry>>([]);
    const [mode, setMode] = useState<string>(Mode.View);
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Set<FundingLineOrCalculationSelectedItem>>(new Set());
    const [nextId, setNextId] = useState(initialId); // ToDo: Calculate last id from datasource when loading from server

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
        for (let i = 0; i < ds.length; i++) {
            const fundingLine = ds.find(k => k.key === ds[i].key);
            if (!fundingLine) continue;
            const dsDigger = new JSONDigger(fundingLine.value, fundingLineIdField, fundingLineChildrenField);
            try {
                await dsDigger.updateNode(node);
            }
            catch {
                // ignore if node doesn't exist in current funding line
                continue;
            }
        };
        setDS([...ds]);
    }

    const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMode(e.target.value);
        setOpenSidebar(false);
    }

    const onClickAdd = async (id: string, newChild: FundingLine | Calculation) => {
        for (let i = 0; i < ds.length; i++) {
            const fundingLine = ds.find(k => k.key === ds[i].key);
            if (!fundingLine) return;
            const dsDigger = new JSONDigger(fundingLine.value, fundingLineIdField, fundingLineChildrenField);
            setNextId(nextId + 1);
            try {
                await dsDigger.addChildren(id, [newChild]);
            }
            catch {
                // ignore - iterates through all funding line trees to update cloned nodes that may exist in other funding lines
            }
        }
        setDS([...ds]);
    }

    const onClickDelete = async (id: string, isRootNode: boolean) => {
        for (let i = 0; i < ds.length; i++) {
            const fundingLine = ds.find(k => k.key === ds[i].key);
            if (!fundingLine) return;
            const dsDigger = new JSONDigger(fundingLine.value, fundingLineIdField, fundingLineChildrenField);
            try {
                await dsDigger.findNodeById(id);
            }
            catch {
                continue;
            }
            if (isRootNode) {
                const state = ds.filter(n => n.key !== fundingLine.key);
                setDS([...state]);
                continue;
            }
            await dsDigger.removeNodes(id);
            setDS([...ds]);
        }
    }

    const cloneNode = async (draggedItemData: { id: string, isRootNode: boolean }, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => {
        const sourceFundingLine = ds.find(k => k.key === draggedItemDsKey);
        if (!sourceFundingLine) return;
        const destinationFundingLine = ds.find(k => k.key === dropTargetDsKey);
        if (!destinationFundingLine) return;
        if (draggedItemData.isRootNode) {
            draggedItemData.isRootNode = false;
        }
        const destinationDsDigger = new JSONDigger(destinationFundingLine.value, fundingLineIdField, fundingLineChildrenField);
        await destinationDsDigger.addChildren(dropTargetId, draggedItemData);
        setDS([...ds]);
    };

    const changeHierarchy = async (draggedItemData: { id: string, isRootNode: boolean }, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => {
        const sourceFundingLine = ds.find(k => k.key === draggedItemDsKey);
        if (!sourceFundingLine) return;
        const destinationFundingLine = ds.find(k => k.key === dropTargetDsKey);
        if (!destinationFundingLine) return;
        const destinationDsDigger = new JSONDigger(destinationFundingLine.value, fundingLineIdField, fundingLineChildrenField);
        if (draggedItemData.isRootNode) {
            draggedItemData.isRootNode = false;
            await destinationDsDigger.addChildren(dropTargetId, draggedItemData);
            const filteredDs = ds.filter(n => n.key !== draggedItemDsKey);
            setDS([...filteredDs]);
        }
        else {
            await destinationDsDigger.addChildren(dropTargetId, draggedItemData);
            const sourceDsDigger = new JSONDigger(sourceFundingLine.value, fundingLineIdField, fundingLineChildrenField);
            await sourceDsDigger.removeNode(draggedItemData.id);
            setDS([...ds]);
        }
    };

    const handleAddFundingLineClick = () => {
        const keyCount = ds.length > 0 ? ds.reduce((prev, current) => { return (prev.key > current.key ? prev : current) }).key : 0;
        const id = nextId;
        setNextId(nextId + 1);

        const fundingLine: FundingLine = {
            id: `n${id}`,
            isRootNode: true,
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
            <Header location={Section.FundingPreparation} />
            <div className="govuk-width-container">
                <div className="govuk-main-wrapper">
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h1 className="govuk-heading-l">Build policy template</h1>
                            <div className="govuk-form-group">
                                <div className="govuk-radios govuk-radios--inline">
                                    <div className="govuk-radios__item">
                                        <input className="govuk-radios__input" id="edit-mode" name="edit-mode" type="radio" value="edit" checked={mode === 'edit'} onChange={handleModeChange} data-testid='edit' />
                                        <label className="govuk-label govuk-radios__label" htmlFor="edit-mode">
                                            Edit
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input className="govuk-radios__input" id="edit-mode-2" name="edit-mode" type="radio" value="view" checked={mode === "view"} onChange={handleModeChange} data-testid='view' />
                                        <label className="govuk-label govuk-radios__label" htmlFor="edit-mode-2">
                                            View
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {mode === "edit" && <button className="govuk-button" data-testid='add' onClick={handleAddFundingLineClick}>Add new funding line</button>}
                        </div>
                    </div>
                </div>
                <div className="gov-org-chart-container">
                    <OrganisationChart
                        ref={orgchart}
                        NodeTemplate={TemplateBuilderNode}
                        datasource={ds}
                        chartClass="myChart"
                        collapsible={true}
                        draggable={true}
                        pan={true}
                        zoom={true}
                        onClickNode={readSelectedNode}
                        onClickChart={clearSelectedNode}
                        openSideBar={openSideBar}
                        editMode={mode === "edit"}
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
        </div >
    )
}
