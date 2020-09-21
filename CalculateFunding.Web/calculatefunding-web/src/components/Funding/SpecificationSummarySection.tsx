import React, {useEffect, useState} from "react";
import {LoadingStatus} from "../LoadingStatus";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {AxiosError} from "axios";

export interface ISpecificationSummarySectionProps {
    specificationId: string,
    specification: SpecificationSummary | undefined,
    setSpecification: (spec: SpecificationSummary) => void,
    addError: (errorMessage: string, fieldName?: string) => void
}

export function SpecificationSummarySection(props: ISpecificationSummarySectionProps) {
    const [isLoadingSpec, setIsLoadingSpec] = useState<boolean>(true);

    useEffect(() => {
        getSpecificationSummaryService(props.specificationId)
            .then((result) => props.setSpecification(result.data))
            .catch((err: AxiosError) => props.addError(`Error while fetching specification details: ${err.message}`))
            .finally(() => setIsLoadingSpec(false));
    }, [props.specificationId]);

    if (isLoadingSpec) {
        return (<LoadingStatus title={`Loading specification`} testid='loadingSpecification'/>);
    } else {
        if (props.specification) {
            return (
                <>
                    <span className="govuk-caption-xl">Specification</span>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2" data-testid="specName">{props.specification.name}</h1>
                    <span className="govuk-caption-m">Funding period</span>
                    <h1 className="govuk-heading-m" data-testid="fundingPeriodName">{props.specification.fundingPeriod.name}</h1>
                    <span className="govuk-caption-m">Funding stream</span>
                    <h1 className="govuk-heading-m" data-testid="fundingStreamName">{props.specification.fundingStreams[0].name}</h1>
                </>
            );
        } else {
            return null;
        }
    }
}