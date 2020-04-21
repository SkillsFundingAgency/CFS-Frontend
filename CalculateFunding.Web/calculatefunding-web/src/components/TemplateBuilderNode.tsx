import React, { useState } from "react";
import "../styles/TemplateBuilderNode.scss";
import { FundingLineOrCalculation, NodeType, FundingLine, Calculation, FundingLineType, CalculationType } from "../types/TemplateBuilderDefinitions";

interface TemplateBuilderNodeProps {
  nodeData: FundingLineOrCalculation,
  addNode: (id: string, newChild: FundingLine | Calculation) => Promise<void>,
  openSideBar: (open: boolean) => void,
  onClickNode: () => void,
  editMode: boolean,
  nextId: number,
};

function TemplateBuilderNode({ nodeData, addNode, openSideBar, onClickNode, editMode, nextId }: TemplateBuilderNodeProps) {
  const handleAddLine = () => {
    const newChild: FundingLine = {
      id: `n${nextId.toString()}`,
      isRootNode: false,
      templateLineId: nextId,
      kind: NodeType.FundingLine,
      type: FundingLineType.Information,
      name: `Funding Line ${nextId}`,
      fundingLineCode: `Code ${nextId}`,
    };
    addNode(nodeData.id, newChild);
  };

  const handleAddCalc = () => {
    const newChild: Calculation = {
      id: `n${nextId.toString()}`,
      isRootNode: false,
      templateCalculationId: nextId,
      kind: NodeType.Calculation,
      type: CalculationType.Information,
      name: `Calculation ${nextId}`,
    };
    addNode(nodeData.id, newChild);
  };

  const handleClick = () => {
    openSideBar(true);
    onClickNode();
  }

  if (nodeData.kind === NodeType.FundingLine) {
    const node = nodeData as FundingLine;
    return (
      <div>
        <div onClick={handleClick} data-testid={`node-${node.id}`}>
          <div className="fundingLine govuk-body-s">{node.name} ({node.fundingLineCode})</div>
          <div className="box govuk-body-s">{node.type}</div>
        </div>
        {editMode &&
          <div className="buttons">
            <button className="govuk-button" onClick={handleAddLine} data-testid='add-line'>Add Line</button>
            <button className="govuk-button" onClick={handleAddCalc} data-testid='add-calc'>Add Calculation</button>
          </div>}
      </div>
    );
  }

  const node = nodeData as Calculation;

  return (
    <div>
      <div onClick={handleClick}>
        <div className="calculation govuk-body-s">{node.name}</div>
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
