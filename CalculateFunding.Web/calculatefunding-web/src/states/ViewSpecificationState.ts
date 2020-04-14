import {CalculationSummary} from "../types/CalculationSummary";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {DatasetSummary} from "../types/DatasetSummary";
import {ReleaseTimetableViewModel} from "../types/ReleaseTimetableSummary";
import {IFundingStructureItem} from "../types/FundingStructureItem";
import {ProfileVariationPointer} from "../types/Specifications/ProfileVariationPointer";

export interface ViewSpecificationState {
    specification: SpecificationSummary,
    additionalCalculations: CalculationSummary,
    datasets: DatasetSummary,
    releaseTimetable: ReleaseTimetableViewModel,
    fundingLineStructureResult: IFundingStructureItem[],
    fundingLineStatusResult: string,
    profileVariationPointerResult: ProfileVariationPointer[]
}