import { mount } from "enzyme";
import React from "react";

import OrganisationChartNode from "../../../components/TemplateBuilder/OrganisationChartNode";
import NodeTemplate from "../../../components/TemplateBuilder/TemplateBuilderNode";
import { sendDragInfo } from "../../../services/templateBuilderService";
import {
  Calculation,
  FundingLine,
  FundingLineOrCalculation,
  FundingLineOrCalculationSelectedItem,
  FundingLineType,
  NodeType,
} from "../../../types/TemplateBuilderDefinitions";

let changeHierarchy: (
  draggedItemData: FundingLineOrCalculation,
  draggedItemDsKey: number,
  dropTargetId: string,
  dropTargetDsKey: number
) => Promise<void>;
let cloneNode: (
  draggedItemData: FundingLineOrCalculation,
  draggedItemDsKey: number,
  dropTargetId: string,
  dropTargetDsKey: number
) => Promise<void>;
let onClickNode: (node: FundingLineOrCalculationSelectedItem) => void;
let addNode: (id: string, newChild: FundingLine | Calculation) => Promise<void>;
let openSideBar: (open: boolean) => void;
let addNodeToRefs: (id: string, ref: React.MutableRefObject<any>) => void;

jest.mock("../../../services/templateBuilderService", () => {
  const { Subject } = require("rxjs");
  const subject1 = new Subject();
  const subject2 = new Subject();
  return {
    sendDragInfo: jest.fn((id, kind) => subject1.next({ draggedNodeId: id, draggedNodeKind: kind })),
    clearDragInfo: jest.fn(() => subject1.next()),
    getDragInfo: jest.fn(() => subject1.asObservable()),
    sendSelectedNodeInfo: jest.fn((id) => subject2.next({ selectedNodeId: id })),
    clearSelectedNodeInfo: jest.fn(() => subject2.next()),
    getSelectedNodeInfo: jest.fn(() => subject2.asObservable()),
  };
});
beforeEach(() => {
  changeHierarchy = jest.fn();
  cloneNode = jest.fn();
  onClickNode = jest.fn();
  addNode = jest.fn();
  openSideBar = jest.fn();
  addNodeToRefs = jest.fn();
  jest.clearAllMocks();
});

describe("Renders non-cloned nodes correctly", () => {
  const data: FundingLine = {
    id: "n0",
    dsKey: 0,
    templateLineId: 0,
    kind: NodeType.FundingLine,
    type: FundingLineType.Information,
    name: "My Funding Line 0",
    fundingLineCode: "Code 0",
  };

  it("sends drag event info to component", () => {
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
        isEditMode={true}
        nextId={1}
        dsKey={0}
        addNodeToRefs={addNodeToRefs}
        expandAllChildren={true}
        hasCloneParent={false}
      />
    );

    const node = wrapper.find("div#n0");
    node.simulate("dragStart", { dataTransfer: { setData: (format: string, data: string) => {} } });

    expect(sendDragInfo).toHaveBeenCalledTimes(1);
    expect(sendDragInfo).toHaveBeenCalledWith("n0", "FundingLine");
  });

  it("does not collapse a non-cloned node on initial render", () => {
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
        isEditMode={true}
        nextId={1}
        dsKey={0}
        addNodeToRefs={addNodeToRefs}
        expandAllChildren={true}
        hasCloneParent={false}
      />
    );

    expect(wrapper.find(".isChildrenCollapsed")).toHaveLength(0);
  });

  it("does collapse a non-cloned node on initial render if expandAllChildren is false", () => {
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
        isEditMode={true}
        nextId={1}
        dsKey={0}
        addNodeToRefs={addNodeToRefs}
        expandAllChildren={false}
        hasCloneParent={false}
      />
    );

    expect(wrapper.find(".isChildrenCollapsed")).toHaveLength(1);
  });
});

describe("Renders cloned nodes correctly", () => {
  const data: FundingLine = {
    id: "n0:12345",
    dsKey: 0,
    templateLineId: 0,
    kind: NodeType.FundingLine,
    type: FundingLineType.Information,
    name: "My Funding Line 0",
    fundingLineCode: "Code 0",
  };

  it("collapses a root cloned node on initial render even if expandAllChildren is true", () => {
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
        isEditMode={true}
        nextId={1}
        dsKey={0}
        addNodeToRefs={addNodeToRefs}
        expandAllChildren={true}
        hasCloneParent={false}
      />
    );

    expect(wrapper.find(".isChildrenCollapsed")).toHaveLength(1);
  });

  it("collapses a root node on initial render if expandAllChildren is false", () => {
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
        isEditMode={true}
        nextId={1}
        dsKey={0}
        addNodeToRefs={addNodeToRefs}
        expandAllChildren={false}
        hasCloneParent={false}
      />
    );

    expect(wrapper.find(".isChildrenCollapsed")).toHaveLength(1);
  });

  it("expands a clone node if parent is a clone and expandAllChildren is true", () => {
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
        isEditMode={true}
        nextId={1}
        dsKey={0}
        addNodeToRefs={addNodeToRefs}
        expandAllChildren={true}
        hasCloneParent={true}
      />
    );

    expect(wrapper.find(".isChildrenCollapsed")).toHaveLength(0);
  });

  it("collapses a clone node if parent is a clone and expandAllChildren is false", () => {
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
        isEditMode={true}
        nextId={1}
        dsKey={0}
        addNodeToRefs={addNodeToRefs}
        expandAllChildren={false}
        hasCloneParent={true}
      />
    );

    expect(wrapper.find(".isChildrenCollapsed")).toHaveLength(1);
  });
});
