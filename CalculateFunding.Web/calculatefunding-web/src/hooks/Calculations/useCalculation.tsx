import {useQuery} from "react-query";
import {AxiosError} from "axios";
import {getCalculationByIdService} from "../../services/calculationService";
import {CalculationDetails} from "../../types/CalculationDetails";


export type CalculationQueryResult = {
    calculation: CalculationDetails | undefined,
    isLoadingCalculation: boolean,
}

export const useCalculation = (calculationId: string,
                                   onError: (err: AxiosError) => void)
    : CalculationQueryResult => {
    const {data, isLoading} = useQuery<CalculationDetails, AxiosError>(
        `calculation-${calculationId}`,
        async () => (await getCalculationByIdService(calculationId)).data,
        {
            onError: onError,
            refetchOnWindowFocus: false,
            enabled: calculationId !== undefined && calculationId.length > 0
        });

    return {
        calculation: data,
        isLoadingCalculation: isLoading,
    };
};
