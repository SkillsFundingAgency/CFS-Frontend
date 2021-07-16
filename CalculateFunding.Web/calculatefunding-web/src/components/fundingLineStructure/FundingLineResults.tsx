import {LoadingStatus} from "../LoadingStatus";
import {ApproveStatusButton} from "../ApproveStatusButton";
import {CollapsibleSteps, setCollapsibleStepsAllStepsStatus} from "../CollapsibleSteps";
import {
    FundingStructureType,
    FundingStructureItemViewModel
} from "../../types/FundingStructureItem";
import {FundingLineStep} from "./FundingLineStep";
import {BackToTop} from "../BackToTop";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {approveFundingLineStructureService} from "../../services/specificationService";
import {PublishStatus} from "../../types/PublishStatusModel";
import {
    checkIfShouldOpenAllSteps,
    expandCalculationsByName,
    getDistinctOrderedFundingLineCalculations,
    setExpandStatusByFundingLineName,
    setInitialExpandedStatus,
    updateFundingLineExpandStatus
} from "./FundingLineStructureHelper";
import {getFundingLineStructureService} from "../../services/fundingStructuresService";
import {getFundingStructureResultsForProviderAndSpecification} from "../../services/providerService";
import {InputSearch} from "../InputSearch";
import {getCalculationSummaryBySpecificationId} from "../../services/calculationService";
import {CalculationSummary} from "../../types/CalculationDetails";
import {ProviderResultForSpecification} from "../../types/Provider/ProviderResultForSpecification";
import {ValueFormatType} from "../../types/TemplateBuilderDefinitions";
import {formatNumber, NumberType} from "../FormattedNumber";
import {useCalculationCircularDependencies} from "../../hooks/Calculations/useCalculationCircularDependencies";
import {ErrorProps} from "../../hooks/useErrors";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {AddJobSubscription, JobSubscription} from "../../hooks/Jobs/useJobSubscription";

export interface FundingLineResultsProps {
    specificationId: string,
    fundingPeriodId: string,
    fundingStreamId: string,
    status: PublishStatus,
    providerId?: string,
    addError: (props: ErrorProps) => void,
    clearErrorMessages: (fieldNames?: string[]) => void,
    setStatusToApproved?: () => void,
    refreshFundingLines?: boolean | undefined,
    showApproveButton: boolean,
    useCalcEngine : boolean,
    jobTypes : JobType[]
}

