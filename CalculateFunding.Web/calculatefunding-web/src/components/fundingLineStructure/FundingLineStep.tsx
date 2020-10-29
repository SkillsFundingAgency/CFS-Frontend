import * as React from "react";
import {
    FundingStructureType, IFundingStructureItem
} from "../../types/FundingStructureItem";
import {CollapsibleSteps} from "../CollapsibleSteps";

export function FundingLineStep(props: { fundingStructureItem: IFundingStructureItem, expanded: boolean, showResults: boolean, callback: any}) {
    const fundingStructureItems = props.fundingStructureItem.fundingStructureItems;
    const expanded = props.expanded;
    let fundingType: string = "";
    function collapsibleStepsChanged(expanded: boolean, name: string) {
        props.callback(expanded, name);
    }
    const parentFundingLineName :string = fundingStructureItems && fundingStructureItems.length > 0 ? fundingStructureItems[0].name : "";
    return <div>
        {
            (fundingStructureItems && fundingStructureItems.length > 0) ? fundingStructureItems.map((innerFundingLineItem, index) => {
                    let displayFundingType = false;
                    if (fundingType !== FundingStructureType[innerFundingLineItem.type])
                    {
                        displayFundingType = true;
                        fundingType = FundingStructureType[innerFundingLineItem.type];
                    }
                    let linkValue = "";
                    if (innerFundingLineItem.calculationId != null && innerFundingLineItem.calculationId !== '') {
                        linkValue = props.showResults ?
                            `/ViewCalculationResults/${innerFundingLineItem.calculationId}` :
                            `/Specifications/EditCalculation/${innerFundingLineItem.calculationId}`;
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
                            status={(innerFundingLineItem.calculationPublishStatus != null && innerFundingLineItem.calculationPublishStatus !== '') ?
                                innerFundingLineItem.calculationPublishStatus: ""}
                            step={displayFundingType?innerFundingLineItem.level.toString(): ""}
                            expanded={expanded || innerFundingLineItem.expanded}
                            link={linkValue}
                            hasChildren={innerFundingLineItem.fundingStructureItems != null && innerFundingLineItem.fundingStructureItems.length > 0}
                            lastUpdatedDate={innerFundingLineItem.lastUpdatedDate}
                            callback={collapsibleStepsChanged}>
                            {
                                innerFundingLineItem.fundingStructureItems ?
                                    (<FundingLineStep fundingStructureItem={innerFundingLineItem}
                                                      expanded={expanded}
                                                      showResults={props.showResults}
                                                      callback={collapsibleStepsChanged}/>)
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