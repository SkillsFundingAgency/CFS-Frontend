import {AxiosError} from "axios";
import {QueryConfig, useQuery} from "react-query";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {getSpecificationSummaryService} from "../services/specificationService";

export type SpecificationSummaryQueryResult = {
    specification: SpecificationSummary | undefined,
    isLoadingSpecification: boolean,
    errorCheckingForSpecification: string,
    haveErrorCheckingForSpecification: boolean,
    isFetchingSpecification: boolean,
    isSpecificationFetched: boolean,
}
const oneHour = 1000 * 60 * 60;

export const useSpecificationSummary = (specificationId: string,
                                        queryConfig: QueryConfig<SpecificationSummary, AxiosError> =
                                            {
                                                cacheTime: oneHour,
                                                staleTime: oneHour,
                                                refetchOnWindowFocus: false,
                                                enabled: specificationId && specificationId.length > 0
                                            })
    : SpecificationSummaryQueryResult => {

    const {data, error, isFetching, isLoading, isError, isFetched} =
        useQuery<SpecificationSummary, AxiosError>(
            `specification-${specificationId}-summary`,
            async () => (await getSpecificationSummaryService(specificationId)).data,
            queryConfig);

    return {
        specification: data, 
        isLoadingSpecification: isError ? false : isLoading,
        haveErrorCheckingForSpecification: isError,
        errorCheckingForSpecification: !isError ? "" : error ? `Error while fetching specification details: ${error.message}` : "Unknown error while fetching specification details", 
        isFetchingSpecification: isFetching, 
        isSpecificationFetched: isFetched
    };
};

