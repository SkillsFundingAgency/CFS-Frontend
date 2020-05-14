import * as React from "react";
import {
    FundingStructureType, IFundingStructureItem
} from "../../types/FundingStructureItem";
import {CollapsibleSteps} from "../CollapsibleSteps";
export function FundingLineStep(props: { fundingStructureItem: IFundingStructureItem, expanded: boolean}) {
    const fundingStructureItems = props.fundingStructureItem.fundingStructureItems;
    const expanded = props.expanded;
    let fundingType: string = "";
    const parentFundingLineName :string = fundingStructureItems.length > 0 ? fundingStructureItems[0].name : "";
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
                        linkValue = `/Specifications/EditTemplateCalculation/${innerFundingLineItem.calculationId}/${parentFundingLineName}`;
                    }
                    return (
                        <CollapsibleSteps
                            key={index}
                            uniqueKey={index.toString()}
                            title={displayFundingType?fundingType: ""}
                            description={innerFundingLineItem.name}
                            status={(innerFundingLineItem.calculationPublishStatus != null && innerFundingLineItem.calculationPublishStatus !== '') ?
                                innerFundingLineItem.calculationPublishStatus: ""}
                            step={displayFundingType?innerFundingLineItem.level.toString(): ""}
                            expanded={expanded || innerFundingLineItem.expanded}
                            link={linkValue}
                            hasChildren={innerFundingLineItem.fundingStructureItems != null && innerFundingLineItem.fundingStructureItems.length > 0}>
                            {
                                innerFundingLineItem.fundingStructureItems ?
                                    (<FundingLineStep fundingStructureItem={innerFundingLineItem} expanded={expanded} />)
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