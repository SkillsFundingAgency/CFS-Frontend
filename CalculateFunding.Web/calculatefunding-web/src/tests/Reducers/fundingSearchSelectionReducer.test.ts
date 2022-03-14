import { FundingSearchSelectionActionEvent } from "../../actions/FundingSearchSelectionActions";
import { reduceFundingSearchSelectionState } from "../../reducers/fundingSearchSelectionReducer";
import { FundingSearchSelectionState } from "../../states/FundingSearchSelectionState";
import { PublishedProviderSearchRequest } from "../../types/publishedProviderSearchRequest";
import { SearchMode } from "../../types/SearchMode";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";

const searchCriters: PublishedProviderSearchRequest = {
  indicative: [],
  monthYearOpened: [],
  searchTerm: "",
  status: [],
  providerType: [],
  providerSubType: [],
  localAuthority: [],
  fundingStreamId: "53683aswer",
  specificationId: "gdfuw467u24",
  hasErrors: undefined,
  searchMode: SearchMode.All,
  pageSize: 50,
  pageNumber: 1,
  includeFacets: true,
  facetCount: 0,
  fundingPeriodId: "34572345",
  errorToggle: "",
  searchFields: [],
  fundingAction: FundingActionType.Approve
};
const initialState: FundingSearchSelectionState = {
  searchCriteria: searchCriters,
  selectedProviderIds: [],
};

describe("fundingSearchSelectionReducer tests", () => {
  describe("INITIALISE", () => {
    it("Should return the initial state", () => {
      expect(
        reduceFundingSearchSelectionState(undefined, {
          type: FundingSearchSelectionActionEvent.INITIALISE,
          payload: initialState.searchCriteria as PublishedProviderSearchRequest,
        })
      ).toEqual(initialState);
    });
  });

  describe("UPDATE_SEARCH_TEXT_FILTER", () => {
    it("Should correctly add search values", () => {
      expect(
        reduceFundingSearchSelectionState(undefined, {
          type: FundingSearchSelectionActionEvent.UPDATE_SEARCH_TEXT_FILTER,
          payload: { searchFields: ["Potions"], searchTerm: "Volubilis" },
        })
      ).toEqual({
        searchCriteria: {
          searchTerm: "Volubilis",
          searchFields: ["Potions"],
          pageNumber: 1,
        },
        selectedProviderIds: [],
      });
    });
    it("Should correctly update search values", () => {
      const previousSearch: PublishedProviderSearchRequest = {
        indicative: [],
        monthYearOpened: [],
        searchTerm: "Expelliarmus",
        status: [],
        providerType: [],
        providerSubType: [],
        localAuthority: [],
        fundingStreamId: "53683aswer",
        specificationId: "gdfuw467u24",
        hasErrors: true,
        searchMode: SearchMode.All,
        pageSize: 125,
        pageNumber: 23,
        includeFacets: true,
        facetCount: 0,
        fundingPeriodId: "34572345",
        errorToggle: "",
        searchFields: ["Spells"],
        fundingAction: FundingActionType.Approve
      };
      const previousState: FundingSearchSelectionState = {
        searchCriteria: previousSearch,
        selectedProviderIds: ["356tytw345t", "retyw4358"],
      };

      expect(
        reduceFundingSearchSelectionState(previousState, {
          type: FundingSearchSelectionActionEvent.UPDATE_SEARCH_TEXT_FILTER,
          payload: { searchFields: ["Potions"], searchTerm: "Volubilis" },
        })
      ).toEqual({
        searchCriteria: {
          searchTerm: "Volubilis",
          searchFields: ["Potions"],
          pageNumber: 1,
          status: [],
          providerType: [],
          providerSubType: [],
          indicative: [],
          monthYearOpened: [],
          localAuthority: [],
          fundingStreamId: "53683aswer",
          specificationId: "gdfuw467u24",
          hasErrors: true,
          searchMode: SearchMode.All,
          pageSize: 125,
          includeFacets: true,
          facetCount: 0,
          fundingPeriodId: "34572345",
          errorToggle: "",
          fundingAction: FundingActionType.Approve
        },
        selectedProviderIds: ["356tytw345t", "retyw4358"],
      });
    });
  });
});
