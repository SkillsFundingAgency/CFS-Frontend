import { AxiosError } from "axios";
import {QueryConfig, useQuery} from "react-query";
import {getSpecificationsSelectedForFundingService} from "../../services/specificationService";
import {FundingStreamWithSpecificationSelectedForFunding} from "../../types/SpecificationSelectedForFunding";

export type OptionsForSpecificationsSelectedForFundingResult = {
    fundingStreams: FundingStreamWithSpecificationSelectedForFunding[] | undefined,
    isLoadingOptions: boolean,
    errorCheckingForOptions: string,
    isErrorCheckingForOptions: boolean
}
export const useOptionsForSpecificationsSelectedForFunding = (
    queryConfig: QueryConfig<FundingStreamWithSpecificationSelectedForFunding[], AxiosError> = {}) 
    : OptionsForSpecificationsSelectedForFundingResult => {
        const {data, isLoading, isError, error} = useQuery<FundingStreamWithSpecificationSelectedForFunding[], AxiosError>(
            `options-for-specifications-selected-for-funding`,
            async () => (await getSpecificationsSelectedForFundingService()).data,
            queryConfig);
    return {fundingStreams: data, isLoadingOptions: isLoading, isErrorCheckingForOptions: isError, errorCheckingForOptions: !isError ? "" : error ? error.message : ""};
};