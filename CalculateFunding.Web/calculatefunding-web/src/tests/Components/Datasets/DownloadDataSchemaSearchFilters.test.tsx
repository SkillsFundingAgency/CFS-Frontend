import { fireEvent, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router";

import { DownloadDataSchemaSearchFilters } from "../../../components/Datasets/DownloadDataSchemaSearchFilters";
import { DatasetDefinitionRequestViewModel } from "../../../types/Datasets/DatasetDefinitionRequestViewModel";
import { FacetValue } from "../../../types/Facet";
import { SearchMode } from "../../../types/SearchMode";

describe("<DownloadDataSchemaSearchFilters />", () => {
  describe("when initially loading with defaults", () => {
    it("renders default view", () => {
     
      const result = render(
        <MemoryRouter>
            <DownloadDataSchemaSearchFilters
                    searchCriteria={searchCriteria}
                    initialSearch={initSearchCriteria}
                    filterBySearchTerm={jest.fn()}
                    addFundingStreamFilter={jest.fn()}
                    removeFundingStreamFilter={jest.fn()}   
                    filterByFundingStreams={jest.fn()}                 
                    fundingStreamFacets={[]}     
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
             <DownloadDataSchemaSearchFilters
                    searchCriteria={searchCriteria}
                    initialSearch={initSearchCriteria}
                    filterBySearchTerm={mockFilterBySearchTerm}
                    addFundingStreamFilter={jest.fn()}
                    removeFundingStreamFilter={jest.fn()}   
                    filterByFundingStreams={jest.fn()}                 
                    fundingStreamFacets={[]}     
                    clearFilters={jest.fn()}
                />
        </MemoryRouter>
      );

      const searchBox = result.getByRole("textbox", { name: /Search/ });
      fireEvent.change(searchBox, {
        target: { innerText: "Academy" },
      });
      waitFor(() => {
        expect(mockFilterBySearchTerm).toHaveBeenCalledWith({ searchTerm: "Academy" } as DatasetDefinitionRequestViewModel)
      }, { timeout: 600 });
    });
  });
  
  describe("when a filter section 'show this section' is clicked on", () => {
    it("expands section to reveal filter options", () => {
      const mockFilterByFundingStreams = jest.fn();
      const mockAddFundingStreamFilter = jest.fn();
      const fundingStreams: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const newFiltersValue: any = {};
      newFiltersValue["fundingStreamName"] = ["Sorcery"];

      const result = render(
        <MemoryRouter>
                <DownloadDataSchemaSearchFilters
                    searchCriteria={{ ...initSearchCriteria, filters: newFiltersValue }}
                    initialSearch={initSearchCriteria}
                    filterBySearchTerm={jest.fn()}
                    addFundingStreamFilter={mockAddFundingStreamFilter}
                    removeFundingStreamFilter={jest.fn()}   
                    filterByFundingStreams={mockFilterByFundingStreams}                 
                    fundingStreamFacets={fundingStreams}     
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
      const mockFilterBySearchTerm = jest.fn();
      const mockAddFundingStreamFilter = jest.fn();
      const mockRemoveFundingStreamFilter = jest.fn();
      const fundingStreams: FacetValue[] = [{ name: "Sorcery", count: 111 }, { name: "Magic Potions", count: 222 }];
      const newFiltersValue: any = {};
      newFiltersValue["fundingStreamName"] = ["Sorcery"];

      const result = render(
        <MemoryRouter>
             <DownloadDataSchemaSearchFilters
                    searchCriteria={{ ...initSearchCriteria, filters: newFiltersValue }}
                    initialSearch={initSearchCriteria}
                    filterBySearchTerm={mockFilterBySearchTerm}
                    addFundingStreamFilter={mockAddFundingStreamFilter}
                    removeFundingStreamFilter={mockRemoveFundingStreamFilter}   
                    filterByFundingStreams={mockFilterByFundingStreams}                 
                    fundingStreamFacets={fundingStreams}     
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

  const searchCriteria : DatasetDefinitionRequestViewModel = {
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
