import {CalculationSummary} from "../types/CalculationSummary";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {DatasetSummary} from "../types/DatasetSummary";
import {ReleaseTimetableViewModel} from "../types/ReleaseTimetableSummary";

export interface ViewSpecificationState {
    specification: SpecificationSummary,
    additionalCalculations: CalculationSummary,
    datasets: DatasetSummary,
    releaseTimetable: ReleaseTimetableViewModel
}