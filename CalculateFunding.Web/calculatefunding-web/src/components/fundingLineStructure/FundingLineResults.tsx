import {LoadingStatus} from "../LoadingStatus";
import {ApproveStatusButton} from "../ApproveStatusButton";
import {AutoComplete} from "../AutoComplete";
import {CollapsibleSteps, setCollapsibleStepsAllStepsStatus} from "../CollapsibleSteps";
import {
    FundingStructureType,
    IFundingStructureItem
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
    mapPublishedProviderFundingStructureItemsToFundingStructureItems,
    setExpandStatusByFundingLineName,
    setInitialExpandedStatus,
    updateFundingLineExpandStatus
} from "./FundingLineStructure";
import {
    getFundingLineStructureByProviderService,
    getFundingLineStructureService
} from "../../services/fundingStructuresService";
import {getPublishedProviderFundingStructureService} from "../../services/publishedProviderFundingLineService";

export interface FundingLineResultsProps {
    specificationId: string,
    fundingPeriodId: string,
    fundingStreamId: string,
    approvalStatus: PublishStatus,
    providerId?: string,
    providerVersionId?: string,
    addErrorMessage: (errorMessage: any, description?: string, fieldName?: string) => void,
    clearErrorMessages: (fieldNames?: string[]) => void,
    setApprovalStatusToApproved?: () => void,
}

export function FundingLineResults({
    specificationId,
    fundingPeriodId,
    fundingStreamId,
    approvalStatus,
    providerId,
    providerVersionId,
    addErrorMessage,
    clearErrorMessages,
    setApprovalStatusToApproved
}: FundingLineResultsProps) {
    const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
    const [isLoadingFundingLineStructure, setIsLoadingFundingLineStructure] = useState(true);
    const [fundingLineStructureError, setFundingLineStructureError] = useState<boolean>(false);
    const [fundingLinePublishStatus, setFundingLinePublishStatus] = useState<string>(PublishStatus.Draft.toString());
    const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
    const [fundingLines, setFundingLines] = useState<IFundingStructureItem[]>([]);
    const [fundingLinesOriginalData, setFundingLinesOriginalData] = useState<IFundingStructureItem[]>([]);
    const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState<boolean>();
    const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState<boolean>();
    const fundingLineStepReactRef = useRef(null);
    const nullReactRef = useRef(null);


    const handleApproveFundingLineStructure = async (specificationId: string) => {
        const response = await approveFundingLineStructureService(specificationId);
        if (response.status === 200) {
            setFundingLinePublishStatus(PublishStatus.Approved);
            if (setApprovalStatusToApproved) {
                setApprovalStatusToApproved();
            }
        } else {
            addErrorMessage(`Error whilst approving funding line structure: ${response.statusText} ${response.data}`, undefined, "funding-line-results");
            setFundingLinePublishStatus(approvalStatus);
        }
    };

    function searchFundingLines(calculationName: string) {
        const fundingLinesCopy: IFundingStructureItem[] = fundingLinesOriginalData as IFundingStructureItem[];
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
        const fundingLinesCopy: IFundingStructureItem[] = setExpandStatusByFundingLineName(fundingLines, expanded, name);
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
                setFundingLineSearchSuggestions(getDistinctOrderedFundingLineCalculations(fundingLines));
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

    const fetchData = async () => {
        setIsLoadingFundingLineStructure(true);
        try {
            if (specificationId !== "" && fundingPeriodId !== "" && fundingStreamId !== "") {
                let fundingStructureItems: IFundingStructureItem[];
                if (providerVersionId != null) {
                    const publishedProviderFundingStructure = (await getPublishedProviderFundingStructureService(providerVersionId)).data;
                    fundingStructureItems = mapPublishedProviderFundingStructureItemsToFundingStructureItems(publishedProviderFundingStructure.items);
                }
                else if (providerId != null) {
                    fundingStructureItems = (await getFundingLineStructureByProviderService(specificationId, fundingPeriodId, fundingStreamId, providerId)).data;
                }
                else {
                    fundingStructureItems = (await getFundingLineStructureService(specificationId, fundingPeriodId, fundingStreamId)).data;
                }

                setInitialExpandedStatus(fundingStructureItems, false);
                setFundingLines(fundingStructureItems);
                setFundingLinePublishStatus(approvalStatus);
                clearErrorMessages(["funding-line-results"]);
            }
        } catch (err) {
            setFundingLineStructureError(true);
            addErrorMessage(`A problem occurred while loading funding line structure: ${err.message}`, undefined, "funding-line-results");
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
                <ApproveStatusButton id={specificationId}
                    status={fundingLinePublishStatus}
                    callback={handleApproveFundingLineStructure} />
            </div>
            <div className="govuk-grid-column-two-thirds">
                <div className="govuk-form-group search-container">
                    <label className="govuk-label">
                        Search by calculation
                    </label>
                    <AutoComplete suggestions={fundingLineSearchSuggestions} callback={searchFundingLines} />
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
                        linkValue = `/app/Specifications/EditCalculation/${f.calculationId}`;
                    }
                    return <li key={"collapsible-steps-top" + index} className="collapsible-step step-is-shown">
                        <CollapsibleSteps
                            customRef={f.customRef}
                            key={"collapsible-steps" + index}
                            uniqueKey={index.toString()}
                            title={FundingStructureType[f.type]}
                            description={f.name}
                            status={(f.calculationPublishStatus && f.calculationPublishStatus !== '') ? f.calculationPublishStatus : ""}
                            step={f.level.toString()}
                            expanded={fundingLinesExpandedStatus || f.expanded}
                            link={linkValue}
                            hasChildren={f.fundingStructureItems != null}
                            callback={collapsibleStepsChanged}>
                            <FundingLineStep key={f.name.replace(" ", "") + index}
                                showResults={false}
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