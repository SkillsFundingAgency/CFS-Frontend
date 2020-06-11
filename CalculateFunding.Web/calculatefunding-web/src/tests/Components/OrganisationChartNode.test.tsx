import React from "react";
import OrganisationChartNode from "../../components/OrganisationChartNode";
import NodeTemplate from "../../components/TemplateBuilderNode";
import { mount } from "enzyme";
import { FundingLine, NodeType, FundingLineType, FundingLineOrCalculation, FundingLineOrCalculationSelectedItem, Calculation } from "../../types/TemplateBuilderDefinitions";
import { sendDragInfo, clearDragInfo, getDragInfo, sendSelectedNodeInfo, clearSelectedNodeInfo, getSelectedNodeInfo } from "../../services/templateBuilderService";

let changeHierarchy: (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => Promise<void>;
let cloneNode: (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => Promise<void>;
let onClickNode: (node: FundingLineOrCalculationSelectedItem) => void;
let addNode: (id: string, newChild: FundingLine | Calculation) => Promise<void>;
let openSideBar: (open: boolean) => void;

beforeEach(() => {
    changeHierarchy = jest.fn();
    cloneNode = jest.fn();
    onClickNode = jest.fn();
    addNode = jest.fn();
    openSideBar = jest.fn();
    jest.clearAllMocks();
});

it("sends drag event info to component", () => {
    const data: FundingLine = {
        id: "n0",
        dsKey: 0,
        templateLineId: 0,
        kind: NodeType.FundingLine,
        type: FundingLineType.Information,
        name: "My Funding Line 0",
        fundingLineCode: "Code 0"
    };

    const wrapper = mount(
        <OrganisationChartNode
            id="n0"
            datasource={data}
            NodeTemplate={NodeTemplate}
            changeHierarchy={changeHierarchy}
            cloneNode={cloneNode}
            onClickNode={onClickNode}
            addNode={addNode}
            openSideBar={openSideBar}
            editMode={true}
            nextId={1}
            dsKey={0}
        />);

    const node = wrapper.find("div#n0");
    node.simulate('dragStart', { dataTransfer: { setData: (format: string, data: string) => { } } });

    expect(sendDragInfo).toHaveBeenCalledTimes(1);
    expect(sendDragInfo).toHaveBeenCalledWith("n0", "FundingLine");
});

it("does not collapse a non-cloned node on initial render", () => {
    const data: FundingLine = {
        id: "n0",
        dsKey: 0,
        templateLineId: 0,
        kind: NodeType.FundingLine,
        type: FundingLineType.Information,
        name: "My Funding Line 0",
        fundingLineCode: "Code 0"
    };

    const wrapper = mount(
        <OrganisationChartNode
            id="n0"
            datasource={data}
            NodeTemplate={NodeTemplate}
            changeHierarchy={changeHierarchy}
            cloneNode={cloneNode}
            onClickNode={onClickNode}
            addNode={addNode}
            openSideBar={openSideBar}
            editMode={true}
            nextId={1}
            dsKey={0}
        />);

    expect(wrapper.find('.isChildrenCollapsed')).toHaveLength(0);
});

it("collapses a cloned node on initial render", () => {
    const data: FundingLine = {
        id: "n0:12345",
        dsKey: 0,
        templateLineId: 0,
        kind: NodeType.FundingLine,
        type: FundingLineType.Information,
        name: "My Funding Line 0",
        fundingLineCode: "Code 0"
    };

    const wrapper = mount(
        <OrganisationChartNode
            id="n0:12345"
            datasource={data}
            NodeTemplate={NodeTemplate}
            changeHierarchy={changeHierarchy}
            cloneNode={cloneNode}
            onClickNode={onClickNode}
            addNode={addNode}
            openSideBar={openSideBar}
            editMode={true}
            nextId={1}
            dsKey={0}
        />);

    expect(wrapper.find('.isChildrenCollapsed')).toHaveLength(1);
});