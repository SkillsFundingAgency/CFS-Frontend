import { mount } from "enzyme";
import React from "react";

import OrganisationChart from "../../../components/TemplateBuilder/OrganisationChart";
import NodeTemplate from "../../../components/TemplateBuilder/TemplateBuilderNode";
import { clearDragInfo, sendDragInfo } from "../../../services/templateBuilderService";
import {
  AggregrationType,
  Calculation,
  CalculationType,
  FundingLine,
  FundingLineDictionaryEntry,
  FundingLineOrCalculation,
  FundingLineOrCalculationSelectedItem,
  FundingLineType,
  NodeType,
  ValueFormatType,
} from "../../../types/TemplateBuilderDefinitions";

const data: FundingLineOrCalculation = {
  id: "n1",
  templateLineId: 1,
  kind: NodeType.FundingLine,
  type: FundingLineType.Information,
  name: "Funding Line 1",
  fundingLineCode: "Code",
  children: [
    {
      id: "n2",
      templateLineId: 2,
      kind: NodeType.FundingLine,
      type: FundingLineType.Information,
      name: "Funding Line 2",
      fundingLineCode: "code",
    },
    {
      id: "n3",
      templateLineId: 3,
      kind: NodeType.FundingLine,
      type: FundingLineType.Payment,
      name: "Funding Line 3",
      fundingLineCode: "Code 3",
      children: [
        {
          id: "n4",
          templateCalculationId: 4,
          kind: NodeType.Calculation,
          type: CalculationType.Number,
          name: "Calculation 1",
          formulaText: "formula",
          valueFormat: ValueFormatType.Currency,
          aggregationType: AggregrationType.Sum,
        },
        {
          id: "n5",
          templateLineId: 5,
          kind: NodeType.FundingLine,
          type: FundingLineType.Information,
          name: "Funding Line 4",
          fundingLineCode: "code",
          children: [
            {
              id: "n6",
              templateCalculationId: 6,
              kind: NodeType.Calculation,
              type: CalculationType.Number,
              name: "Calculation 2",
              formulaText: "formula",
              aggregationType: AggregrationType.None,
              valueFormat: ValueFormatType.Number,
            },
            {
              id: "n7",
              templateCalculationId: 7,
              kind: NodeType.Calculation,
              type: CalculationType.Number,
              name: "Calculation 3",
              formulaText: "formula",
              aggregationType: AggregrationType.None,
              valueFormat: ValueFormatType.Number,
            },
          ],
        },
        {
          id: "n8",
          templateCalculationId: 8,
          kind: NodeType.Calculation,
          type: CalculationType.Number,
          name: "Calculation 4",
          formulaText: "formula",
          aggregationType: AggregrationType.None,
          valueFormat: ValueFormatType.Number,
        },
      ],
    },
  ],
};

const datasource: FundingLineDictionaryEntry[] = [{ key: 0, value: data }];

let onClickNode: (node: FundingLineOrCalculationSelectedItem) => void;
let onClickAdd: (id: string, newChild: FundingLine | Calculation) => Promise<void>;
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
  onClickNode = jest.fn();
  onClickAdd = jest.fn();
  changeHierarchy = jest.fn();
  cloneNode = jest.fn();
  openSideBar = jest.fn();
  addNodeToRefs = jest.fn();
  jest.clearAllMocks();
});

it("renders all nodes in datasource", () => {
  const wrapper = mount(
    <OrganisationChart
      datasource={datasource}
      NodeTemplate={NodeTemplate}
      onClickNode={onClickNode}
      onClickAdd={onClickAdd}
      changeHierarchy={changeHierarchy}
      cloneNode={cloneNode}
      openSideBar={openSideBar}
      isEditMode={true}
      nextId={9}
      pan={true}
      zoom={true}
      draggable={true}
      collapsible={true}
      multipleSelect={false}
      addNodeToRefs={addNodeToRefs}
      itemRefs={{ current: {} }}
    />
  );

  expect(wrapper.find("OrganisationChartNode")).toHaveLength(8);
});

