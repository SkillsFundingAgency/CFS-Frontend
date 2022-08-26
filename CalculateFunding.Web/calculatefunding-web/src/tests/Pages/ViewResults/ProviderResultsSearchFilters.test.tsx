import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router";
import { SearchMode } from "types/SearchMode";

import { ProviderResultsSearchFilters } from "../../../components/Providers/ProviderResultsSearchFilters";
import { FacetValue } from "../../../types/Facet";
import { ProviderVersionSearchModel } from "types/Provider/ProviderVersionSearchResults";


describe("<ProviderResultsSearchFilters />", () => {
    
  describe("when initially loading with defaults", () => {
    it("renders default view", () => {    
      const result = render(
        <MemoryRouter>        
          <ProviderResultsSearchFilters
            searchCriteria={searchCriteria}
            initialSearch={searchCriteria}
            filterBySearchTerm={jest.fn()}
            addProviderTypeFilter = {jest.fn()}
            removeProviderTypeFilter = {jest.fn()}
            addProviderSubTypeFilter = {jest.fn()}
            removeProviderSubTypeFilter = {jest.fn()}
            addLocalAuthorityFilter = {jest.fn()}
            removeLocalAuthorityFilter = {jest.fn()}
            filterByProviderType = {jest.fn()}
            filterByProviderSubType = {jest.fn()}
            filterByLocalauthority = {jest.fn()}
            providerTypeFacets = {[]}
            providerSubTypeFacets = {[]}
            localAuthorityFacets = {[]}
            clearFilters = {jest.fn()}
          />
        </MemoryRouter>
      );

      expect(result.container.querySelector(".search-filters")).toBeInTheDocument();
      expect(result.container.querySelector("#search-options-providers")).toBeInTheDocument();
      expect(result.container.querySelector("#search-options-UKPRN")).toBeInTheDocument();
      expect(result.container.querySelector("#search-options-UPIN")).toBeInTheDocument();
      expect(result.container.querySelector("#search-options-URN")).toBeInTheDocument();
      expect(result.getByRole("heading", { name: /Selected filters/ })).toBeVisible();
      expect(within(result.getByRole("heading", { name: /Selected filters/ }).parentElement as HTMLElement)
        .getByText(/No filters selected/))
        .toBeVisible();
      expect(result.queryByText(/Hide/)).not.toBeInTheDocument();
    });
  }); 

 
  describe("when 'show all sections' is clicked on", () => {
    it("expands all sections to reveal filter options", () => {

      const result = render(
        <MemoryRouter>
            <ProviderResultsSearchFilters
                searchCriteria={searchCriteria}
                initialSearch={searchCriteria}
                filterBySearchTerm={jest.fn()}
                addProviderTypeFilter = {jest.fn()}
                removeProviderTypeFilter = {jest.fn()}
                addProviderSubTypeFilter = {jest.fn()}
                removeProviderSubTypeFilter = {jest.fn()}
                addLocalAuthorityFilter = {jest.fn()}
                removeLocalAuthorityFilter = {jest.fn()}
                filterByProviderType = {jest.fn()}
                filterByProviderSubType = {jest.fn()}
                filterByLocalauthority = {jest.fn()}
                providerTypeFacets = {[]}
                providerSubTypeFacets = {[]}
                localAuthorityFacets = {[]}
                clearFilters = {jest.fn()}
            />
        </MemoryRouter>
      );

      const showHideAll = result.getByText(/Show all sections/ );
      expect(showHideAll).toBeInTheDocument();
      expect(result.queryByText(/Hide/)).not.toBeInTheDocument();
      expect(result.getAllByText(/Show/)).toHaveLength(4);

      userEvent.click(showHideAll);

      expect(result.getByText(/Hide all sections/)).toBeVisible();
      expect(result.queryByText(/Show/)).not.toBeInTheDocument();
      expect(result.getAllByText(/Hide/)).toHaveLength(4);
    });
  });
 

  describe("when a local authority filter section 'show this section' is clicked on", () => {
    it("expands section to reveal filter options", () => {
      const localAuthorities: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const result = render(
        <MemoryRouter>
            <ProviderResultsSearchFilters
                searchCriteria={{...searchCriteria}}
                initialSearch={searchCriteria}
                filterBySearchTerm={jest.fn()}
                addProviderTypeFilter = {jest.fn()}
                removeProviderTypeFilter = {jest.fn()}
                addProviderSubTypeFilter = {jest.fn()}
                removeProviderSubTypeFilter = {jest.fn()}
                addLocalAuthorityFilter = {jest.fn()}
                removeLocalAuthorityFilter = {jest.fn()}
                filterByProviderType = {jest.fn()}
                filterByProviderSubType = {jest.fn()}
                filterByLocalauthority = {jest.fn()}
                providerTypeFacets = {[]}
                providerSubTypeFacets = {[]}
                localAuthorityFacets = {localAuthorities}
                clearFilters = {jest.fn()}
            />
        </MemoryRouter>
      );

      const localAuthoritySection = result.getByTestId("local-authority-filters");
      const showLocalAuthorityLabel = within(localAuthoritySection).getByText(/Local authority/);
      expect(showLocalAuthorityLabel).toBeInTheDocument();
      expect(result.queryByText(/Hide/)).not.toBeInTheDocument();
      expect(result.getByRole("heading", { name: /Selected filters/ })).toBeInTheDocument();

      userEvent.click(showLocalAuthorityLabel);

      expect(result.getByText(/Hide/)).toBeVisible();
      expect(result.getByRole("checkbox", { name: /Sorcery/ })).not.toBeChecked();
      expect(result.getByRole("checkbox", { name: /Magic Potions/ })).not.toBeChecked();
      expect(result.queryByText(/No filters selected/)).toBeInTheDocument();
    });
  });
  describe("when a provider sub type filter section 'show this section' is clicked on", () => {
    it("expands section to reveal filter options", () => {
      const providerSubTypes: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const result = render(
        <MemoryRouter>
            <ProviderResultsSearchFilters
                searchCriteria={{...searchCriteria}}
                initialSearch={searchCriteria}
                filterBySearchTerm={jest.fn()}
                addProviderTypeFilter = {jest.fn()}
                removeProviderTypeFilter = {jest.fn()}
                addProviderSubTypeFilter = {jest.fn()}
                removeProviderSubTypeFilter = {jest.fn()}
                addLocalAuthorityFilter = {jest.fn()}
                removeLocalAuthorityFilter = {jest.fn()}
                filterByProviderType = {jest.fn()}
                filterByProviderSubType = {jest.fn()}
                filterByLocalauthority = {jest.fn()}
                providerTypeFacets = {[]}
                providerSubTypeFacets = {providerSubTypes}
                localAuthorityFacets = {[]}
                clearFilters = {jest.fn()}
            />
        </MemoryRouter>
      );

      const providerSubTypeSection = result.getByTestId("provider-sub-type-filters");
      const showProviderSubTypeLabel = within(providerSubTypeSection).getByText(/Provider sub type/);
      expect(showProviderSubTypeLabel).toBeInTheDocument();
      expect(result.queryByText(/Hide/)).not.toBeInTheDocument();
      expect(result.getByRole("heading", { name: /Selected filters/ })).toBeInTheDocument();

      userEvent.click(showProviderSubTypeLabel);

      expect(result.getByText(/Hide/)).toBeVisible();
      expect(result.getByRole("checkbox", { name: /Sorcery/ })).not.toBeChecked();
      expect(result.getByRole("checkbox", { name: /Magic Potions/ })).not.toBeChecked();
      expect(result.queryByText(/No filters selected/)).toBeInTheDocument();
    });
  });
   describe("when a provider type filter section 'show this section' is clicked on", () => {
    it("expands section to reveal filter options", () => {
      const providerTypes: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const result = render(
        <MemoryRouter>
            <ProviderResultsSearchFilters
                searchCriteria={{...searchCriteria}}
                initialSearch={searchCriteria}
                filterBySearchTerm={jest.fn()}
                addProviderTypeFilter = {jest.fn()}
                removeProviderTypeFilter = {jest.fn()}
                addProviderSubTypeFilter = {jest.fn()}
                removeProviderSubTypeFilter = {jest.fn()}
                addLocalAuthorityFilter = {jest.fn()}
                removeLocalAuthorityFilter = {jest.fn()}
                filterByProviderType = {jest.fn()}
                filterByProviderSubType = {jest.fn()}
                filterByLocalauthority = {jest.fn()}
                providerTypeFacets = {providerTypes}
                providerSubTypeFacets = {[]}
                localAuthorityFacets = {[]}
                clearFilters = {jest.fn()}
            />
        </MemoryRouter>
      );

      const providerTypeSection = result.getByTestId("provider-type-filters");
      const showProviderTypeLabel = within(providerTypeSection).getByText(/Provider type/);
      expect(showProviderTypeLabel).toBeInTheDocument();
      expect(result.queryByText(/Hide/)).not.toBeInTheDocument();
      expect(result.getByRole("heading", { name: /Selected filters/ })).toBeInTheDocument();
      const providerTypeSummary = result.getByRole("heading", { name: /Provider type/, level: 2 });
      expect(providerTypeSummary).toBeInTheDocument();
 
      userEvent.click(showProviderTypeLabel);

      expect(result.getByText(/Hide/)).toBeVisible();
      expect(result.getByRole("checkbox", { name: /Sorcery/ })).not.toBeChecked();
      expect(result.getByRole("checkbox", { name: /Magic Potions/ })).not.toBeChecked();
      expect(result.queryByText(/No filters selected/)).toBeInTheDocument();
    });
  });


  describe("when a provider type filter option is selected", () => {
    it("sends updated filters to parent", () => {
      const mockAddProviderTypeFilter = jest.fn();
      const providerTypes: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const result = render(
        <MemoryRouter>
            <ProviderResultsSearchFilters
                searchCriteria={{...searchCriteria}}
                initialSearch={searchCriteria}
                filterBySearchTerm={jest.fn()}
                addProviderTypeFilter = {mockAddProviderTypeFilter}
                removeProviderTypeFilter = {jest.fn()}
                addProviderSubTypeFilter = {jest.fn()}
                removeProviderSubTypeFilter = {jest.fn()}
                addLocalAuthorityFilter = {jest.fn()}
                removeLocalAuthorityFilter = {jest.fn()}
                filterByProviderType = {jest.fn()}
                filterByProviderSubType = {jest.fn()}
                filterByLocalauthority = {jest.fn()}
                providerTypeFacets = {providerTypes}
                providerSubTypeFacets = {[]}
                localAuthorityFacets = {[]}
                clearFilters = {jest.fn()}
            />
        </MemoryRouter>
      );    
      // first, click to show filter options
      const providerTypeSection = result.getByTestId("provider-type-filters");
      const showProviderTypeLabel = within(providerTypeSection).getByText(/Provider type/);
      userEvent.click(showProviderTypeLabel);

      // select option
      const secondFilter = result.getByRole("checkbox", { name: /Magic Potions/ });
      expect(secondFilter).toBeInTheDocument();
      expect(secondFilter).not.toBeChecked();
      userEvent.click(secondFilter);

      expect(mockAddProviderTypeFilter).toHaveBeenCalledWith("Magic Potions");
    });
  });

  describe("when a provider sub type filter option is selected", () => {
    it("sends updated filters to parent", () => {
      const mockAddProviderSubTypeFilter = jest.fn();
      const providerSubTypes: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const result = render(
        <MemoryRouter>
            <ProviderResultsSearchFilters
                searchCriteria={{...searchCriteria}}
                initialSearch={searchCriteria}
                filterBySearchTerm={jest.fn()}
                addProviderTypeFilter = {jest.fn()}
                removeProviderTypeFilter = {jest.fn()}
                addProviderSubTypeFilter = {mockAddProviderSubTypeFilter}
                removeProviderSubTypeFilter = {jest.fn()}
                addLocalAuthorityFilter = {jest.fn()}
                removeLocalAuthorityFilter = {jest.fn()}
                filterByProviderType = {jest.fn()}
                filterByProviderSubType = {jest.fn()}
                filterByLocalauthority = {jest.fn()}
                providerTypeFacets = {[]}
                providerSubTypeFacets = {providerSubTypes}
                localAuthorityFacets = {[]}
                clearFilters = {jest.fn()}
            />
        </MemoryRouter>
      );    
      // first, click to show filter options
      const providerTypeSection = result.getByTestId("provider-sub-type-filters");
      const showProviderTypeLabel = within(providerTypeSection).getByText(/Provider sub type/);
      userEvent.click(showProviderTypeLabel);

      // select option
      const secondFilter = result.getByRole("checkbox", { name: /Magic Potions/ });
      expect(secondFilter).toBeInTheDocument();
      expect(secondFilter).not.toBeChecked();
      userEvent.click(secondFilter);

      expect(mockAddProviderSubTypeFilter).toHaveBeenCalledWith("Magic Potions");
    });
  });

  describe("when a Local Authority filter option is selected", () => {
    it("sends updated filters to parent", () => {
      const mockLocalauthorityFilter = jest.fn();
      const localAuthorities: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const result = render(
        <MemoryRouter>
            <ProviderResultsSearchFilters
                searchCriteria={{...searchCriteria}}
                initialSearch={searchCriteria}
                filterBySearchTerm={jest.fn()}
                addProviderTypeFilter = {jest.fn()}
                removeProviderTypeFilter = {jest.fn()}
                addProviderSubTypeFilter = {jest.fn()}
                removeProviderSubTypeFilter = {jest.fn()}
                addLocalAuthorityFilter = {mockLocalauthorityFilter}
                removeLocalAuthorityFilter = {jest.fn()}
                filterByProviderType = {jest.fn()}
                filterByProviderSubType = {jest.fn()}
                filterByLocalauthority = {jest.fn()}
                providerTypeFacets = {[]}
                providerSubTypeFacets = {[]}
                localAuthorityFacets = {localAuthorities}
                clearFilters = {jest.fn()}
            />
        </MemoryRouter>
      );    
      // first, click to show filter options
      const providerTypeSection = result.getByTestId("local-authority-filters");
      const showProviderTypeLabel = within(providerTypeSection).getByText(/Local authority/);
      userEvent.click(showProviderTypeLabel);

      // select option
      const secondFilter = result.getByRole("checkbox", { name: /Magic Potions/ });
      expect(secondFilter).toBeInTheDocument();
      expect(secondFilter).not.toBeChecked();
      userEvent.click(secondFilter);

      expect(mockLocalauthorityFilter).toHaveBeenCalledWith("Magic Potions");
    });
  }); 

  const searchCriteria: ProviderVersionSearchModel = {
    pageNumber: 1,
    top: 50,
    searchTerm: "",
    errorToggle: false,
    orderBy: [],
    filters: {},
    includeFacets: true,
    facetCount: 100,
    countOnly: false,
    searchMode: SearchMode.All,
    searchFields: [],
    overrideFacetFields: []
  };
});