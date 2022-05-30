import React, { useState } from "react";

import { FacetValue } from "../types/Facet";
import { SpecificationListResults } from "../types/Specifications/SpecificationListResults";
import { SpecificationSearchRequestViewModel } from "../types/SpecificationSearchRequestViewModel";

export interface SpecificationSearchStatus {

  searchCriteria: SpecificationSearchRequestViewModel;
  fundingPeriodFacets: FacetValue[];
  fundingStreamFacets: FacetValue[];
  statusFacets: FacetValue[];
}

export const SpecificationSearchContext = React.createContext<SpecificationSearchStatus | undefined>(undefined);

export const SpecificationSearchContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const providerResult = useSpecificationSearchProvider();
  return <SpecificationSearchContext.Provider value={providerResult}>{children}</SpecificationSearchContext.Provider>;
};

export const useSpecificationSearchProvider = () => {

  const [specificationListResults, setSpecificationListResults] = useState<SpecificationListResults>({
    items: [],
    facets: [],
    endItemNumber: 0,
    startItemNumber: 0,
    totalCount: 0,
    pagerState: {
      lastPage: 0,
      currentPage: 0,
      pages: [],
      displayNumberOfPages: 0,
      nextPage: 0,
      previousPage: 0,
    },
  });
  const initialSearch: SpecificationSearchRequestViewModel = {
    searchText: "",
    fundingPeriods: [],
    fundingStreams: [],
    status: [],
    pageSize: 50,
    page: 1,
  };
  const [searchCriteria, setSearchCriteria] = React.useState<SpecificationSearchRequestViewModel>(initialSearch);
  const [fundingPeriodFacets, setFundingPeriodFacets] = useState<FacetValue[]>([]);
  const [fundingStreamFacets, setFundingStreamFacets] = useState<FacetValue[]>([]);
  const [statusFacets, setStatusFacets] = useState<FacetValue[]>([]);
  const [initialFundingPeriods, setInitialFundingPeriods] = useState<FacetValue[]>([]);
  const [initialFundingStreams, setInitialFundingStreams] = useState<FacetValue[]>([]);
  const [initialStatuses, setInitialStatuses] = useState<FacetValue[]>([]);
  
  return { searchCriteria, fundingStreamFacets, fundingPeriodFacets, statusFacets };
};


export const useSpecificationSearchContext = () => {
  const context = React.useContext(SpecificationSearchContext);
  if (context === undefined) {
    throw new Error("useSpecificationSearchContext must be used within an SpecificationSearchContext Provider");
  }

  return { ...context };
};
