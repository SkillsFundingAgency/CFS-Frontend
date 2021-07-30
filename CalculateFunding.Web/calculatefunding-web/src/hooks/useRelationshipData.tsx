import {AxiosError} from "axios";
import {useQuery, UseQueryOptions} from "react-query";
import {getDatasourcesByRelationship, getReferencedSpecificationRelationshipMetadata} from "../services/datasetService";
import {DatasourceRelationshipResponseViewModel} from "../types/Datasets/DatasourceRelationshipResponseViewModel";

export type RelationshipDataQueryResult = {
    relationshipData: DatasourceRelationshipResponseViewModel | undefined,
    isLoadingRelationshipData: boolean,
    isErrorLoadingRelationshipData: boolean,
    errorLoadingRelationshipData: string
}
export const useRelationshipData = (relationshipId: string,
                                    queryConfig: UseQueryOptions<DatasourceRelationshipResponseViewModel, AxiosError> =
                                        {
                                            enabled: (relationshipId && relationshipId.length > 0) === true
                                        })
    : RelationshipDataQueryResult => {
    const {data, isLoading, isError, error} = useQuery<DatasourceRelationshipResponseViewModel, AxiosError>(
        `datasources-by-relationship-${relationshipId}`,
        async () => (await getDatasourcesByRelationship(relationshipId)).data,
        queryConfig);
    return {
        relationshipData: data,
        isLoadingRelationshipData: isLoading,
        isErrorLoadingRelationshipData: isError,
        errorLoadingRelationshipData: !isError ? "" : error ? `Error while fetching relationship data: ${error.message}` : "Unknown error while fetching relationship data"
    }
};


