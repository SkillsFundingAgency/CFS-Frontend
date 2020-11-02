import {CalculationSearchResponse} from "../types/CalculationSearchResponse";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {DatasetSummary} from "../types/DatasetSummary";
import {ReleaseTimetableViewModel} from "../types/ReleaseTimetableSummary";
import {IFundingStructureItem} from "../types/FundingStructureItem";
import {ProfileVariationPointer} from "../types/Specifications/ProfileVariationPointer";

export interface ViewSpecificationState {
    specification: SpecificationSummary,
    additionalCalculations: CalculationSearchResponse,
    datasets: DatasetSummary,
    releaseTimetable: ReleaseTimetableViewModel,
    fundingLineStructureResult: IFundingStructureItem[],
    fundingLineStatusResult: string,
    profileVariationPointerResult: ProfileVariationPointer[]
}