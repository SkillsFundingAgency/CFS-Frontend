import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { getVersionsOfTemplate } from "../../services/templateBuilderDatasourceService";
import {
  GetTemplateVersionsResponse, TemplateVersionSearchQuery,
} from "../../types/TemplateBuilderDefinitions";

export type UseTemplateVersionsQueryResult = {
  templateVersions: GetTemplateVersionsResponse | undefined;
  isLoadingTemplateVersions: boolean;
  refetchTemplateVersions: () => void;
};


export const useTemplateVersions = (
  searchRequest: TemplateVersionSearchQuery,
  options: UseQueryOptions<GetTemplateVersionsResponse, AxiosError>
): UseTemplateVersionsQueryResult => {
  const {
    data,
    isLoading,
    refetch,
  } = useQuery<GetTemplateVersionsResponse, AxiosError>(
    ["template-versions", searchRequest],
    async () => (await getVersionsOfTemplate(searchRequest)).data,
    { enabled: !!searchRequest?.page, ...options }
  );

  return {
    templateVersions: data,
    isLoadingTemplateVersions: isLoading,
    refetchTemplateVersions: refetch
  };
};

