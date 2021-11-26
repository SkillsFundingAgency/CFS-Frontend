﻿import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { useErrorContext } from "../../context/ErrorContext";
import { useCalculationCircularDependencies } from "../../hooks/Calculations/useCalculationCircularDependencies";
import { getCalculationSummaryBySpecificationId } from "../../services/calculationService";
import { getFundingLineStructureService } from "../../services/fundingStructuresService";
import { approveFundingLineStructureService } from "../../services/specificationService";
import { CalculationSummary } from "../../types/CalculationDetails";
import { FundingStructureItemViewModel, FundingStructureType } from "../../types/FundingStructureItem";
import { JobDetails } from "../../types/jobDetails";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { ApproveStatusButton } from "../ApproveStatusButton";
import { BackToTop } from "../BackToTop";
import { CollapsibleSteps, setCollapsibleStepsAllStepsStatus } from "../CollapsibleSteps";
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

export interface SpecificationFundingLineResultsProps {
  specification: SpecificationSummary;
  refreshFundingLines?: boolean | undefined;
  activeJob?: JobDetails;
  clearSpecificationFromCache: () => Promise<void>;
  monitorAssignTemplateCalculationsJob: () => Promise<void>;
}

export function SpecificationFundingLineResults({
  specification,
  refreshFundingLines,
  clearSpecificationFromCache,
  monitorAssignTemplateCalculationsJob,
  activeJob,
}: SpecificationFundingLineResultsProps) {
  const { addErrorToContext: addError, clearErrorsFromContext: clearErrorMessages } = useErrorContext();
  const [fundingLinesExpandedStatus, setFundingLinesExpandedStatus] = useState(false);
  const [isLoadingFundingLineStructure, setIsLoadingFundingLineStructure] = useState(true);
  const [fundingLineStructureError, setFundingLineStructureError] = useState<boolean>(false);
  const [fundingLineSearchSuggestions, setFundingLineSearchSuggestions] = useState<string[]>([]);
  const [fundingLines, setFundingLines] = useState<FundingStructureItemViewModel[]>([]);
  const [calculationSummaries, setCalculationSummaries] = useState<CalculationSummary[]>();
  const [fundingStructureViewModelItems, setFundingStructureViewModelItems] = useState<
    FundingStructureItemViewModel[]
  >([]);
  const [rerenderFundingLineSteps, setRerenderFundingLineSteps] = useState<boolean>();
  const [fundingLineRenderInternalState, setFundingLineRenderInternalState] = useState<boolean>();
  const fundingLineStepReactRef = useRef(null);
  const nullReactRef = useRef(null);
  const refreshFundingLinesRef = React.useRef(false);

  const { circularReferenceErrors, isLoadingCircularDependencies } = useCalculationCircularDependencies(
    specification.id,
    (err) => addError({ error: err, description: "Error while checking for circular reference errors" })
  );

  const handleApproveFundingLineStructure = async (specificationId: string) => {
    const response = await approveFundingLineStructureService(specificationId);
    if (response.status === 200) {
      clearSpecificationFromCache();
    } else {
      addError({
        error: `${response.statusText} ${response.data}`,
        description: "Error whilst approving funding line structure",
        fieldName: "funding-line-results",
      });
    }
  };

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
    calculationSummaries: CalculationSummary[]
  ) {
    for (let item = 0; item < fundingStructureItems.length; item++) {
      const stack: FundingStructureItemViewModel[] = [];
      const hashMap: any = {};

      stack.push(fundingStructureItems[item]);

      while (stack.length !== 0) {
        const node = stack.pop();
        if (node && (node.fundingStructureItems === null || node.fundingStructureItems.length === 0)) {
          visitNode(node, hashMap, calculationSummaries);
        } else {
          if (node && node.fundingStructureItems && node.fundingStructureItems.length > 0) {
            for (let i: number = node.fundingStructureItems.length - 1; i >= 0; i--) {
              stack.push(node.fundingStructureItems[i]);
            }

            node && visitNode(node, hashMap, calculationSummaries);
          }
        }
        setIsLoadingFundingLineStructure(false);
      }
    }
  }

  function visitNode(
    node: FundingStructureItemViewModel,
    hashMap: any,
    calculationSummaries: CalculationSummary[]
  ) {
    if (node.calculationId) {
      const calculationSummary = calculationSummaries.find((c) => c.id === node.calculationId);
      node.calculationPublishStatus = calculationSummary?.status;
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

    monitorAssignTemplateCalculationsJob();

    return () => clearErrorMessages(["funding-line-results"]);
  }, []);

  useEffect(() => {
    if (!refreshFundingLinesRef.current && refreshFundingLines) {
      fetchData();
    }
  }, [refreshFundingLines]);

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
    appendData(fundingLines, calculationSummaries);
  }, [circularReferenceErrors, calculationSummaries, fundingLines]);

  return (
    <section className="govuk-tabs__panel" id="fundingline-structure">
      {(isLoadingFundingLineStructure || !!activeJob) && (
        <LoadingStatus
          title={"Loading funding line structure"}
          description={`${
            isLoadingFundingLineStructure
              ? "Please wait whilst funding line structure is loading"
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
                <h2 className="govuk-heading-l">
                  Funding line structure
                  <ApproveStatusButton
                    id={specification.id}
                    status={specification.approvalStatus}
                    callback={handleApproveFundingLineStructure}
                  />
                </h2>
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
                    value={f.value ?? ""}
                    description={f.name}
                    status={f.calculationPublishStatus}
                    step={f.level.toString()}
                    expanded={fundingLinesExpandedStatus || f.expanded === true}
                    link={f.calculationId ? `/app/Specifications/EditCalculation/${f.calculationId}` : ""}
                    hasChildren={f.fundingStructureItems != null}
                    callback={collapsibleStepsChanged}
                    calculationErrorMessage={f.errorMessage}
                  >
                    <FundingLineStep
                      key={f.name.replace(" ", "") + index}
                      showResults={false}
                      expanded={fundingLinesExpandedStatus}
                      fundingStructureItem={f}
                      callback={collapsibleStepsChanged}
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
