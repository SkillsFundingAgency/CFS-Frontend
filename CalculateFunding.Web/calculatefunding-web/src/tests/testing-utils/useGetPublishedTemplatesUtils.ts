import * as publishedTemplatesHook from "../../hooks/useGetPublishedTemplates";
import { GetPublishedTemplatesQueryResult } from "../../hooks/useGetPublishedTemplates";
import { PublishedFundingTemplate } from "../../types/TemplateBuilderDefinitions";

const createGetPublishedTemplatesQueryResult = (
  templates: PublishedFundingTemplate[]
): GetPublishedTemplatesQueryResult => {
  return {
    publishedTemplates: templates,
    isLoadingPublishedTemplates: false,
  };
};

const spy: jest.SpyInstance = jest.spyOn(publishedTemplatesHook, "useGetPublishedTemplates");

const hasPublishedTemplates = (templates: PublishedFundingTemplate[]) =>
  spy.mockImplementation(() => createGetPublishedTemplatesQueryResult(templates));

const hasNoPublishedTemplates = () => hasPublishedTemplates([]);

export const useGetPublishedTemplatesUtils = {
  spy,
  hasNoPublishedTemplates,
  hasPublishedTemplates,
};
