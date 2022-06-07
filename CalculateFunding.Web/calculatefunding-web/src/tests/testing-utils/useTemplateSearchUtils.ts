import * as TemplateSearchHook from "../../hooks/TemplateBuilder/useTemplateSearch";
import { UseTemplateSearchQueryResult } from "../../hooks/TemplateBuilder/useTemplateSearch";
import { TemplateSearchResponse, TemplateSearchResult } from "../../types/TemplateBuilderDefinitions";
import { fakery } from "../fakes/fakery";

const createUseTemplateSearchResponse = (
  hookResultOverrides: TemplateSearchResult[] = [],
  responseOverrides: Partial<TemplateSearchResponse> = {}
): UseTemplateSearchQueryResult => {
  return {
    templateSearchResponse: fakery.makeTemplateSearchResponse(
      { ...responseOverrides, results: hookResultOverrides }
    ),
    isLoadingTemplateSearchResults: false,
    refetchTemplateSearchResults: () => Promise.resolve(),
  } as UseTemplateSearchQueryResult;
};

const spy: jest.SpyInstance = jest.spyOn(TemplateSearchHook, "useTemplateSearch");

const withTemplateSearchResponse = (results: TemplateSearchResult[], responseOverrides: Partial<TemplateSearchResponse>) =>
  spy.mockImplementation(() => createUseTemplateSearchResponse(results, responseOverrides));

export const useTemplateSearchUtils = {
  spy,
  withTemplateSearchResponse,
  createUseTemplateSearchResponse,
};
