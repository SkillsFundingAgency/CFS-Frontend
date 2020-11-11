import {useQuery} from "react-query";
import {ProviderSummary} from "../../types/ProviderSummary";
import {AxiosError} from "axios";
import {getProviderByIdAndVersionService} from "../../services/providerService";
import {milliseconds} from "../../helpers/TimeInMs";


export type ProviderVersionQueryResult = {
    providerVersion: ProviderSummary | undefined,
    isLoadingProviderVersion: boolean,
    isFetchingProviderVersion: boolean,
    isErrorLoadingProviderVersion: boolean,
    errorLoadingProviderVersion: AxiosError | null
}

export const useProviderVersion = (providerId: string,
                                   providerVersionId: string,
                                   onError: (err: AxiosError) => void)
    : ProviderVersionQueryResult => {
    const {data, isLoading, isError, error, isFetching} = useQuery<ProviderSummary, AxiosError>(
        `provider-${providerId}-version-${providerVersionId}`,
        async () => (await getProviderByIdAndVersionService(providerId, providerVersionId)).data,
        {
            onError: onError,
            cacheTime: milliseconds.OneDay,
            staleTime: milliseconds.OneDay,
            refetchOnWindowFocus: false,
            enabled: providerId && providerVersionId && providerId.length > 0 && providerVersionId.length > 0
        });

    return {
        providerVersion: data,
        isLoadingProviderVersion: isLoading,
        isFetchingProviderVersion: isFetching,
        isErrorLoadingProviderVersion: isError,
        errorLoadingProviderVersion: error
    };
};
