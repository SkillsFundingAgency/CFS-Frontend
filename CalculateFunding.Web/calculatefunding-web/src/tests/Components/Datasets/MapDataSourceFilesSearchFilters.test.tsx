import { fireEvent, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router";
import { DatasetDefinitionRequestViewModel } from "types/Datasets/DatasetDefinitionRequestViewModel";
import { SearchMode } from "types/SearchMode";

import { MapDataSourceFilesSearchFilters } from "../../../components/Datasets/MapDataSourceFilesSearchFilters";
import { FacetValue } from "../../../types/Facet";
import { SpecificationSearchRequestViewModel } from "../../../types/SpecificationSearchRequestViewModel";


describe("<MapDataSourceFilesSearchFilters />", () => {
  describe("when initially loading with defaults", () => {
    it("renders default view", () => {    
      const result = render(
        <MemoryRouter>
            <MapDataSourceFilesSearchFilters
              searchCriteria={searchCriteria}
              initialSearch={initSearchCriteria}
              filterBySearchTerm={jest.fn()}
              addFundingStreamFilter={jest.fn()}
              removeFundingStreamFilter={jest.fn()}
              addFundingPeriodFilter={jest.fn()}
              removeFundingPeriodFilter={jest.fn()}              
              filterByFundingStreams={jest.fn()}
              filterByFundingPeriods={jest.fn()}             
              fundingStreamFacets={[]}
              fundingPeriodFacets={[]}
              clearFilters={jest.fn()}
            />          
        </MemoryRouter>
      );

      expect(result.container.querySelector(".search-filters")).toBeInTheDocument();
      expect(result.getByRole("textbox", { name: /Search/ })).toBeVisible();
      expect(result.getByRole("heading", { name: /Selected filters/ })).toBeVisible();
      expect(within(result.getByRole("heading", { name: /Selected filters/ }).parentElement as HTMLElement)
        .getByText(/No filters selected/))
        .toBeVisible();
      expect(result.queryByText(/Hide/)).not.toBeInTheDocument();
    });
  });

  describe("when searching by text", () => {
    it("updates search criteria", () => {
      const mockFilterBySearchTerm = jest.fn();

      const result = render(
        <MemoryRouter>
            <MapDataSourceFilesSearchFilters
              searchCriteria={searchCriteria}
              initialSearch={initSearchCriteria}
              filterBySearchTerm={mockFilterBySearchTerm}
              addFundingStreamFilter={jest.fn()}
              removeFundingStreamFilter={jest.fn()}
              addFundingPeriodFilter={jest.fn()}
              removeFundingPeriodFilter={jest.fn()}              
              filterByFundingStreams={jest.fn()}
              filterByFundingPeriods={jest.fn()}             
              fundingStreamFacets={[]}
              fundingPeriodFacets={[]}
              clearFilters={jest.fn()}
            />           
        </MemoryRouter>
      );

      const searchBox = result.getByRole("textbox", { name: /Search/ });
      fireEvent.change(searchBox, {
        target: { innerText: "Academy" },
      });
      waitFor(() => {
        expect(mockFilterBySearchTerm).toHaveBeenCalledWith({ searchText: "Academy" } as SpecificationSearchRequestViewModel)
      }, { timeout: 600 });
    });
  });

  describe("when 'show all sections' is clicked on", () => {
    it("expands all sections to reveal filter options", () => {
      const mockFilterByFundingStreams = jest.fn();
      const mockAddFundingStreamFilter = jest.fn();
      const fundingStreams: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const newFiltersValue: any = {};
      newFiltersValue["fundingStreamNames"] = ["Sorcery"];

      const result = render(
        <MemoryRouter>
          <MapDataSourceFilesSearchFilters
              searchCriteria={{ ...initSearchCriteria, filters: newFiltersValue }}
              initialSearch={initSearchCriteria}
              filterBySearchTerm={jest.fn()}
              addFundingStreamFilter={mockAddFundingStreamFilter}
              removeFundingStreamFilter={jest.fn()}
              addFundingPeriodFilter={jest.fn()}
              removeFundingPeriodFilter={jest.fn()}              
              filterByFundingStreams={mockFilterByFundingStreams}
              filterByFundingPeriods={jest.fn()}             
              fundingStreamFacets={fundingStreams}
              fundingPeriodFacets={[]}
              clearFilters={jest.fn()}
          />
        </MemoryRouter>
      );

      const showHideAll = result.getByText(/Show all sections/ );
      expect(showHideAll).toBeInTheDocument();
      expect(result.queryByText(/Hide/)).not.toBeInTheDocument();
      expect(result.getAllByText(/Show/)).toHaveLength(3);

      userEvent.click(showHideAll);

      expect(result.getByText(/Hide all sections/)).toBeVisible();
      expect(result.queryByText(/Show/)).not.toBeInTheDocument();
      expect(result.getAllByText(/Hide/)).toHaveLength(3);

      expect(result.getByRole("checkbox", { name: /Sorcery/ })).toBeChecked();
      expect(result.getByRole("checkbox", { name: /Magic Potions/ })).not.toBeChecked();
    });
  });

  describe("when a filter section 'show this section' is clicked on", () => {
    it("expands section to reveal filter options", () => {
      const mockFilterByFundingStreams = jest.fn();
      const mockAddFundingStreamFilter = jest.fn();
      const fundingStreams: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const newFiltersValue: any = {};
      newFiltersValue["fundingStreamNames"] = ["Sorcery"];

      const result = render(
        <MemoryRouter>
           <MapDataSourceFilesSearchFilters
              searchCriteria={{ ...initSearchCriteria, filters: newFiltersValue }}
              initialSearch={initSearchCriteria}
              filterBySearchTerm={jest.fn()}
              addFundingStreamFilter={mockAddFundingStreamFilter}
              removeFundingStreamFilter={jest.fn()}
              addFundingPeriodFilter={jest.fn()}
              removeFundingPeriodFilter={jest.fn()}              
              filterByFundingStreams={mockFilterByFundingStreams}
              filterByFundingPeriods={jest.fn()}             
              fundingStreamFacets={fundingStreams}
              fundingPeriodFacets={[]}
              clearFilters={jest.fn()}
          />         
        </MemoryRouter>
      );

      const fundingStreamsSection = result.getByTestId("funding-streams-filters");
      const showFundingStreamsLabel = within(fundingStreamsSection).getByText(/Funding streams/);
      expect(showFundingStreamsLabel).toBeInTheDocument();
      expect(result.queryByText(/Hide/)).not.toBeInTheDocument();
      expect(result.getByRole("heading", { name: /Selected filters/ })).toBeInTheDocument();
      const fundingStreamSummary = result.getByRole("heading", { name: /Funding streams/, level: 3 });
      expect(fundingStreamSummary).toBeInTheDocument();
      expect(within(fundingStreamSummary.parentElement as HTMLElement).getByText(/Sorcery/)).toBeInTheDocument();

      userEvent.click(showFundingStreamsLabel);

      expect(result.getByText(/Hide/)).toBeVisible();
      expect(result.getByRole("checkbox", { name: /Sorcery/ })).toBeChecked();
      expect(result.getByRole("checkbox", { name: /Magic Potions/ })).not.toBeChecked();
      expect(result.queryByText(/No filters selected/)).not.toBeInTheDocument();
    });
  });

  describe("when a filter option is selected", () => {
    it("sends updated filters to parent", () => {
      const mockClearFilters = jest.fn();
      const mockFilterByFundingStreams = jest.fn();
      const mockFilterByFundingPeriods = jest.fn();
      const mockFilterBySearchTerm = jest.fn();
      const mockAddFundingStreamFilter = jest.fn();
      const mockRemoveFundingStreamFilter = jest.fn();
      const fundingStreams: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const newFiltersValue: any = {};
      newFiltersValue["fundingStreamNames"] = ["Sorcery"];

      const result = render(
        <MemoryRouter>
           <MapDataSourceFilesSearchFilters
              searchCriteria={{ ...initSearchCriteria, filters: newFiltersValue }}
              initialSearch={initSearchCriteria}
              filterBySearchTerm={mockFilterBySearchTerm}
              addFundingStreamFilter={mockAddFundingStreamFilter}
              removeFundingStreamFilter={mockRemoveFundingStreamFilter}
              addFundingPeriodFilter={jest.fn()}
              removeFundingPeriodFilter={jest.fn()}              
              filterByFundingStreams={mockFilterByFundingStreams}
              filterByFundingPeriods={mockFilterByFundingPeriods}             
              fundingStreamFacets={fundingStreams}
              fundingPeriodFacets={[]}
              clearFilters={mockClearFilters}
          />         
        </MemoryRouter>
      );    

      // first, click to show filter options
      const fundingStreamsSection = result.getByTestId("funding-streams-filters");
      const showFundingStreamsLabel = within(fundingStreamsSection).getByText(/Funding streams/);
      userEvent.click(showFundingStreamsLabel);

      // select option
      const secondFilter = result.getByRole("checkbox", { name: /Magic Potions/ });
      expect(secondFilter).toBeInTheDocument();
      expect(secondFilter).not.toBeChecked();
      userEvent.click(secondFilter);

      expect(mockAddFundingStreamFilter).toHaveBeenCalledWith("Magic Potions");
    });
  });

const searchCriteria: DatasetDefinitionRequestViewModel = {
    errorToggle: "",
    facetCount: 10,
    filters: { "": [""] },
    includeFacets: true,
    pageNumber: 1,
    pageSize: 50,
    searchMode: SearchMode.All,
    searchTerm: "",
  };


const initSearchCriteria : DatasetDefinitionRequestViewModel = {
    errorToggle: "",
    facetCount: 10,
    filters: { "": [""] },
    includeFacets: true,
    pageNumber: 1,
    pageSize: 50,
    searchMode: SearchMode.All,
    searchTerm: "",
  };
});
