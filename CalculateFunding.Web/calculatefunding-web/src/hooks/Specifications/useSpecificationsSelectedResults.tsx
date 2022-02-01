import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { milliseconds } from "../../helpers/TimeInMs";
import * as specificationService from "../../services/specificationService";
import { Specification } from "../../types/viewFundingTypes";

export const useSpecificationsSelectedResults = (
    fundingPeriodId: string | undefined,
    fundingStreamId: string | undefined,
    options?: Omit<UseQueryOptions<Specification[], AxiosError>, "queryFn">) => {

    const results = useQuery<Specification[],
        AxiosError>(["selected-specifications", fundingStreamId, fundingPeriodId],
        async () => (
            await specificationService.getSpecificationsSelectedForFundingByPeriodAndStreamService(
                fundingPeriodId as string,
                fundingStreamId as string
            )).data,
        {
            enabled: !!fundingStreamId?.length && !!fundingPeriodId?.length,
            cacheTime: milliseconds.OneDay,
            staleTime: milliseconds.TenSeconds,
            ...options,
        }
    )
    const { data, isLoading } = results;

    return { selectedSpecifications: data, isLoadingSelectedSpecifications: isLoading, ...results }

}
