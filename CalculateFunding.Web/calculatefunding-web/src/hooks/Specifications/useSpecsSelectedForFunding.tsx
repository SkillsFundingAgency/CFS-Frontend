import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { milliseconds } from "../../helpers/TimeInMs";
import * as specificationService from "../../services/specificationService";
import { Specification } from "../../types/viewFundingTypes";

export type SpecificationsSelectedResult = {
    selectedSpecifications: Specification[] | undefined;
    isLoadingSelectedSpecifications: boolean;
}

export const useSpecsSelectedForFunding = (
    fundingPeriodId: string | undefined,
    fundingStreamId: string | undefined,
    options?: Omit<UseQueryOptions<Specification[], AxiosError>, "queryFn">) : SpecificationsSelectedResult => {

    const results = useQuery<Specification[],
        AxiosError>(["selected-specifications", fundingStreamId, fundingPeriodId],
        async () => (
            await specificationService.getSpecificationsSelectedForFundingByPeriodAndStreamService(
                fundingPeriodId as string,
                fundingStreamId as string
            )).data,
        {
            enabled: !!fundingStreamId?.length && !!fundingPeriodId?.length,
            ...options,
        }
    )
    const { data, isLoading } = results;

    return { selectedSpecifications: data, isLoadingSelectedSpecifications: isLoading }

}
