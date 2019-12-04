import {IFundingStructureItem} from "../types/FundingStructureItem";
import {Specification} from "../types/viewFundingTypes";

export interface IFundingLineStructureState {
    specificationResult: Specification,
    fundingLineStructureResult: IFundingStructureItem[],
    fundingLineStatusResult: string
}