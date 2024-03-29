import { FundingStructureItemViewModel, FundingStructureType } from "../../types/FundingStructureItem";

export function getDistinctOrderedFundingLineCalculations(
  fundingLinesToFilter: FundingStructureItemViewModel[]
) {
  const calculationNames: string[] = [];
  fundingLinesToFilter.map(function searchFundingLines(
    fundingStructureItem: FundingStructureItemViewModel
  ): any {
    if (fundingStructureItem.type === FundingStructureType.Calculation) {
      calculationNames.push(fundingStructureItem.name);
    }
    if (fundingStructureItem.fundingStructureItems) {
      fundingStructureItem.fundingStructureItems.map(searchFundingLines);
    }
  });

  return new Set(calculationNames.sort((a, b) => a.localeCompare(b)));
}

export function expandCalculationsByName(
  fundingLinesToFilter: FundingStructureItemViewModel[],
  keyword: string,
  customRef: React.MutableRefObject<null>,
  nullRef: React.MutableRefObject<null>
) {
  fundingLinesToFilter.map(function searchFundingLines(fundingStructureItem: FundingStructureItemViewModel) {
    fundingStructureItem.customRef = nullRef;
    fundingStructureItem.expanded = false;

    if (fundingStructureItem.fundingStructureItems) {
      fundingStructureItem.fundingStructureItems.map(searchFundingLines);
    }
  });

  let isRefAlreadyAssigned = false;
  fundingLinesToFilter.map(function searchFundingLines(fundingStructureItem: FundingStructureItemViewModel) {
    if (
      fundingStructureItem.name.toLowerCase() === keyword.toLowerCase() &&
      fundingStructureItem.type === FundingStructureType.Calculation
    ) {
      fundingStructureItem.expanded = true;
      if (!isRefAlreadyAssigned) {
        fundingStructureItem.customRef = customRef;
        isRefAlreadyAssigned = true;
      }
    }
    if (fundingStructureItem.fundingStructureItems) {
      fundingStructureItem.fundingStructureItems.map(searchFundingLines);
      if (fundingStructureItem.fundingStructureItems.find((item) => item.expanded)) {
        fundingStructureItem.expanded = true;
      }
    }
  });
}

export function setExpandStatusByFundingLineName(
  fundingLines: FundingStructureItemViewModel[],
  expanded: boolean,
  name: string
) {
  const fundingLinesCopy: FundingStructureItemViewModel[] = fundingLines as FundingStructureItemViewModel[];
  fundingLinesCopy.map(function searchFundingLines(fundingStructureItem: FundingStructureItemViewModel) {
    if (fundingStructureItem.name === name) {
      fundingStructureItem.expanded = expanded;
    }
    if (fundingStructureItem.fundingStructureItems) {
      fundingStructureItem.fundingStructureItems.map(searchFundingLines);
    }
  });
  return fundingLinesCopy;
}

export function checkIfShouldOpenAllSteps(fundingStructureItems: FundingStructureItemViewModel[]) {
  let openAllSteps = true;
  fundingStructureItems.map(function searchFundingLines(fundingStructureItem: FundingStructureItemViewModel) {
    if (!fundingStructureItem.expanded && fundingStructureItem.fundingStructureItems != null) {
      openAllSteps = false;
      return;
    }
    if (fundingStructureItem.fundingStructureItems) {
      fundingStructureItem.fundingStructureItems.map(searchFundingLines);
    }
  });

  return openAllSteps;
}

export function setInitialExpandedStatus(
  fundingStructureItems: FundingStructureItemViewModel[],
  expanded: boolean
) {
  fundingStructureItems.map(function searchFundingLines(fundingStructureItem: FundingStructureItemViewModel) {
    fundingStructureItem.expanded = expanded;
    if (fundingStructureItem.fundingStructureItems) {
      fundingStructureItem.fundingStructureItems.map(searchFundingLines);
    }
  });
}

export function updateFundingLineExpandStatus(
  fundingStructureItems: FundingStructureItemViewModel[],
  expandedStatus: boolean
) {
  fundingStructureItems.map(function searchFundingLines(fundingStructureItem: FundingStructureItemViewModel) {
    fundingStructureItem.expanded = expandedStatus;
    if (fundingStructureItem.fundingStructureItems) {
      fundingStructureItem.fundingStructureItems.map(searchFundingLines);
    }
  });
}
