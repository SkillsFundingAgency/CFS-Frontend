import { AxiosError } from "axios";
import { UseQueryOptions,useQuery } from "react-query";

import { getDataSourcesByRelationship } from "../services/datasetService";
import { DataSourceRelationshipResponseViewModel } from "../types/Datasets/DataSourceRelationshipResponseViewModel";

export type RelationshipDataQueryResult = {
  relationshipData: DataSourceRelationshipResponseViewModel | undefined;
  isLoadingRelationshipData: boolean;
  isErrorLoadingRelationshipData: boolean;
  errorLoadingRelationshipData: string;
};

export const useRelationshipData = (
  relationshipId: string,
  queryConfig: UseQueryOptions<DataSourceRelationshipResponseViewModel, AxiosError> = {
    enabled: (relationshipId && relationshipId.length > 0) === true,
  }
): RelationshipDataQueryResult => {
  const { data, isLoading, isError, error } = useQuery<DataSourceRelationshipResponseViewModel, AxiosError>(
    `datasources-by-relationship-${relationshipId}`,
    async () => (await getDataSourcesByRelationship(relationshipId)).data,
    queryConfig
  );
  return {
    relationshipData: data,
    isLoadingRelationshipData: isLoading,
    isErrorLoadingRelationshipData: isError,
    errorLoadingRelationshipData: !isError
      ? ""
      : error
      ? `Error while fetching relationship data: ${error.message}`
      : "Unknown error while fetching relationship data",
  };
};
