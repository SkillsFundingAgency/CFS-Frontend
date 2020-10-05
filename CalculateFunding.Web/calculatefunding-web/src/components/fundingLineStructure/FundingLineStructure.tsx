import {
    FundingStructureType, IFundingStructureItem
} from "../../types/FundingStructureItem";
import React, {MutableRefObject, useRef} from "react";

export function getDistinctOrderedFundingLineCalculations(fundingLinesToFilter: IFundingStructureItem[])
{
    let calculationNames: string[] = [];
    fundingLinesToFilter.map(function searchFundingLines(fundingStructureItem: IFundingStructureItem) : any {
        if (fundingStructureItem.type === FundingStructureType.Calculation)
        {
            calculationNames.push(fundingStructureItem.name);
        }
        if (fundingStructureItem.fundingStructureItems) {
            fundingStructureItem.fundingStructureItems.map(searchFundingLines);
        }
    });

    return [...new Set(calculationNames.sort((a, b) => a.localeCompare(b)))]
}

export function expandCalculationsByName(fundingLinesToFilter: IFundingStructureItem[], keyword: string, customRef: React.MutableRefObject<null>, nullRef: React.MutableRefObject<null>)
{
    fundingLinesToFilter.map(
        function searchFundingLines(fundingStructureItem: IFundingStructureItem) {

            fundingStructureItem.customRef = nullRef;
            fundingStructureItem.expanded = false;

            if (fundingStructureItem.fundingStructureItems) {
                fundingStructureItem.fundingStructureItems.map(searchFundingLines);
            }
        });

    let isRefAlreadyAssigned = false;
    fundingLinesToFilter.map(
        function searchFundingLines(fundingStructureItem: IFundingStructureItem) {
            if (fundingStructureItem.name.toLowerCase() === keyword.toLowerCase()
                && fundingStructureItem.type === FundingStructureType.Calculation) {
                fundingStructureItem.expanded = true;
                if (!isRefAlreadyAssigned)
                {
                    fundingStructureItem.customRef = customRef;
                    isRefAlreadyAssigned = true;
                }
            }
            if (fundingStructureItem.fundingStructureItems) {
                fundingStructureItem.fundingStructureItems.map(searchFundingLines);
                if (fundingStructureItem.fundingStructureItems.find(item => item.expanded)) {
                    fundingStructureItem.expanded = true;
                }
            }
        }
    );
}

export function setExpandStatusByFundingLineName(fundingLines: IFundingStructureItem[], expanded: boolean, name: string)
{
    const fundingLinesCopy: IFundingStructureItem[] = fundingLines as IFundingStructureItem[];
    fundingLinesCopy.map(
        function searchFundingLines(fundingStructureItem: IFundingStructureItem) {
            if (fundingStructureItem.name === name) {
                fundingStructureItem.expanded = expanded;
            }
            if (fundingStructureItem.fundingStructureItems) {
                fundingStructureItem.fundingStructureItems.map(searchFundingLines);
            }
        });
    return fundingLinesCopy;
}

export function checkIfShouldOpenAllSteps(fundingStructureItems: IFundingStructureItem[]) {
    let openAllSteps: boolean = true;
    fundingStructureItems.map(
        function searchFundingLines(fundingStructureItem: IFundingStructureItem) {
            if (!fundingStructureItem.expanded && fundingStructureItem.fundingStructureItems != null) {
                openAllSteps = false;
                return;
            }
            if (fundingStructureItem.fundingStructureItems) {
                fundingStructureItem.fundingStructureItems.map(searchFundingLines);
            }
        }
    );

    return openAllSteps;
}

export function setInitialExpandedStatus(fundingStructureItems: IFundingStructureItem[], expanded: boolean) {
    fundingStructureItems.map(
        function searchFundingLines(fundingStructureItem: IFundingStructureItem) {
            fundingStructureItem.expanded = expanded;
            if (fundingStructureItem.fundingStructureItems) {
                fundingStructureItem.fundingStructureItems.map(searchFundingLines);
            }
        }
    );
}

export function updateFundingLineExpandStatus(fundingStructureItems: IFundingStructureItem[], expandedStatus: boolean)
{
    fundingStructureItems.map(
        function searchFundingLines(fundingStructureItem: IFundingStructureItem) {
            fundingStructureItem.expanded = expandedStatus;
            if (fundingStructureItem.fundingStructureItems) {
                fundingStructureItem.fundingStructureItems.map(searchFundingLines);
            }
        }
    );
}
