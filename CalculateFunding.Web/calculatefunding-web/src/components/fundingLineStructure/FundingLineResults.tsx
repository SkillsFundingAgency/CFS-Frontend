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
import {AxiosError} from "axios";
import {getFundingStructureResultsForProviderAndSpecification} from "../../services/providerService";
import {InputSearch} from "../InputSearch";
import {getCalculationSummaryBySpecificationId} from "../../services/calculationService";
import {CalculationSummary} from "../../types/CalculationDetails";
import {ProviderResultForSpecification} from "../../types/Provider/ProviderResultForSpecification";
import {ValueFormatType} from "../../types/TemplateBuilderDefinitions";
import {formatNumber, NumberType} from "../FormattedNumber";

export interface FundingLineResultsProps {
    specificationId: string,
    fundingPeriodId: string,
    fundingStreamId: string,
    status: PublishStatus,
    providerId?: string,
    addError: (errorMessage: AxiosError | Error | string, description?: string, fieldName?: string) => void,
    clearErrorMessages: (fieldNames?: string[]) => void,
    setStatusToApproved?: () => void,
    refreshFundingLines?: boolean | undefined,
    showApproveButton: boolean,
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
    showApproveButton = false
}: FundingLineResultsProps) {
    const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
    const [isLoadingFundingLineStructure, setIsLoadingFundingLineStructure] = useState(true);
    const [fundingLineStructureError, setFundingLineStructureError] = useState<boolean>(false);
    const [fundingLinePublishStatus, setFundingLinePublishStatus] = useState<string>(PublishStatus.Draft.toString());
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLines, setFundingLines] = useState<FundingStructureItemViewModel[]>([]);
    const [fundingLinesOriginalData, setFundingLinesOriginalData] = useState<FundingStructureItemViewModel[]>([]);
    const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState<boolean>();
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState<boolean>();
    const fundingLineStepReactRef = useRef(null);
    const nullReactRef = useRef(null);

    const handleApproveFundingLineStructure = async (specificationId: string) => {
        const response = await approveFundingLineStructureService(specificationId);
        if (response.status === 200) {
            setFundingLinePublishStatus(PublishStatus.Approved);
            if (setStatusToApproved) {
                setStatusToApproved();
            }
        } else {
            addError(`${response.statusText} ${response.data}`, "Error whilst approving funding line structure", "funding-line-results");
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
        const fundingLinesCopy: FundingStructureItemViewModel[] = fundingLinesOriginalData as FundingStructureItemViewModel[];
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
            if (fundingLinesOriginalData.length === 0) {
                setFundingLineSearchSuggestions([...getDistinctOrderedFundingLineCalculations(fundingLines)]);
                setFundingLinesOriginalData(fundingLines);
            }
            setIsLoadingFundingLineStructure(false);
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
    }, [specificationId])

    async function appendData(fundingStructureItems: FundingStructureItemViewModel[],
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
    }

    function renderValue(value: number, calculationType: ValueFormatType): string {
        switch(calculationType) {
            case ValueFormatType.Currency:
                return formatNumber(value, NumberType.FormattedMoney, 0);
            case ValueFormatType.Percentage:
                return formatNumber(value, NumberType.FormattedPercentage, 0);
        }
        return `${value}`;
    }

    function visitNode(node: FundingStructureItemViewModel, hashMap: any,
        calculationSummaries: CalculationSummary[], providerResults: ProviderResultForSpecification | undefined) {
        if (node.calculationId && !hashMap[`calc-${node.calculationId}`]) {
            hashMap[`calc-${node.calculationId}`] = true;
            const calculationSummary = calculationSummaries.find(c => c.id === node.calculationId);
            node.calculationPublishStatus = calculationSummary?.status;
            if (providerResults) {
                const templateCalculationResult = providerResults.calculationResults[node.templateId];
                if (templateCalculationResult) {
                    node.value = templateCalculationResult.value !== null ?
                        renderValue(templateCalculationResult.value, templateCalculationResult.valueFormat) : "";
                }
            }
        }
        if (providerResults && node.fundingLineCode && !hashMap[`fun-${node.fundingLineCode}`]) {
            hashMap[`fun-${node.fundingLineCode}`] = true;
            const fundingLineResult = providerResults.fundingLineResults[node.templateId];
            if (fundingLineResult) {
                node.value = fundingLineResult.value !== null ?
                    renderValue(fundingLineResult.value, ValueFormatType.Currency) : "";
            }
        }
    }

    const fetchData = async () => {
        setIsLoadingFundingLineStructure(true);
        try {
            if (specificationId !== "" && fundingPeriodId !== "" && fundingStreamId !== "") {
                const fundingLineStructureResponse = await getFundingLineStructureService(specificationId, fundingPeriodId, fundingStreamId);
                const fundingStructureItems: FundingStructureItemViewModel[] = fundingLineStructureResponse.data;
                const calculationSummariesResponse = await getCalculationSummaryBySpecificationId(specificationId);
                const calculationSummaries: CalculationSummary[] = calculationSummariesResponse.data;

                let providerResults: ProviderResultForSpecification | undefined = undefined;

                if (providerId) {
                    const providerResultsResponse = await getFundingStructureResultsForProviderAndSpecification(specificationId, providerId);
                    providerResults = providerResultsResponse.data;
                }

                appendData(fundingStructureItems, calculationSummaries, providerResults);

                setInitialExpandedStatus(fundingStructureItems, false);
                setFundingLines(fundingStructureItems);
                setFundingLinePublishStatus(status);
                clearErrorMessages(["funding-line-results"]);
            }
        } catch (err) {
            setFundingLineStructureError(true);
            addError(err, `A problem occurred while loading funding line structure`, "funding-line-results");
        } finally {
            setIsLoadingFundingLineStructure(false);
        }
    };

    return <section className="govuk-tabs__panel" id="fundingline-structure">
        <LoadingStatus title={"Loading funding line structure"}
            hidden={!isLoadingFundingLineStructure}
            description={"Please wait whilst funding line structure is loading"} />
        <div className="govuk-grid-row" hidden={!fundingLineStructureError}>
            <div className="govuk-grid-column-two-thirds">
                <p className="govuk-error-message">An error has occurred. Please see above for details.</p>
            </div>
        </div>
        <div className="govuk-grid-row" hidden={isLoadingFundingLineStructure || fundingLineStructureError}>
            <div className="govuk-grid-column-two-thirds">
                <h2 className="govuk-heading-l">Funding line structure</h2>
            </div>
            <div className="govuk-grid-column-one-third">
                {showApproveButton && <ApproveStatusButton id={specificationId}
                    status={fundingLinePublishStatus}
                    callback={handleApproveFundingLineStructure} />}
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
        <div className="govuk-accordion__controls" hidden={isLoadingFundingLineStructure || fundingLineStructureError}>
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
                    let linkValue = '';
                    if (f.calculationId != null && f.calculationId !== '') {
                        linkValue = showApproveButton ? `/app/Specifications/EditCalculation/${f.calculationId}` : `/app/ViewCalculationResults/${f.calculationId}`;
                    }
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
                            callback={collapsibleStepsChanged}>
                            <FundingLineStep
                                key={f.name.replace(" ", "") + index}
                                showResults={!showApproveButton}
                                expanded={fundingLinesExpandedStatus}
                                fundingStructureItem={f}
                                callback={collapsibleStepsChanged} />
                        </CollapsibleSteps>
                    </li>
                })}
        </ul>
        <BackToTop id={"fundingline-structure"} hidden={fundingLines.length === 0} />
    </section>
}