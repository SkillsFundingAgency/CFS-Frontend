import { AxiosError } from "axios";
import { useQuery } from "react-query";

import * as datasetService from "../../services/datasetService";
import { DatasetVersionSearchResponse } from "../../types/Datasets/DatasetVersionSearchResponse";

export interface DataSetVersionSearchQuery {
  relationshipId: string | undefined;
  dataSetId: string | undefined;
  pageNumber: number;
  pageSize: number;
  enabled: boolean | undefined;
  onError: (err: AxiosError) => void;
}

export interface DataSetVersionSearchQueryResult {
  datasetVersionSearchResponse: DatasetVersionSearchResponse | undefined;
  isSearchingForDataSetVersions: boolean;
}

export const useDataSetVersionSearch = ({
  relationshipId,
  dataSetId,
  pageNumber,
  pageSize,
  enabled,
  onError,
}: DataSetVersionSearchQuery): DataSetVersionSearchQueryResult => {
  const { data, isLoading } = useQuery<DatasetVersionSearchResponse, AxiosError>(
    [
      "data-set-versions",
      {
        relationshipId: relationshipId,
        dataSetId: dataSetId,
        pageNumber: pageNumber,
        pageSize: pageSize,
      },
    ],
    async () => (await datasetService.searchDatasetVersions(dataSetId as string, pageNumber, pageSize)).data,
    {
      onError: onError,
      enabled: enabled && !!dataSetId && !!relationshipId,
    }
  );

  return {
    datasetVersionSearchResponse: data,
    isSearchingForDataSetVersions: isLoading,
  };
};
