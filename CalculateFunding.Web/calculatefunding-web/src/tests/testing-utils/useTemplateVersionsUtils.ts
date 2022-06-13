import * as TemplateVersionsHook from "../../hooks/TemplateBuilder/useTemplateVersions";
import { UseTemplateVersionsQueryResult } from "../../hooks/TemplateBuilder/useTemplateVersions";
import {
  TemplateVersionSummary
} from "../../types/TemplateBuilderDefinitions";
import { fakery } from "../fakes/fakery";

const createUseTemplateVersionsResponse = (
  hookResultOverrides: TemplateVersionSummary[] = [],
): UseTemplateVersionsQueryResult => {
  return {
    templateVersions: fakery.makeTemplateVersionsResponse(
      { pageResults: hookResultOverrides, totalCount: hookResultOverrides.length }
    ),
    isLoadingTemplateVersions: false,
    refetchTemplateVersions: () => Promise.resolve(),
  } as UseTemplateVersionsQueryResult;
};

const spy: jest.SpyInstance = jest.spyOn(TemplateVersionsHook, "useTemplateVersions");

const withTemplateVersionsResponse = (results: TemplateVersionSummary[]) =>
  spy.mockImplementation(() => createUseTemplateVersionsResponse(results));

export const useTemplateVersionsUtils = {
  spy,
  withTemplateVersionsResponse,
  createUseTemplateVersionsResponse,
};
