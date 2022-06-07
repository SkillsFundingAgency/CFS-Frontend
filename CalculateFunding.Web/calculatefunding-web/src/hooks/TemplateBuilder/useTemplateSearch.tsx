import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { searchForTemplates } from "../../services/templateBuilderDatasourceService";
import { TemplateSearchResponse } from "../../types/TemplateBuilderDefinitions";
import { TemplateSearchRequest } from "../../types/templateSearchRequest";

export type UseTemplateSearchQueryResult = {
  templateSearchResponse: TemplateSearchResponse | undefined;
  isLoadingTemplateSearchResults: boolean;
  refetchTemplateSearchResults: () => void;
};

export const useTemplateSearch = (
  searchRequest: TemplateSearchRequest,
  options: UseQueryOptions<TemplateSearchResponse, AxiosError>
): UseTemplateSearchQueryResult => {
  const {
    data,
    isLoading,
    refetch,
  } = useQuery<TemplateSearchResponse, AxiosError>(
    ["template-search", searchRequest],
    async () => (await searchForTemplates(searchRequest)).data,
    { enabled: !!searchRequest?.pageNumber, ...options }
  );

  return {
    templateSearchResponse: data,
    isLoadingTemplateSearchResults: isLoading,
    refetchTemplateSearchResults: refetch
  };
};

