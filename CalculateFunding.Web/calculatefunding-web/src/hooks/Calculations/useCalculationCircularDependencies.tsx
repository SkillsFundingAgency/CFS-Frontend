import {useQuery} from "react-query";
import {AxiosError} from "axios";
import {getCalculationCircularDependencies} from "../../services/calculationService";
import {CircularReferenceError} from "../../types/Calculations/CircularReferenceError";


export type CalculationCircularDependenciesQueryResult = {
    circularReferenceErrors: CircularReferenceError[] | undefined,
    isLoadingCircularDependencies: boolean
}

export const useCalculationCircularDependencies = (specificationId: string,
                               onError: (err: AxiosError) => void)
    : CalculationCircularDependenciesQueryResult => {
    const {data, isLoading} = useQuery<CircularReferenceError[], AxiosError>(
        `calculation-circular-ref-check-${specificationId}`,
        async () => (await getCalculationCircularDependencies(specificationId)).data,
        {
            onError: onError,
            refetchOnWindowFocus: false,
            enabled: specificationId && specificationId.length > 0
        });

    return {
        circularReferenceErrors: data,
        isLoadingCircularDependencies: isLoading,
    };
};
