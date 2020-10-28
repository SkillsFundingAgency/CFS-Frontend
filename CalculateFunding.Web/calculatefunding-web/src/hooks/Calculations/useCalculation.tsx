import {useQuery} from "react-query";
import {AxiosError} from "axios";
import {getCalculationByIdService} from "../../services/calculationService";
import {Calculation} from "../../types/CalculationSummary";


export type CalculationQueryResult = {
    calculation: Calculation | undefined,
    isLoadingCalculation: boolean,
}

export const useCalculation = (calculationId: string,
                                   onError: (err: AxiosError) => void)
    : CalculationQueryResult => {
    const {data, isLoading} = useQuery<Calculation, AxiosError>(
        `calculation-${calculationId}`,
        async () => (await getCalculationByIdService(calculationId)).data,
        {
            onError: onError,
            refetchOnWindowFocus: false,
            enabled: calculationId && calculationId.length > 0
        });

    return {
        calculation: data,
        isLoadingCalculation: isLoading,
    };
};
