import {AxiosError} from "axios";
import {QueryConfig, useQuery} from "react-query";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {getSpecificationSummaryService} from "../services/specificationService";
import {milliseconds} from "../helpers/TimeInMs";

export type SpecificationSummaryQueryResult = {
    specification: SpecificationSummary | undefined,
    isLoadingSpecification: boolean,
    errorCheckingForSpecification: AxiosError | null,
    haveErrorCheckingForSpecification: boolean,
    isFetchingSpecification: boolean,
    isSpecificationFetched: boolean,
}

export const useSpecificationSummary = (specificationId: string,
                                        onError: (err: AxiosError) => void,
                                        staleTime: number = milliseconds.OneHour)
    : SpecificationSummaryQueryResult => {

    let config: QueryConfig<SpecificationSummary, AxiosError> = {
        cacheTime: milliseconds.OneHour,
        staleTime: staleTime,
        refetchOnWindowFocus: false,
        enabled: specificationId && specificationId.length > 0,
        onError: onError
    };
    
    const {data, error, isFetching, isLoading, isError, isFetched} =
        useQuery<SpecificationSummary, AxiosError>(
            `specification-${specificationId}-summary`,
            async () => (await getSpecificationSummaryService(specificationId)).data,
            config);

    return {
        specification: data, 
        isLoadingSpecification: isError ? false : isLoading,
        haveErrorCheckingForSpecification: isError,
        errorCheckingForSpecification: error, 
        isFetchingSpecification: isFetching, 
        isSpecificationFetched: isFetched
    };
};

