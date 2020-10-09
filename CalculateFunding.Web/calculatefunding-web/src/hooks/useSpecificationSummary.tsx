import {AxiosError} from "axios";
import {QueryConfig, useQuery} from "react-query";
import {getSpecificationSummaryService} from "../services/specificationService";
import {SpecificationSummary} from "../types/SpecificationSummary";

export type SpecificationSummaryResult = {
    specification: SpecificationSummary | undefined,
    isLoadingSpecification: boolean,
    errorCheckingForSpecification: string,
    haveErrorCheckingForSpecification: boolean,
    isFetchingSpecification: boolean,
    isSpecificationFetched: boolean,
}
const oneHour = 1000 * 60 * 60;

export const useSpecificationSummary = (specificationId: string,
                                        queryConfig: QueryConfig<SpecificationSummary | Error, any> =
                                            {
                                                cacheTime: oneHour,
                                                staleTime: oneHour,
                                                refetchOnWindowFocus: false,
                                                enabled: specificationId && specificationId.length > 0
                                            })
    : SpecificationSummaryResult => {

    const {data, error, isFetching, isLoading, isError, isFetched} =
        useQuery(
            `specification-${specificationId}-summary`,
            () => getSpecificationSummaryService(specificationId)
                .then((response) => {
                    return response.data;
                })
                .catch((err: AxiosError) => {
                    return new Error(err.code ? err.code + " " : "" + `Error while fetching specification details: ${err.message}`);
                }),
            queryConfig);

    if (data instanceof Error) {
        return {specification: undefined, isLoadingSpecification: false, errorCheckingForSpecification: data.message, haveErrorCheckingForSpecification: true, isFetchingSpecification: false, isSpecificationFetched: false};
    }
    if (isError) {
        return {specification: undefined, isLoadingSpecification: isLoading, errorCheckingForSpecification: error as string, haveErrorCheckingForSpecification: isError, isFetchingSpecification: isFetching, isSpecificationFetched: isFetched};
    }

    return {specification: data, isLoadingSpecification: isLoading, errorCheckingForSpecification: "", haveErrorCheckingForSpecification: false, isFetchingSpecification: isFetching, isSpecificationFetched: isFetched};
};

