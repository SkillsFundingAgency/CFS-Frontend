import "../../styles/OrganisationChartNode.scss";

import React, { useEffect, useRef, useState } from "react";

import {
  clearDragInfo,
  getDragInfo,
  getSelectedNodeInfo,
  sendDragInfo,
  sendSelectedNodeInfo,
} from "../../services/templateBuilderService";
import {
  Calculation,
  FundingLine,
  FundingLineOrCalculation,
  FundingLineOrCalculationSelectedItem,
  NodeType,
} from "../../types/TemplateBuilderDefinitions";

interface OrganisationChartNodeProps {
  id?: string;
  datasource: FundingLineOrCalculation;
  NodeTemplate: React.ReactType;
  draggable: boolean;
  collapsible: boolean;
  multipleSelect: boolean;
  changeHierarchy?: (
    draggedItemData: FundingLineOrCalculation,
    draggedItemDsKey: number,
    dropTargetId: string,
    dropTargetDsKey: number
  ) => Promise<void>;
  cloneNode?: (
    draggedItemData: FundingLineOrCalculation,
    draggedItemDsKey: number,
    dropTargetId: string,
    dropTargetDsKey: number
  ) => Promise<void>;
  isEditMode: boolean;
  onClickNode: (node: FundingLineOrCalculationSelectedItem) => void;
  addNode?: (id: string, newChild: FundingLine | Calculation) => Promise<void>;
  openSideBar: (open: boolean) => void;
  nextId?: number;
  dsKey: number;
  addNodeToRefs?: (id: string, ref: React.MutableRefObject<any>) => void;
  expandAllChildren: boolean;
  hasCloneParent: boolean;
  expandParent?: () => void;
}

const defaultProps = {
  draggable: false,
  collapsible: true,
  multipleSelect: false,
  expandAllChildren: true,
};

