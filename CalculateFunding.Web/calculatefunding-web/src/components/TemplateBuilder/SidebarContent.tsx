import React from "react";
import {FundingLineItem} from "./FundingLineItem";
import {CalculationItem} from "./CalculationItem";
import {
    Calculation,
    NodeType,
    FundingLine,
    FundingLineUpdateModel,
    CalculationUpdateModel,
    FundingLineOrCalculationSelectedItem,
    CalculationDictionaryItem
} from '../../types/TemplateBuilderDefinitions';

export interface SidebarContentProps {
    data: Set<FundingLineOrCalculationSelectedItem>,
    isEditMode: boolean,
    calcs: CalculationDictionaryItem[],
    updateNode: (p: FundingLineUpdateModel | CalculationUpdateModel) => void,
    openSideBar: (open: boolean) => void,
    deleteNode: (id: string) => Promise<void>,
    cloneCalculation: (targetCalculationId: string, sourceCalculationId: string) => void,
    checkIfCalculationIdInUse: (id: number) => boolean,
    checkIfTemplateLineIdInUse: (id: number) => boolean,
    checkIfCalculationNameInUse: (name: string) => boolean,
    checkFundingLineNameInUse: (name: string) => boolean,
    refreshNextId: () => void,
}

export function SidebarContent(
    {
        data,
        isEditMode,
        calcs,
        updateNode,
        openSideBar,
        deleteNode,
        cloneCalculation,
        checkIfTemplateLineIdInUse,
        checkFundingLineNameInUse,
        refreshNextId,
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
                            isEditMode={isEditMode}
                            updateNode={updateNode}
                            openSideBar={openSideBar}
                            deleteNode={deleteNode}
                            isTemplateLineIdInUse={checkIfTemplateLineIdInUse}
                            isFundingLineNameInUse={checkFundingLineNameInUse}
                            refreshNextId={refreshNextId}
                        />
                    )
                }

                const node = d.value as Calculation;
                return (
                    <CalculationItem
                        key={node.id}
                        node={node}
                        calcs={calcs}
                        isEditMode={isEditMode}
                        cloneCalculation={cloneCalculation}
                        updateNode={updateNode}
                        openSideBar={openSideBar}
                        deleteNode={deleteNode}
                        refreshNextId={refreshNextId}
                    />
                )
            })}
        </div>
    );
}