export function FundingLineResults({
    specificationId,
    fundingPeriodId,
    fundingStreamId,
    status,
    providerId,
    addError,
    clearErrorMessages,
    setStatusToApproved,
    refreshFundingLines,
    jobTypes,
    showApproveButton = false,
    useCalcEngine = true
}: FundingLineResultsProps) {
    const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
    const [isLoadingFundingLineStructure, setIsLoadingFundingLineStructure] = useState(true);
    const [fundingLineStructureError, setFundingLineStructureError] = useState<boolean>(false);
    const [fundingLinePublishStatus, setFundingLinePublishStatus] = useState<string>(status);
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLines, setFundingLines] = useState<FundingStructureItemViewModel[]>([]);
    const [providerResults, setProviderResults] = useState<ProviderResultForSpecification>();
    const [calculationSummaries, setCalculationSummaries] = useState<CalculationSummary[]>();
    const [fundingStructureViewModelItems, setFundingStructureViewModelItems] = useState<FundingStructureItemViewModel[]>([]);
    const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState<boolean>();
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState<boolean>();
    const fundingLineStepReactRef = useRef(null);
    const nullReactRef = useRef(null);

    const {circularReferenceErrors, isLoadingCircularDependencies} =
        useCalculationCircularDependencies(specificationId,
            err => addError({error: err, description: "Error while checking for circular reference errors"}));

    const {latestJob} =
        useLatestSpecificationJobWithMonitoring(specificationId,
            jobTypes,
            err => addError({error: err, description: "Error while checking for assign template calculations job"}));

    const handleApproveFundingLineStructure = async (specificationId: string) => {
        const response = await approveFundingLineStructureService(specificationId);
        if (response.status === 200) {
            setFundingLinePublishStatus(PublishStatus.Approved);
            if (setStatusToApproved) {
                setStatusToApproved();
            }
        } else {
            addError({error: `${response.statusText} ${response.data}`, description: "Error whilst approving funding line structure", fieldName: "funding-line-results"});
            setFundingLinePublishStatus(status);
        }
    };

    const refreshFundingLinesRef = React.useRef(false);
    
    useEffect(() => {
        if (!refreshFundingLinesRef.current && refreshFundingLines) {
            fetchData();
        }
    }, [refreshFundingLines]);

    function searchFundingLines(calculationName: string) {
        const fundingLinesCopy: FundingStructureItemViewModel[] = fundingStructureViewModelItems as FundingStructureItemViewModel[];
        expandCalculationsByName(fundingLinesCopy, calculationName, fundingLineStepReactRef, nullReactRef);
        setFundingLines(fundingLinesCopy);
        setRerenderFundingLineSteps(true);
        if (checkIfShouldOpenAllSteps(fundingLinesCopy)) {
            openCloseAllFundingLines(true);
        }
    }

    function openCloseAllFundingLines(isOpen: boolean) {
        setFundingLinesExpandedStatus(isOpen);
        updateFundingLineExpandStatus(fundingLines, isOpen);
    }

    function collapsibleStepsChanged(expanded: boolean, name: string) {
        const fundingLinesCopy: FundingStructureItemViewModel[] = setExpandStatusByFundingLineName(fundingLines, expanded, name);
        setFundingLines(fundingLinesCopy);

        const collapsibleStepsAllStepsStatus = setCollapsibleStepsAllStepsStatus(fundingLinesCopy);
        if (collapsibleStepsAllStepsStatus.openAllSteps) {
            openCloseAllFundingLines(true);
        }
        if (collapsibleStepsAllStepsStatus.closeAllSteps) {
            openCloseAllFundingLines(false);
        }
    }

    useEffect(() => {
        setFundingLineRenderInternalState(true);
        if (fundingLines.length !== 0) {
            if (fundingStructureViewModelItems.length === 0) {
                setFundingLineSearchSuggestions([...getDistinctOrderedFundingLineCalculations(fundingLines)]);
                setFundingStructureViewModelItems(fundingLines);
            }
        }
    }, [fundingLines]);

    useEffect(() => {
        if (!fundingLineRenderInternalState) {
            return
        }
        if (fundingLineStepReactRef !== null && fundingLineStepReactRef.current !== null) {
            // @ts-ignore
            fundingLineStepReactRef.current.scrollIntoView({behavior: 'smooth', block: 'start'})
        }
        setFundingLineRenderInternalState(false);
    }, [fundingLineRenderInternalState]);

    useEffect(() => {
        if (!rerenderFundingLineSteps) {
            return
        }
        setFundingLineRenderInternalState(true);
        setRerenderFundingLineSteps(false);
    }, [rerenderFundingLineSteps]);

    useEffect(() => {
        fetchData();
    }, [specificationId]);

    useEffect(() => {
        if (fundingLines === undefined || calculationSummaries === undefined
            || circularReferenceErrors === undefined) return;
        appendData(fundingLines, calculationSummaries, providerResults);
    }, [providerResults, circularReferenceErrors, calculationSummaries, fundingLines]);

    function appendData(fundingStructureItems: FundingStructureItemViewModel[],
        calculationSummaries: CalculationSummary[], providerResults: ProviderResultForSpecification | undefined) {
        for (let item = 0; item < fundingStructureItems.length; item++) {
            const stack: FundingStructureItemViewModel[] = [];
            const hashMap: any = {};

            stack.push(fundingStructureItems[item]);

            while (stack.length !== 0) {
                const node = stack.pop();
                if (node && (node.fundingStructureItems === null || node.fundingStructureItems.length === 0)) {
                    visitNode(node, hashMap, calculationSummaries, providerResults);
                } else {
                    if (node && node.fundingStructureItems && node.fundingStructureItems.length > 0) {
                        for (let i: number = node.fundingStructureItems.length - 1; i >= 0; i--) {
                            stack.push(node.fundingStructureItems[i]);
                        }
                    }
                }

                node && visitNode(node, hashMap, calculationSummaries, providerResults);
            }
        }
        setIsLoadingFundingLineStructure(false);
    }

    function renderValue(value: number, calculationType: ValueFormatType): string {
        switch (calculationType) {
            case ValueFormatType.Currency:
                return formatNumber(value, NumberType.FormattedMoney, 2);
            case ValueFormatType.Percentage:
                return formatNumber(value, NumberType.FormattedPercentage, 0);
            case ValueFormatType.Number:
                return formatNumber(value, NumberType.FormattedDecimalNumber, 0);
        }
        return `${value}`;
    }

    function getCalculationErrorMessage(calculationId: string | null | undefined, exceptionMessage: string | null): string {
        if (calculationId && circularReferenceErrors) {
            const circularReferenceErrorMessage = 'Circular reference detected in calculation script';
            const hasCircularReferenceErrors: boolean = circularReferenceErrors.some((error) =>
                error.node.calculationid === calculationId
            );
            if (hasCircularReferenceErrors) {
                return exceptionMessage !== null && exceptionMessage.length > 0
                    ? `${circularReferenceErrorMessage}. ${exceptionMessage}`
                    : circularReferenceErrorMessage;
            }
        }
        return exceptionMessage !== null ? exceptionMessage : "";
    }

    function visitNode(node: FundingStructureItemViewModel, hashMap: any,
        calculationSummaries: CalculationSummary[], providerResults: ProviderResultForSpecification | undefined) {
        if (node.calculationId) {
            const calculationSummary = calculationSummaries.find(c => c.id === node.calculationId);
            node.calculationPublishStatus = calculationSummary?.status;
            if (providerResults) {
                const templateCalculationResult = providerResults.calculationResults[node.templateId];
                if (templateCalculationResult) {
                    node.errorMessage = getCalculationErrorMessage(node.calculationId, templateCalculationResult.exceptionMessage);
                    node.value = templateCalculationResult.value !== null ?
                        renderValue(templateCalculationResult.value, templateCalculationResult.valueFormat) : (providerId ? "Excluded" : "");
                }
            } else {
                node.errorMessage = getCalculationErrorMessage(node.calculationId, '');
            }
        }
        if (providerResults && node.type === FundingStructureType.FundingLine && !hashMap[`fun-${node.templateId}`]) {
            hashMap[`fun-${node.templateId}`] = true;
            node.errorMessage = '';
            const fundingLineResult = providerResults.fundingLineResults[node.templateId];
            if (fundingLineResult) {
                node.errorMessage = fundingLineResult.exceptionMessage !== null ? fundingLineResult.exceptionMessage : undefined;
                node.value = fundingLineResult.value !== null ?
                    renderValue(fundingLineResult.value, ValueFormatType.Currency) : (providerId ? "Excluded" : "");
            }
        }
    }

    const fetchData = async () => {
        try {
            if (specificationId !== "" && fundingPeriodId !== "" && fundingStreamId !== "") {
                const fundingLineStructureResponse = await getFundingLineStructureService(specificationId, fundingPeriodId, fundingStreamId);
                const fundingStructureItems: FundingStructureItemViewModel[] = fundingLineStructureResponse.data;
                setFundingLines(fundingStructureItems);
                setInitialExpandedStatus(fundingStructureItems, false);

                const calculationSummariesResponse = await getCalculationSummaryBySpecificationId(specificationId);
                setCalculationSummaries(calculationSummariesResponse.data);

                if (providerId) {
                    const providerResultsResponse = await getFundingStructureResultsForProviderAndSpecification(specificationId, providerId, useCalcEngine);
                    setProviderResults(providerResultsResponse.data);
                }

                clearErrorMessages(["funding-line-results"]);
            }
        } catch (err) {
            setIsLoadingFundingLineStructure(false);
            setFundingLineStructureError(true);
            addError({error: err, description: `A problem occurred while loading funding line structure`, fieldName: "funding-line-results"});
        }
    };

    function getLinkValue(calculationId: string | null | undefined, showApproveButton: boolean): string {
        if (calculationId) {
            return showApproveButton ? `/app/Specifications/EditCalculation/${calculationId}`
                : `/app/ViewCalculationResults/${calculationId}`;
        }

        return '';
    }

    return (
        <section className="govuk-tabs__panel" id="fundingline-structure">
            {(isLoadingFundingLineStructure || (latestJob && latestJob.isActive)) &&
                <LoadingStatus title={"Loading funding line structure"}
                    description={`${isLoadingFundingLineStructure ? 'Please wait whilst funding line structure is loading' : 'Please wait. A funding job is running.'}`} />}
            <div className="govuk-grid-row" hidden={!fundingLineStructureError}>
                <div className="govuk-grid-column-two-thirds">
                    <p className="govuk-error-message">An error has occurred. Please see above for details.</p>
                </div>
            </div>
            {!isLoadingFundingLineStructure && !isLoadingCircularDependencies &&
                !fundingLineStructureError &&
                !(latestJob && latestJob.isActive) &&
                <>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <h2 className="govuk-heading-l">Funding line structure
                            {showApproveButton && <ApproveStatusButton id={specificationId}
                                                                       status={fundingLinePublishStatus}
                                                                       callback={handleApproveFundingLineStructure} />}
                            </h2>
                        </div>
                        <div className="govuk-grid-column-one-third">
                        </div>
                        <div className="govuk-grid-column-two-thirds">
                            <div className="govuk-form-group search-container">
                                <label className="govuk-label">
                                    Search by calculation
                                </label>
                                <InputSearch id={"input-auto-complete"} suggestions={fundingLineSearchSuggestions} callback={searchFundingLines} />
                            </div>
                        </div>
                    </div>
                    <div className="govuk-accordion__controls">
                        <button type="button" className="govuk-accordion__open-all"
                            aria-expanded="false"
                            onClick={() => openCloseAllFundingLines(true)}
                            hidden={fundingLinesExpandedStatus}>Open all<span
                                className="govuk-visually-hidden"> sections</span></button>
                        <button type="button" className="govuk-accordion__open-all"
                            aria-expanded="true"
                            onClick={() => openCloseAllFundingLines(false)}
                            hidden={!fundingLinesExpandedStatus}>Close all<span
                                className="govuk-visually-hidden"> sections</span></button>
                    </div>
                    <ul className="collapsible-steps">
                        {
                            fundingLines.map((f, index) => {
                                let linkValue: string = getLinkValue(f.calculationId, showApproveButton);
                                return <li key={"collapsible-steps-top" + index} className="collapsible-step step-is-shown">
                                    <CollapsibleSteps
                                        customRef={f.customRef}
                                        key={"collapsible-steps" + index}
                                        uniqueKey={index.toString()}
                                        title={f.type === FundingStructureType.FundingLine ? "Funding Line" : f.type}
                                        value={f.value != null ? f.value : ""}
                                        description={f.name}
                                        status={f.calculationPublishStatus}
                                        step={f.level.toString()}
                                        expanded={fundingLinesExpandedStatus || f.expanded === true}
                                        link={linkValue}
                                        hasChildren={f.fundingStructureItems != null}
                                        callback={collapsibleStepsChanged}
                                        calculationErrorMessage={f.errorMessage}
                                        providerId={providerId}>
                                        <FundingLineStep
                                            key={f.name.replace(" ", "") + index}
                                            showResults={!showApproveButton}
                                            expanded={fundingLinesExpandedStatus}
                                            fundingStructureItem={f}
                                            callback={collapsibleStepsChanged}
                                            providerId={providerId} />
                                    </CollapsibleSteps>
                                </li>
                            })}
                    </ul>
                </>}
            <BackToTop id={"fundingline-structure"} hidden={fundingLines.length === 0} />
        </section>
    )
}