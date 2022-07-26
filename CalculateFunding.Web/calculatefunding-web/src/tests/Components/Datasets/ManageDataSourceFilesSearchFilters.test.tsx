import { fireEvent, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router";

import { ManageDataSourceFilesSearchFilters } from "../../../components/Datasets/ManageDataSourceFilesSearchFilters";
import { FacetValue } from "../../../types/Facet";
import { DatasetSearchRequestViewModel } from "../../../types/Datasets/DatasetSearchRequestViewModel";
import { SearchMode } from "../../../types/SearchMode";


describe("<ManageDataSourceFilesSearchFilters />", () => {
  describe("when initially loading with defaults", () => {
    it("renders default view", () => {     
      const result = render(
        <MemoryRouter>
          <ManageDataSourceFilesSearchFilters
            searchCriteria={searchCriteria}
            initialSearch={initSearchCriteria}
            filterBySearchTerm={jest.fn()}
            addFundingStreamFilter={jest.fn()}
            removeFundingStreamFilter={jest.fn()}
            addDataSchemaFilter={jest.fn()}
            removeDataSchemaFilter={jest.fn()}             
            filterByFundingStreams={jest.fn()}
            filterByDataSchemas={jest.fn()}
            fundingStreamFacets={[]}
            dataSchemaFacets={[]}
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
            <ManageDataSourceFilesSearchFilters
            searchCriteria={searchCriteria}
            initialSearch={initSearchCriteria}
            filterBySearchTerm={mockFilterBySearchTerm}
            addFundingStreamFilter={jest.fn()}
            removeFundingStreamFilter={jest.fn()}
            addDataSchemaFilter={jest.fn()}
            removeDataSchemaFilter={jest.fn()}             
            filterByFundingStreams={jest.fn()}
            filterByDataSchemas={jest.fn()}
            fundingStreamFacets={[]}
            dataSchemaFacets={[]}
            clearFilters={jest.fn()}        
          />
        </MemoryRouter>
      );

      const searchBox = result.getByRole("textbox", { name: /Search/ });
      fireEvent.change(searchBox, {
        target: { innerText: "Adjustments" },
      });
      waitFor(() => {
        expect(mockFilterBySearchTerm).toHaveBeenCalledWith({ searchTerm: "Adjustments" } as DatasetSearchRequestViewModel)
      }, { timeout: 600 });
    });
  });

  describe("when 'show all sections' is clicked on", () => {
    it("expands all sections to reveal filter options", () => {
      const mockFilterByFundingStreams = jest.fn();
      const mockAddFundingStreamFilter = jest.fn();
      const fundingStreams: FacetValue[] = [{ name: "DSG", count: 2 }, { name: "Lump Sum Funding", count: 2 }];

      const result = render(
        <MemoryRouter>
         <ManageDataSourceFilesSearchFilters
            searchCriteria={{ ...initSearchCriteria, fundingStreams: ["DSG"] }}
            initialSearch={initSearchCriteria}
            filterBySearchTerm={jest.fn()}
            addFundingStreamFilter={mockAddFundingStreamFilter}
            removeFundingStreamFilter={jest.fn()}
            addDataSchemaFilter={jest.fn()}
            removeDataSchemaFilter={jest.fn()}             
            filterByFundingStreams={mockFilterByFundingStreams}
            filterByDataSchemas={jest.fn()}
            fundingStreamFacets={fundingStreams}
            dataSchemaFacets={[]}
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

      expect(result.getByRole("checkbox", { name: /DSG/ })).toBeChecked();
      expect(result.getByRole("checkbox", { name: /Lump Sum Funding/ })).not.toBeChecked();
    });
  });

  describe("when a filter section 'show this section' is clicked on", () => {
    it("expands section to reveal filter options", () => {
      const mockFilterByFundingStreams = jest.fn();
      const mockAddFundingStreamFilter = jest.fn();
      const fundingStreams: FacetValue[] = [{ name: "DSG", count: 2 }, { name: "Lump Sum Funding", count: 2 }];

      const result = render(
        <MemoryRouter>
           <ManageDataSourceFilesSearchFilters
            searchCriteria={{ ...initSearchCriteria, fundingStreams: ["DSG"] }}
            initialSearch={initSearchCriteria}
            filterBySearchTerm={jest.fn()}
            addFundingStreamFilter={mockAddFundingStreamFilter}
            removeFundingStreamFilter={jest.fn()}
            addDataSchemaFilter={jest.fn()}
            removeDataSchemaFilter={jest.fn()}             
            filterByFundingStreams={mockFilterByFundingStreams}
            filterByDataSchemas={jest.fn()}
            fundingStreamFacets={fundingStreams}
            dataSchemaFacets={[]}
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
      expect(within(fundingStreamSummary.parentElement as HTMLElement).getByText(/DSG/)).toBeInTheDocument();

      userEvent.click(showFundingStreamsLabel);

      expect(result.getByText(/Hide/)).toBeVisible();
      expect(result.getByRole("checkbox", { name: /DSG/ })).toBeChecked();
      expect(result.getByRole("checkbox", { name: /Lump Sum Funding/ })).not.toBeChecked();
      expect(result.queryByText(/No filters selected/)).not.toBeInTheDocument();
    });
  });

  describe("when a filter option is selected", () => {
    it("sends updated filters to parent", () => {
      const mockClearFilters = jest.fn();
      const mockFilterByFundingStreams = jest.fn();
      const mockFilterByDataSchemas = jest.fn();
      const mockFilterBySearchTerm = jest.fn();
      const mockAddFundingStreamFilter = jest.fn();
      const mockRemoveFundingStreamFilter = jest.fn();
      const mockAddDataSchemaFilter = jest.fn();
      const mockRemoveDataSchemaFilter = jest.fn();
      const fundingStreams: FacetValue[] = [{ name: "DSG", count: 2 }, { name: "Lump Sum Funding", count: 2 }];

      const result = render(
        <MemoryRouter>
            <ManageDataSourceFilesSearchFilters
            searchCriteria={{ ...initSearchCriteria, fundingStreams: ["DSG"] }}
            initialSearch={initSearchCriteria}
            filterBySearchTerm={mockFilterBySearchTerm}
            addFundingStreamFilter={mockAddFundingStreamFilter}
            removeFundingStreamFilter={mockRemoveFundingStreamFilter}
            addDataSchemaFilter={mockAddDataSchemaFilter}
            removeDataSchemaFilter={mockRemoveDataSchemaFilter}             
            filterByFundingStreams={mockFilterByFundingStreams}
            filterByDataSchemas={mockFilterByDataSchemas}
            fundingStreamFacets={fundingStreams}
            dataSchemaFacets={[]}
            clearFilters={mockClearFilters}        
          />         
        </MemoryRouter>
      );

      // first, click to show filter options
      const fundingStreamsSection = result.getByTestId("funding-streams-filters");
      const showFundingStreamsLabel = within(fundingStreamsSection).getByText(/Funding streams/);
      userEvent.click(showFundingStreamsLabel);

      // select option
      const secondFilter = result.getByRole("checkbox", { name: /Lump Sum Funding/ });
      expect(secondFilter).toBeInTheDocument();
      expect(secondFilter).not.toBeChecked();
      userEvent.click(secondFilter);

      expect(mockAddFundingStreamFilter).toHaveBeenCalledWith("Lump Sum Funding");
    });
  });

  const searchCriteria: DatasetSearchRequestViewModel = {
    errorToggle: "",
    facetCount: 100,
    filters: [],
    includeFacets: true,
    pageNumber: 1,
    pageSize: 50,
    searchTerm: "",
    searchMode: SearchMode.All,
    fundingStreams: [],
    dataSchemas: []
  };

  const initSearchCriteria: DatasetSearchRequestViewModel = {
    errorToggle: "",
    facetCount: 100,
    filters: [],
    includeFacets: true,
    pageNumber: 1,
    pageSize: 50,
    searchTerm: "",
    searchMode: SearchMode.All,
    fundingStreams: [],
    dataSchemas: []
  };
});