function OrganisationChartNode({
  datasource,
  NodeTemplate,
  draggable,
  collapsible,
  multipleSelect,
  changeHierarchy,
  cloneNode,
  isEditMode,
  onClickNode,
  addNode,
  openSideBar,
  nextId,
  dsKey,
  addNodeToRefs,
  expandAllChildren,
  hasCloneParent,
  expandParent,
}: OrganisationChartNodeProps) {
  const node = useRef<HTMLDivElement>(null);

  const [isChildrenCollapsed, setIsChildrenCollapsed] = useState<boolean>(false);
  const [bottomEdgeExpanded, setBottomEdgeExpanded] = useState<boolean>();
  const [allowedDrop, setAllowedDrop] = useState<boolean>(false);
  const [selected, setSelected] = useState<boolean>(false);
  const [expandAll, setExpandAll] = useState<boolean>(expandAllChildren);

  const isClone = datasource.id.includes(":");

  useEffect(() => {
    addNodeToRefs && addNodeToRefs(datasource.id, node);
    const shouldCollapseChildren = (!hasCloneParent && isClone) || !expandAllChildren;
    setIsChildrenCollapsed(shouldCollapseChildren);
  }, []);

  useEffect(() => {
    if (expandAllChildren !== expandAll) {
      setExpandAll(expandAllChildren);
    }
    if (expandAllChildren && isChildrenCollapsed) {
      setIsChildrenCollapsed(!isChildrenCollapsed);
    }
  }, [expandAllChildren]);

  const nodeClass = [
    "oc-node",
    isChildrenCollapsed ? "isChildrenCollapsed" : "",
    allowedDrop && !isClone ? "allowedDrop" : "",
    selected ? "selected" : "",
  ]
    .filter((item) => item)
    .join(" ");

  function permissible(sourceNodeKind: NodeType, targetNodeKind: NodeType): boolean {
    if (sourceNodeKind === NodeType.Calculation) {
      return true;
    }

    return targetNodeKind === NodeType.FundingLine;
  }

  useEffect(() => {
    if (!isEditMode) {
      return;
    }
    const subs1 = getDragInfo().subscribe((draggedInfo) => {
      if (draggedInfo && draggedInfo.draggedNodeId && draggedInfo.draggedNodeKind && node && node.current) {
        const draggedNode = document.querySelector("[id='" + draggedInfo.draggedNodeId + "']");
        if (draggedNode) {
          const closestNode = draggedNode.closest("li");
          if (closestNode) {
            const dropTargetNodeKind: NodeType = node.current.getAttribute("data-kind") as NodeType;
            const currentNode = closestNode.querySelector("[id='" + node.current.id + "']");
            setAllowedDrop(!currentNode && permissible(draggedInfo.draggedNodeKind, dropTargetNodeKind));
          }
        }
      } else {
        setAllowedDrop(false);
      }
    });

    const subs2 = getSelectedNodeInfo().subscribe((selectedNodeInfo) => {
      if (selectedNodeInfo) {
        if (multipleSelect) {
          if (selectedNodeInfo.selectedNodeId === datasource.id) {
            setSelected(true);
          }
        } else {
          const isSelected = selectedNodeInfo.selectedNodeId === datasource.id;
          setSelected(isSelected);
          if (isSelected && expandParent) {
            expandParent();
          }
        }
      } else {
        setSelected(false);
      }
    });

    return () => {
      subs1.unsubscribe();
      subs2.unsubscribe();
    };
  }, [multipleSelect, datasource]);

  const addArrows = () => {
    setBottomEdgeExpanded(!isChildrenCollapsed);
  };

  const removeArrows = () => {
    setBottomEdgeExpanded(undefined);
  };

  const bottomEdgeClickHandler = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setIsChildrenCollapsed(!isChildrenCollapsed);
    setBottomEdgeExpanded(!bottomEdgeExpanded);
  };

  const handleExpandAll = () => {
    setIsChildrenCollapsed(!isChildrenCollapsed);
    setBottomEdgeExpanded(!bottomEdgeExpanded);
    setExpandAll(!expandAll);
  };

  const ensureVisible = () => {
    setIsChildrenCollapsed(false);
    setBottomEdgeExpanded(true);
    expandParent && expandParent();
  };

  const filterAllowedDropNodes = (id: string, draggedNodeKind: NodeType) => {
    sendDragInfo(id, draggedNodeKind);
  };

  const clickNodeHandler = () => {
    if (onClickNode) {
      onClickNode({ key: dsKey, value: datasource });
    }

    sendSelectedNodeInfo(datasource.id);
  };

  const dragstartHandler = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode || isClone) {
      return;
    }
    const copyDS = { ...datasource };
    delete copyDS.relationship;
    copyDS.dsKey = dsKey;
    event.dataTransfer.setData("text/plain", JSON.stringify(copyDS));
    // highlight all potential drop targets
    if (node && node.current) {
      const draggedNodeKind: NodeType = node.current.getAttribute("data-kind") as NodeType;
      filterAllowedDropNodes(node.current.id, draggedNodeKind);
    }
  };

  const dragoverHandler = (event: React.DragEvent<HTMLDivElement>) => {
    // prevent default to allow drop
    event.preventDefault();
  };

  const dragendHandler = () => {
    if (isEditMode) {
      // reset background of all potential drop targets
      clearDragInfo();
    }
  };

  const dropHandler = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode || !event.currentTarget.classList.contains("allowedDrop") || isClone) {
      return;
    }
    clearDragInfo();
    const data: FundingLineOrCalculation = JSON.parse(event.dataTransfer.getData("text/plain"));
    const targetDsKey = data.dsKey;
    if (!targetDsKey) {
      return;
    }
    if (event.ctrlKey) {
      cloneNode &&
        cloneNode(
          JSON.parse(event.dataTransfer.getData("text/plain")),
          targetDsKey,
          event.currentTarget.id,
          dsKey
        );
    } else {
      changeHierarchy &&
        changeHierarchy(
          JSON.parse(event.dataTransfer.getData("text/plain")),
          targetDsKey,
          event.currentTarget.id,
          dsKey
        );
    }
  };

  return (
    <li className="oc-hierarchy">
      <div
        ref={node}
        id={datasource.id}
        data-kind={datasource.kind}
        className={nodeClass}
        draggable={draggable && !isClone}
        onDragStart={(e) => dragstartHandler(e as React.DragEvent<HTMLDivElement>)}
        onDragOver={(e) => dragoverHandler(e as React.DragEvent<HTMLDivElement>)}
        onDragEnd={() => dragendHandler()}
        onDrop={(e) => dropHandler(e as React.DragEvent<HTMLDivElement>)}
        onMouseEnter={addArrows}
        onMouseLeave={removeArrows}
      >
        <NodeTemplate
          nodeData={datasource}
          addNode={addNode}
          isEditMode={isEditMode}
          openSideBar={openSideBar}
          onClickNode={clickNodeHandler}
          dsKey={dsKey}
          nextId={nextId}
        />
        {collapsible && datasource.relationship && datasource.relationship.charAt(2) === "1" && (
          <>
            <i
              className={`oc-edge verticalEdge bottomEdge oci ${
                bottomEdgeExpanded === undefined
                  ? ""
                  : bottomEdgeExpanded
                  ? "oci-chevron-up"
                  : "oci-chevron-down"
              }`}
              onClick={bottomEdgeClickHandler}
            />
            <div className="oci-expand-container">
              <span className="govuk-body oci-expand" onClick={handleExpandAll}>{`${
                bottomEdgeExpanded ? "Collapse" : "Expand"
              } all`}</span>
            </div>
          </>
        )}
      </div>
      {datasource.children && datasource.children.length > 0 && (
        <ul className={isChildrenCollapsed ? "hidden" : ""}>
          {datasource.children.map((node: FundingLineOrCalculation) => (
            <OrganisationChartNode
              datasource={node}
              NodeTemplate={NodeTemplate}
              id={node.id}
              key={node.id}
              draggable={draggable}
              collapsible={collapsible}
              multipleSelect={multipleSelect}
              changeHierarchy={changeHierarchy}
              cloneNode={cloneNode}
              isEditMode={isEditMode}
              onClickNode={onClickNode}
              addNode={addNode}
              openSideBar={openSideBar}
              nextId={nextId}
              dsKey={dsKey}
              addNodeToRefs={addNodeToRefs}
              expandAllChildren={expandAll}
              hasCloneParent={isClone}
              expandParent={ensureVisible}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

OrganisationChartNode.defaultProps = defaultProps;

export default OrganisationChartNode;
