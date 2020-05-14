import React from "react";
import { FundingLineItem } from "./fundingLineStructure/FundingLineItem";
import { CalculationItem } from "./CalculationItem";
import { Calculation, NodeType, FundingLine, FundingLineUpdateModel, CalculationUpdateModel, FundingLineOrCalculationSelectedItem } from '../types/TemplateBuilderDefinitions';

export interface SidebarContentProps {
    data: Set<FundingLineOrCalculationSelectedItem>,
    updateNode: (p: FundingLineUpdateModel | CalculationUpdateModel) => void,
    openSideBar: (open: boolean) => void,
    deleteNode: (id: string) => Promise<void>,
}

export function SidebarContent({ data, updateNode, openSideBar, deleteNode }: SidebarContentProps) {
    const dataArray = Array.from(data);
    return (
        <div className="sidebar-content">
            {dataArray.map((d: FundingLineOrCalculationSelectedItem) => {
                if (d.value.kind === NodeType.FundingLine) {
                    const node = d.value as FundingLine;
                    return (
                        <FundingLineItem
                            key={node.id}
                            node={node}
                            updateNode={updateNode}
                            openSideBar={openSideBar}
                            deleteNode={deleteNode}
                        />
                    )
                }

                const node = d.value as Calculation;
                return (
                    <CalculationItem
                        key={node.id}
                        node={node}
                        updateNode={updateNode}
                        openSideBar={openSideBar}
                        deleteNode={deleteNode}
                    />
                )
            })}
        </div>
    );
}