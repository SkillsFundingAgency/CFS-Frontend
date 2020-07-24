import React from "react";
import { FundingLineItem } from "./FundingLineItem";
import { CalculationItem } from "./CalculationItem";
import { Calculation, NodeType, FundingLine, FundingLineUpdateModel, CalculationUpdateModel, FundingLineOrCalculationSelectedItem, CalculationDictionaryItem } from '../types/TemplateBuilderDefinitions';

export interface SidebarContentProps {
    data: Set<FundingLineOrCalculationSelectedItem>,
    calcs: CalculationDictionaryItem[],
    updateNode: (p: FundingLineUpdateModel | CalculationUpdateModel) => void,
    openSideBar: (open: boolean) => void,
    deleteNode: (id: string) => Promise<void>,
    cloneCalculation: (targetCalculationId: string, sourceCalculationId: string) => void,
    checkIfTemplateCalculationIdInUse: (id: number) => boolean,
    checkIfTemplateLineIdInUse: (id: number) => boolean,
}

export function SidebarContent({
    data,
    calcs,
    updateNode,
    openSideBar,
    deleteNode,
    cloneCalculation,
    checkIfTemplateCalculationIdInUse,
    checkIfTemplateLineIdInUse
}: SidebarContentProps) {
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
                            checkIfTemplateLineIdInUse={checkIfTemplateLineIdInUse}
                        />
                    )
                }

                const node = d.value as Calculation;
                return (
                    <CalculationItem
                        key={node.id}
                        node={node}
                        calcs={calcs}
                        cloneCalculation={cloneCalculation}
                        updateNode={updateNode}
                        openSideBar={openSideBar}
                        deleteNode={deleteNode}
                        checkIfTemplateCalculationIdInUse={checkIfTemplateCalculationIdInUse}
                    />
                )
            })}
        </div>
    );
}