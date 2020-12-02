import * as React from "react";
import {FundingStructureType, FundingStructureItem} from "../../types/FundingStructureItem";
import {CollapsibleSteps} from "../CollapsibleSteps";
import {PublishedProviderError} from "../../types/PublishedProviderError";

export interface FundingLineStepProps {
    key: string,
    showResults: boolean,
    expanded: boolean,
    fundingStructureItem: FundingStructureItem,
    fundingLineErrors?: PublishedProviderError[] | undefined,
    callback: any
}

export function FundingLineStep(props: FundingLineStepProps) {
    const fundingStructureItems = props.fundingStructureItem.fundingStructureItems;
    const expanded = props.expanded;

    function collapsibleStepsChanged(expanded: boolean, name: string) {
        props.callback(expanded, name);
    }

    if (!fundingStructureItems || fundingStructureItems.length === 0) return null;

    return <div>
        {
            fundingStructureItems.map((item, index) => {
                let linkValue = "";
                if (item.type === FundingStructureType.Calculation) {
                    linkValue = props.showResults ?
                        `/ViewCalculationResults/${item.calculationId}` :
                        `/Specifications/EditCalculation/${item.calculationId}`;
                }
                return (
                    <CollapsibleSteps
                        customRef={item.customRef}
                        key={index}
                        uniqueKey={index.toString()}
                        title={item.type === FundingStructureType.FundingLine ? "Funding Line" : item.type}
                        calculationType={item.calculationType != null ? item.calculationType : ""}
                        value={item.value != null ? item.value : ""}
                        description={item.name}
                        status={item.calculationPublishStatus}
                        step={item.level.toString()}
                        expanded={expanded || item.expanded === true}
                        link={linkValue}
                        hasChildren={item.fundingStructureItems != null && item.fundingStructureItems.length > 0}
                        lastUpdatedDate={item.lastUpdatedDate}
                        callback={collapsibleStepsChanged}>
                        {
                            item.fundingStructureItems &&
                                <FundingLineStep
                                    key={item.name.replace(" ", "") + index}
                                    fundingStructureItem={item}
                                    expanded={expanded}
                                    showResults={props.showResults}
                                    fundingLineErrors={props.fundingLineErrors}
                                    callback={collapsibleStepsChanged}/>
                        }
                    </CollapsibleSteps>
                )
            })
        }
    </div>
}