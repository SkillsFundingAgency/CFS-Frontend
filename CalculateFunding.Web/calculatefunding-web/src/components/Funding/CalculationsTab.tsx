import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { useErrorContext } from "../../context/ErrorContext";
import { useCalculationCircularDependencies } from "../../hooks/Calculations/useCalculationCircularDependencies";
import { useJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import { getCalculationSummaryBySpecificationId } from "../../services/calculationService";
import { getFundingLineStructureService } from "../../services/fundingStructuresService";
import { getFundingStructureResultsForProviderAndSpecification } from "../../services/providerService";
import { CalculationSummary } from "../../types/CalculationDetails";
import { FundingStructureItemViewModel, FundingStructureType } from "../../types/FundingStructureItem";
import { MonitorFallback, MonitorMode } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import { ProviderResultForSpecification } from "../../types/Provider/ProviderResultForSpecification";
import { ProviderTransactionSummary } from "../../types/ProviderSummary";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { ValueFormatType } from "../../types/TemplateBuilderDefinitions";
import { BackToTop } from "../BackToTop";
import { CollapsibleSteps, setCollapsibleStepsAllStepsStatus } from "../CollapsibleSteps";
import { formatNumber, NumberType } from "../FormattedNumber";
import { FundingLineStep } from "../fundingLineStructure/FundingLineStep";
import {
  checkIfShouldOpenAllSteps,
  expandCalculationsByName,
  getDistinctOrderedFundingLineCalculations,
  setExpandStatusByFundingLineName,
  setInitialExpandedStatus,
  updateFundingLineExpandStatus,
} from "../fundingLineStructure/FundingLineStructureHelper";
import { InputSearch } from "../InputSearch";
import { LoadingStatus } from "../LoadingStatus";

export interface CalculationsTabProps {
  specification: SpecificationSummary;
  providerId: string;
  transactions: ProviderTransactionSummary | undefined;
}

export function CalculationsTab({ specification, providerId, transactions }: CalculationsTabProps) {
  const { addErrorToContext: addError, clearErrorsFromContext: clearErrorMessages } = useErrorContext();
  const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
  const [isLoadingFundingLineStructure, setIsLoadingFundingLineStructure] = useState(true);
  const [fundingLineStructureError, setFundingLineStructureError] = useState<boolean>(false);
  const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
  const [fundingLines, setFundingLines] = useState<FundingStructureItemViewModel[]>([]);
  const [providerResults, setProviderResults] = useState<ProviderResultForSpecification>();
  const [calculationSummaries, setCalculationSummaries] = useState<CalculationSummary[]>();
  const [fundingStructureViewModelItems, setFundingStructureViewModelItems] = useState<
    FundingStructureItemViewModel[]
  >([]);
  const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState<boolean>();
  const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState<boolean>();
  const fundingLineStepReactRef = useRef(null);
  const nullReactRef = useRef(null);

  const { circularReferenceErrors, isLoadingCircularDependencies } = useCalculationCircularDependencies(
    specification.id,
    (err) => addError({ error: err, description: "Error while checking for circular reference errors" })
  );

  const {
    addSub,
    removeAllSubs,
    results: jobNotifications,
  } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring background jobs" }),
  });

  function searchFundingLines(calculationName: string) {
    const fundingLinesCopy: FundingStructureItemViewModel[] =
      fundingStructureViewModelItems as FundingStructureItemViewModel[];
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
    const fundingLinesCopy: FundingStructureItemViewModel[] = setExpandStatusByFundingLineName(
      fundingLines,
      expanded,
      name
    );
    setFundingLines(fundingLinesCopy);

    const collapsibleStepsAllStepsStatus = setCollapsibleStepsAllStepsStatus(fundingLinesCopy);
    if (collapsibleStepsAllStepsStatus.openAllSteps) {
      openCloseAllFundingLines(true);
    }
    if (collapsibleStepsAllStepsStatus.closeAllSteps) {
      openCloseAllFundingLines(false);
    }
  }

  function appendData(
    fundingStructureItems: FundingStructureItemViewModel[],
    calculationSummaries: CalculationSummary[],
    providerResults: ProviderResultForSpecification | undefined
  ) {
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

            node && visitNode(node, hashMap, calculationSummaries, providerResults);
          }
        }
        setIsLoadingFundingLineStructure(false);
      }
    }
  }

  function renderValue(value: number, calculationType: ValueFormatType): string {
    switch (calculationType) {
      case ValueFormatType.Currency:
        return formatNumber(value, NumberType.FormattedMoney, 2, true);
      case ValueFormatType.Percentage:
        return formatNumber(value, NumberType.FormattedPercentage, 0, true);
      case ValueFormatType.Number:
        return formatNumber(value, NumberType.FormattedDecimalNumber, 0, true);
    }
    return `${value}`;
  }

  function getCalculationErrorMessage(
    calculationId: string | null | undefined,
    exceptionMessage: string | null
  ): string {
    if (calculationId && circularReferenceErrors) {
      const circularReferenceErrorMessage = "Circular reference detected in calculation script";
      const hasCircularReferenceErrors: boolean = circularReferenceErrors.some(
        (error) => error.node.calculationid === calculationId
      );
      if (hasCircularReferenceErrors) {
        return exceptionMessage !== null && exceptionMessage.length > 0
          ? `${circularReferenceErrorMessage}. ${exceptionMessage}`
          : circularReferenceErrorMessage;
      }
    }
    return exceptionMessage !== null ? exceptionMessage : "";
  }

  function visitNode(
    node: FundingStructureItemViewModel,
    hashMap: any,
    calculationSummaries: CalculationSummary[],
    providerResults: ProviderResultForSpecification | undefined
  ) {
    if (node.calculationId) {
      const calculationSummary = calculationSummaries.find((c) => c.id === node.calculationId);
      node.calculationPublishStatus = calculationSummary?.status;
      if (providerResults) {
        const templateCalculationResult = providerResults.calculationResults[node.templateId];
        if (templateCalculationResult) {
          node.errorMessage = getCalculationErrorMessage(
            node.calculationId,
            templateCalculationResult.exceptionMessage
          );
          node.value =
            templateCalculationResult.value !== null
              ? renderValue(templateCalculationResult.value, templateCalculationResult.valueFormat)
              : providerId
              ? "Excluded"
              : "";
        }
      } else {
        node.errorMessage = getCalculationErrorMessage(node.calculationId, "");
      }
    }
    if (
      providerResults &&
      node.type === FundingStructureType.FundingLine &&
      !hashMap[`fun-${node.templateId}`]
    ) {
      hashMap[`fun-${node.templateId}`] = true;
      node.errorMessage = "";
      const fundingLineResult = providerResults.fundingLineResults[node.templateId];
      if (fundingLineResult) {
        node.errorMessage =
          fundingLineResult.exceptionMessage !== null ? fundingLineResult.exceptionMessage : undefined;
        node.value =
          fundingLineResult.value !== null
            ? renderValue(fundingLineResult.value, ValueFormatType.Currency)
            : providerId
            ? "Excluded"
            : "";
      }
    }
  }

  const fetchData = async () => {
    try {
      const fundingLineStructureResponse = await getFundingLineStructureService(
        specification.id,
        specification.fundingPeriod.id,
        specification.fundingStreams[0].id
      );
      const fundingStructureItems: FundingStructureItemViewModel[] = fundingLineStructureResponse.data;
      setFundingLines(fundingStructureItems);
      setInitialExpandedStatus(fundingStructureItems, false);

      const calculationSummariesResponse = await getCalculationSummaryBySpecificationId(specification.id);
      setCalculationSummaries(calculationSummariesResponse.data);

      if (providerId) {
        const providerResultsResponse = await getFundingStructureResultsForProviderAndSpecification(
          specification.id,
          providerId,
          true
        );
        setProviderResults(providerResultsResponse.data);
      }

      clearErrorMessages(["funding-line-results"]);
    } catch (err: any) {
      setIsLoadingFundingLineStructure(false);
      setFundingLineStructureError(true);
      addError({
        error: err,
        description: "A problem occurred while loading funding line structure",
        fieldName: "funding-line-results",
      });
    }
  };

  useEffect(() => {
    fetchData();

    // monitor background jobs
    addSub({
      filterBy: {
        specificationId: specification.id,
        jobTypes: [
          JobType.RefreshFundingJob,
          JobType.ApproveAllProviderFundingJob,
          JobType.ApproveBatchProviderFundingJob,
          JobType.PublishAllProviderFundingJob,
          JobType.PublishBatchProviderFundingJob,
          JobType.PublishedFundingUndoJob,
        ],
      },
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      onError: (err) => addError({ error: err, description: "Error while checking for background jobs" }),
    });

    return () => removeAllSubs();
  }, []);

  useEffect(() => {
    setFundingLineRenderInternalState(true);
    if (fundingLines.length !== 0) {
      setFundingLineSearchSuggestions([...getDistinctOrderedFundingLineCalculations(fundingLines)]);
      setFundingStructureViewModelItems(fundingLines);
    }
  }, [fundingLines]);

  useEffect(() => {
    if (!fundingLineRenderInternalState) {
      return;
    }
    if (fundingLineStepReactRef !== null && fundingLineStepReactRef.current !== null) {
      // @ts-ignore
      fundingLineStepReactRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setFundingLineRenderInternalState(false);
  }, [fundingLineRenderInternalState]);

  useEffect(() => {
    if (!rerenderFundingLineSteps) {
      return;
    }
    setFundingLineRenderInternalState(true);
    setRerenderFundingLineSteps(false);
  }, [rerenderFundingLineSteps]);

  useEffect(() => {
    if (
      fundingLines === undefined ||
      calculationSummaries === undefined ||
      circularReferenceErrors === undefined
    )
      return;
    appendData(fundingLines, calculationSummaries, providerResults);
  }, [providerResults, circularReferenceErrors, calculationSummaries, fundingLines]);

  const activeJob = jobNotifications.find((n) => n.latestJob?.isActive)?.latestJob;

  return (
    <section className="govuk-tabs__panel" id="fundingline-structure">
      {(isLoadingFundingLineStructure || !!activeJob) && (
        <LoadingStatus
          title={"Loading funding line structure"}
          description={`${
            isLoadingFundingLineStructure
              ? "Please wait whilst calculations are loading"
              : "Please wait. A funding job is running."
          }`}
        />
      )}
      <div className="govuk-grid-row" hidden={!fundingLineStructureError}>
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-error-message">An error has occurred. Please see above for details.</p>
        </div>
      </div>
      {!isLoadingFundingLineStructure &&
        !isLoadingCircularDependencies &&
        !fundingLineStructureError &&
        !activeJob && (
          <>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <h2 className="govuk-heading-l govuk-!-margin-bottom-1">Calculations</h2>
                {!!transactions?.results?.length && (
                  <span className="govuk-caption-m govuk-!-margin-bottom-7">
                    {`Showing calculation results for version 
                  ${transactions.results[0].majorVersion}.${transactions.results[0].minorVersion} 
                  (${transactions.latestStatus})`}
                  </span>
                )}
              </div>
              <div className="govuk-grid-column-one-third"></div>
              <div className="govuk-grid-column-two-thirds">
                <div className="govuk-form-group search-container">
                  <label className="govuk-label">Search by calculation</label>
                  <InputSearch
                    id={"input-auto-complete"}
                    suggestions={fundingLineSearchSuggestions}
                    callback={searchFundingLines}
                  />
                </div>
              </div>
            </div>
            <div className="govuk-accordion__controls">
              <button
                type="button"
                className="govuk-accordion__open-all"
                aria-expanded="false"
                onClick={() => openCloseAllFundingLines(true)}
                hidden={fundingLinesExpandedStatus}
              >
                Open all<span className="govuk-visually-hidden"> sections</span>
              </button>
              <button
                type="button"
                className="govuk-accordion__open-all"
                aria-expanded="true"
                onClick={() => openCloseAllFundingLines(false)}
                hidden={!fundingLinesExpandedStatus}
              >
                Close all<span className="govuk-visually-hidden"> sections</span>
              </button>
            </div>
            <ul className="collapsible-steps">
              {fundingLines.map((f, index) => (
                <li key={"collapsible-steps-top" + index} className="collapsible-step step-is-shown">
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
                    link={f.calculationId ? `/app/ViewCalculationResults/${f.calculationId}` : ""}
                    hasChildren={f.fundingStructureItems != null}
                    callback={collapsibleStepsChanged}
                    calculationErrorMessage={f.errorMessage}
                    providerId={providerId}
                  >
                    <FundingLineStep
                      key={f.name.replace(" ", "") + index}
                      showResults={true}
                      expanded={fundingLinesExpandedStatus}
                      fundingStructureItem={f}
                      callback={collapsibleStepsChanged}
                      providerId={providerId}
                    />
                  </CollapsibleSteps>
                </li>
              ))}
            </ul>
          </>
        )}
      <BackToTop id={"fundingline-structure"} hidden={fundingLines.length === 0} />
    </section>
  );
}
