import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import * as datasetService from "../../services/datasetService";
import { DatasetRelationship } from "../../types/DatasetRelationship";

export interface GetSpecificationDatasetsQueryResult {
  datasets: DatasetRelationship[] | undefined;
  isLoadingDatasets: boolean;
  refetchDatasets: () => void;
}

export const useSpecificationDatasets = ({
  specificationId,
  options = {},
}: {
  specificationId: string | undefined;
  options?: Partial<UseQueryOptions<DatasetRelationship[], AxiosError>>;
}): GetSpecificationDatasetsQueryResult => {
  const { data, isLoading, refetch } = useQuery<DatasetRelationship[], AxiosError>(
    ["spec-datasets", specificationId],
    async () => (await datasetService.getDatasetsBySpecification(specificationId as string)).data,
    {
      enabled: !!specificationId?.length,
      ...options,
    }
  );

  return {
    datasets: data,
    isLoadingDatasets: isLoading,
    refetchDatasets: refetch,
  };
};
