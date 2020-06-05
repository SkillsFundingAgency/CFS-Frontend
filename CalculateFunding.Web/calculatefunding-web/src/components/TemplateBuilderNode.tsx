import React from "react";
import "../styles/TemplateBuilderNode.scss";
import { FundingLineOrCalculation, NodeType, FundingLine, Calculation, FundingLineType, CalculationType, AggregrationType, ValueFormatType } from "../types/TemplateBuilderDefinitions";

interface TemplateBuilderNodeProps {
  nodeData: FundingLineOrCalculation,
  addNode: (id: string, newChild: FundingLine | Calculation) => Promise<void>,
  openSideBar: (open: boolean) => void,
  onClickNode: () => void,
  editMode: boolean,
  dsKey: number,
  nextId: number,
};

function TemplateBuilderNode({ nodeData, addNode, openSideBar, onClickNode, editMode, dsKey, nextId }: TemplateBuilderNodeProps) {
  const handleAddLine = () => {
    const newChild: FundingLine = {
      id: `n${nextId.toString()}`,
      templateLineId: nextId,
      kind: NodeType.FundingLine,
      type: FundingLineType.Information,
      name: `Funding Line ${nextId}`,
      fundingLineCode: undefined
    };
    addNode(nodeData.id, newChild);
  };

  const handleAddCalc = () => {
    const newChild: Calculation = {
      id: `n${nextId.toString()}`,
      dsKey: dsKey,
      templateCalculationId: nextId,
      kind: NodeType.Calculation,
      type: CalculationType.Cash,
      name: `Calculation ${nextId}`,
      aggregationType: AggregrationType.None,
      formulaText: "Enter formula text",
      valueFormat: ValueFormatType.Number,
      allowedEnumTypeValues: undefined,
      groupRate: undefined,
      percentageChangeBetweenAandB: undefined
    };
    addNode(nodeData.id, newChild);
  };

  const handleClick = () => {
    openSideBar(true);
    onClickNode();
  }

  const isClone = nodeData.id.includes(":");

  if (nodeData.kind === NodeType.FundingLine) {
    const node = nodeData as FundingLine;
    const fundingLineName = node.fundingLineCode ?
      `${node.name} (${node.fundingLineCode})${isClone ? "*" : ""}` :
      `${node.name} ${isClone ? "*" : ""}`;
      
    return (
      <div>
        <div onClick={handleClick} data-testid={`node-${node.id}`}>
          <div className="fundingLine govuk-body-s">{fundingLineName}</div>
          <div className="box govuk-body-s">{node.type}</div>
        </div>
        {editMode &&
          <div className="buttons">
            <button className="govuk-button" onClick={handleAddLine} data-testid={`${node.id}-add-line`}>Add Line</button>
            <button className="govuk-button" onClick={handleAddCalc} data-testid={`${node.id}-add-calc`}>Add Calculation</button>
          </div>}
      </div>
    );
  }

  const node = nodeData as Calculation;

  return (
    <div>
      <div onClick={handleClick}>
        <div className="calculation govuk-body-s">{`${node.name}${isClone ? "*" : ""}`}</div>
        <div className="box govuk-body-s">{node.valueFormat !== undefined ? node.type + " (" + node.valueFormat + ")" : node.type}</div>
      </div>
      {editMode &&
        <div className="buttons">
          <button className="govuk-button" onClick={handleAddCalc}>Add Calculation</button>
        </div>
      }
    </div>
  );
};

export default TemplateBuilderNode;
