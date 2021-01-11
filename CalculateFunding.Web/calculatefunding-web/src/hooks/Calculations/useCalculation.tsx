import {useQuery} from "react-query";
import {AxiosError} from "axios";
import {getCalculationByIdService} from "../../services/calculationService";
import {CalculationDetails} from "../../types/CalculationDetails";


export type CalculationQueryResult = {
    calculation: CalculationDetails | undefined,
    isLoadingCalculation: boolean,
}

export const useCalculation = (calculationId: string,
                               onError: (err: AxiosError) => void,
                               onSuccess?: (data: CalculationDetails) => void)
    : CalculationQueryResult => {
    const {data, isLoading} = useQuery<CalculationDetails, AxiosError>(
        `calculation-${calculationId}`,
        async () => (await getCalculationByIdService(calculationId)).data,
        {
            onError: onError,
            onSuccess: onSuccess,
            refetchOnWindowFocus: false,
            enabled: (calculationId && calculationId.length > 0) === true
        });

    return {
        calculation: data,
        isLoadingCalculation: isLoading,
    };
};
