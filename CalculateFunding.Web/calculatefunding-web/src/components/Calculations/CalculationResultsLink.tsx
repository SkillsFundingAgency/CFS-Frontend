import React, {useEffect, useState} from "react";
import {CalculationProviderResultList} from "../../types/CalculationProviderResult";
import {getCalculationProvidersService} from "../../services/calculationService";
import {Link} from "react-router-dom";
import {LoadingFieldStatus} from "../LoadingFieldStatus";

export function CalculationResultsLink(props: { calculationId: string }) {
    const [calculationProvidersResult, setCalculationProvidersResult] = useState<CalculationProviderResultList>({
        calculationProviderResults: [],
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        pagerState: {
            previousPage: 0,
            nextPage: 0,
            displayNumberOfPages: 0,
            pages: [],
            lastPage: 0,
            currentPage: 0
        },
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: -1
    })
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (props.calculationId !== "") {
            getCalculationProvidersService({
                calculationValueType: "",
                errorToggle: "",
                facetCount: 0,
                includeFacets: false,
                localAuthority: [],
                pageNumber: 1, pageSize: 1,
                providerSubType: [], providerType: [], resultsStatus: [], searchMode: "All", searchTerm: "",
                calculationId: props.calculationId

            }).then((calculationProvidersResponse) => {
                setCalculationProvidersResult(calculationProvidersResponse.data as CalculationProviderResultList);
                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            });
        }
    }, [props.calculationId])

    return <>
        <LoadingFieldStatus title={"Checking for calculation results"} hidden={!isLoading} />
        <Link to={`/ViewCalculationResults/${props.calculationId}`} className="govuk-link" hidden={isLoading || calculationProvidersResult.totalResults < 1}>View calculation results</Link>
        <div hidden={isLoading || calculationProvidersResult.totalResults !== 0}>
            <span className="govuk-error-message">There are currently no calculation results available</span>
        </div>
    </>
}