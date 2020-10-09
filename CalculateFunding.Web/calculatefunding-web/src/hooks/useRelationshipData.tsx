import {AxiosError} from "axios";
import {QueryConfig, useQuery} from "react-query";
import {getRelationshipData} from "../services/datasetService";
import {RelationshipData} from "../types/Datasets/RelationshipData";
import {QueryResult} from "react-query/types/core/types";

export const useRelationshipData = (relationshipId: string,
                                    queryConfig: QueryConfig<any | Error, any> =
                                        {
                                            enabled: relationshipId && relationshipId.length > 0
                                        })
    : QueryResult<RelationshipData, Error> => {
    return useQuery(
        `datasources-by-relationship-${relationshipId}`,
        () => getRelationshipData(relationshipId)
            .then((response) => {
                return response.data;
            })
            .catch((err: AxiosError) => {
                return new Error(err.code ? err.code + " " : "" + `Error while fetching specification details: ${err.message}`);
            }),
        queryConfig);
};

