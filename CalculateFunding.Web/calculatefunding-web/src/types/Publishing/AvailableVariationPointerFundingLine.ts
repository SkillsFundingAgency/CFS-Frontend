    export interface Period {
        periodType: string;
        period: string;
        year: number;
        occurrence: number;
    }

    export interface SelectedPeriod {
        periodType: string;
        period: string;
        year: number;
        occurrence: number;
    }

    export interface AvailableVariationPointerFundingLine {
        fundingLineCode: string;
        fundingLineName: string;
        periods: Period[];
        selectedPeriod: SelectedPeriod;
    }
