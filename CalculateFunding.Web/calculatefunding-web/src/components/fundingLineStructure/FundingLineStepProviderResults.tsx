import * as React from "react";
import {
    FundingStructureType, FundingStructureItem
} from "../../types/FundingStructureItem";
import {CollapsibleSteps} from "../CollapsibleSteps";
export function FundingLineStepProviderResults(props: { fundingStructureItem: FundingStructureItem, expanded: boolean, callback: any}) {
    const fundingStructureItems = props.fundingStructureItem.fundingStructureItems;
    const expanded = props.expanded;
    let fundingType = "";
    function collapsibleStepsChanged(expanded: boolean, name: string) {
        props.callback(expanded, name);
    }
    return <div>
        {
            (fundingStructureItems != null && fundingStructureItems.length > 0)? fundingStructureItems.map((innerFundingLineItem, index) => {
                    let displayFundingType = false;
                    if (fundingType !== FundingStructureType[innerFundingLineItem.type])
                    {
                        displayFundingType = true;
                        fundingType = FundingStructureType[innerFundingLineItem.type];
                    }
                    let linkValue = "";
                    if (innerFundingLineItem.calculationId != null && innerFundingLineItem.calculationId !== '') {
                        linkValue = encodeURI(`/viewcalculationresults/${innerFundingLineItem.calculationId}`);
                    }
                    return (
                        <CollapsibleSteps
                            customRef={innerFundingLineItem.customRef}
                            key={index}
                            uniqueKey={index.toString()}
                            title={displayFundingType?fundingType: ""}
                            calculationType={innerFundingLineItem.calculationType != null ? innerFundingLineItem.calculationType : ""}
                            value={innerFundingLineItem.value != null? innerFundingLineItem.value : ""}
                            description={innerFundingLineItem.name}
                            status={innerFundingLineItem.calculationPublishStatus}
                            step={displayFundingType?innerFundingLineItem.level.toString(): ""}
                            expanded={expanded || innerFundingLineItem.expanded === true}
                            link={linkValue}
                            hasChildren={innerFundingLineItem.fundingStructureItems != null && innerFundingLineItem.fundingStructureItems.length > 0}
                            callback={collapsibleStepsChanged}>
                            {
                                innerFundingLineItem.fundingStructureItems ?
                                    (<FundingLineStepProviderResults fundingStructureItem={innerFundingLineItem}
                                                                     expanded={expanded}
                                                                     callback={collapsibleStepsChanged} />)
                                    : null
                            }
                        </CollapsibleSteps>
                    )
                }
                )
                : null
        }
    </div>
}