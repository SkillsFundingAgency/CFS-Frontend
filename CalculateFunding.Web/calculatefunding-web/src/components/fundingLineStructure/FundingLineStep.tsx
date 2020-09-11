import * as React from "react";
import {
    FundingStructureType, IFundingStructureItem
} from "../../types/FundingStructureItem";
import {CollapsibleSteps} from "../CollapsibleSteps";
export function FundingLineStep(props: { fundingStructureItem: IFundingStructureItem, expanded: boolean, results:boolean}) {
    const fundingStructureItems = props.fundingStructureItem.fundingStructureItems;
    const expanded = props.expanded;
    let fundingType: string = "";
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
                        linkValue = props.results ?
                        encodeURI(`/ViewCalculationResults/${innerFundingLineItem.calculationId}/${parentFundingLineName}`) :
                            encodeURI(`/Specifications/EditTemplateCalculation/${innerFundingLineItem.calculationId}/${parentFundingLineName}`) ;
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
                            lastUpdatedDate={innerFundingLineItem.lastUpdatedDate}>
                            {
                                innerFundingLineItem.fundingStructureItems ?
                                    (<FundingLineStep fundingStructureItem={innerFundingLineItem} expanded={expanded} results={props.results} />)
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