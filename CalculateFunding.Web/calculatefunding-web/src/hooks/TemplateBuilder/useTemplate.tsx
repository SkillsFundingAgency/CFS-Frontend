import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { getTemplateById } from "../../services/templateBuilderDatasourceService";
import { TemplateResponse } from "../../types/TemplateBuilderDefinitions";

export type UseTemplateResult = {
  template: TemplateResponse | undefined;
  isLoadingTemplate: boolean;
};

export const useTemplate = (
  templateId: string | undefined,
  options: UseQueryOptions<TemplateResponse, AxiosError>
): UseTemplateResult => {

  const key = `template-${templateId}`;

  const { data, isLoading } = useQuery<TemplateResponse, AxiosError>(
    key,
    async () => (await getTemplateById(templateId as string)).data,
    { enabled: !!templateId?.length, ...options }
  );

  return {
    template: data,
    isLoadingTemplate: isLoading,
  };
};