it("adds new lines", () => {
  const wrapper = mount(
    <OrganisationChart
      datasource={datasource}
      NodeTemplate={NodeTemplate}
      onClickNode={onClickNode}
      onClickAdd={onClickAdd}
      changeHierarchy={changeHierarchy}
      cloneNode={cloneNode}
      openSideBar={openSideBar}
      isEditMode={true}
      nextId={9}
      pan={true}
      zoom={true}
      draggable={true}
      collapsible={true}
      multipleSelect={false}
      addNodeToRefs={addNodeToRefs}
      itemRefs={{ current: {} }}
    />
  );

  const button = wrapper.find("[data-testid='n1-add-line']");
  button.simulate("click");
  button.simulate("click");

  expect(onClickAdd).toHaveBeenCalledTimes(2);
});

it("handles drag and drop of a Funding Line (clone)", () => {
  const wrapper = mount(
    <OrganisationChart
      datasource={datasource}
      NodeTemplate={NodeTemplate}
      onClickNode={onClickNode}
      onClickAdd={onClickAdd}
      changeHierarchy={changeHierarchy}
      cloneNode={cloneNode}
      openSideBar={openSideBar}
      isEditMode={true}
      nextId={9}
      pan={true}
      zoom={true}
      draggable={true}
      collapsible={true}
      multipleSelect={false}
      addNodeToRefs={addNodeToRefs}
      itemRefs={{ current: {} }}
    />
  );

  const sourceNode = wrapper.find("div#n2");
  const targetNode = wrapper.find("div#n5");
  const targetNodeCss = targetNode.getDOMNode().classList;

  sourceNode.simulate("dragStart", {
    dataTransfer: {
      setData: (format: string, data: string) => {},
    },
  });
  targetNode.simulate("drop", {
    ctrlKey: true,
    dataTransfer: { getData: () => '{ "dsKey": 1 }' },
    currentTarget: { classList: targetNodeCss.add("allowedDrop") },
  });

  expect(sendDragInfo).toHaveBeenCalledTimes(1);
  expect(sendDragInfo).toHaveBeenCalledWith("n2", "FundingLine");
  expect(clearDragInfo).toBeCalledTimes(1);
  expect(cloneNode).toBeCalledTimes(1);
  expect(changeHierarchy).toBeCalledTimes(0);
});

it("handles drag and drop of a Funding Line (copy)", () => {
  const wrapper = mount(
    <OrganisationChart
      datasource={datasource}
      NodeTemplate={NodeTemplate}
      onClickNode={onClickNode}
      onClickAdd={onClickAdd}
      changeHierarchy={changeHierarchy}
      cloneNode={cloneNode}
      openSideBar={openSideBar}
      isEditMode={true}
      nextId={9}
      pan={true}
      zoom={true}
      draggable={true}
      collapsible={true}
      multipleSelect={false}
      addNodeToRefs={addNodeToRefs}
      itemRefs={{ current: {} }}
    />
  );

  const sourceNode = wrapper.find("div#n2");
  const targetNode = wrapper.find("div#n5");
  const targetNodeCss = targetNode.getDOMNode().classList;

  sourceNode.simulate("dragStart", {
    dataTransfer: {
      setData: (format: string, data: string) => {},
    },
  });
  targetNode.simulate("drop", {
    ctrlKey: false,
    dataTransfer: { getData: () => '{ "dsKey": 1 }' },
    currentTarget: { classList: targetNodeCss.add("allowedDrop") },
  });

  expect(sendDragInfo).toHaveBeenCalledTimes(1);
  expect(sendDragInfo).toHaveBeenCalledWith("n2", "FundingLine");
  expect(clearDragInfo).toBeCalledTimes(1);
  expect(cloneNode).toBeCalledTimes(0);
  expect(changeHierarchy).toBeCalledTimes(1);
});

it("handles drag and drop of a Calculation", () => {
  const wrapper = mount(
    <OrganisationChart
      datasource={datasource}
      NodeTemplate={NodeTemplate}
      onClickNode={onClickNode}
      onClickAdd={onClickAdd}
      changeHierarchy={changeHierarchy}
      cloneNode={cloneNode}
      openSideBar={openSideBar}
      isEditMode={true}
      nextId={9}
      pan={true}
      zoom={true}
      draggable={true}
      collapsible={true}
      multipleSelect={false}
      addNodeToRefs={addNodeToRefs}
      itemRefs={{ current: {} }}
    />
  );

  const node = wrapper.find("div#n4");
  node.simulate("dragStart", {
    dataTransfer: {
      setData: (format: string, data: string) => {},
    },
  });

  expect(sendDragInfo).toHaveBeenCalledTimes(1);
  expect(sendDragInfo).toHaveBeenCalledWith("n4", "Calculation");
});
