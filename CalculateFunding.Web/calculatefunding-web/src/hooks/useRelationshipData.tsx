import {AxiosError} from "axios";
import {useQuery, UseQueryOptions} from "react-query";
import {getRelationshipData} from "../services/datasetService";
import {RelationshipData} from "../types/Datasets/RelationshipData";

export type RelationshipDataQueryResult = {
    relationshipData: RelationshipData | undefined,
    isLoadingRelationshipData: boolean,
    isErrorLoadingRelationshipData: boolean,
    errorLoadingRelationshipData: string
}
export const useRelationshipData = (relationshipId: string,
                                    queryConfig: UseQueryOptions<RelationshipData, AxiosError> =
                                        {
                                            enabled: (relationshipId && relationshipId.length > 0) === true
                                        })
    : RelationshipDataQueryResult => {
    const {data, isLoading, isError, error} = useQuery<RelationshipData, AxiosError>(
        `datasources-by-relationship-${relationshipId}`,
        async () => (await getRelationshipData(relationshipId)).data,
        queryConfig);
    return {
        relationshipData: data,
        isLoadingRelationshipData: isLoading,
        isErrorLoadingRelationshipData: isError,
        errorLoadingRelationshipData: !isError ? "" : error ? `Error while fetching relationship data: ${error.message}` : "Unknown error while fetching relationship data"
    }
};


