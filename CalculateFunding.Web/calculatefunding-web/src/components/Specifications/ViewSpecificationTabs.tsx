import * as QueryString from "query-string";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { useErrorContext } from "../../context/ErrorContext";
import { useCalculationErrors } from "../../hooks/Calculations/useCalculationErrors";
import { JobDetails } from "../../types/jobDetails";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { Badge } from "../Badge";
import { AdditionalCalculations } from "../Calculations/AdditionalCalculations";
import { CalculationErrors } from "../Calculations/CalculationErrors";
import { Tabs } from "../Tabs";
import { Datasets } from "./Datasets";
import { SpecificationFundingLineResults } from "./SpecificationFundingLineResults";
import { VariationManagement } from "./VariationManagement";

export const ViewSpecificationTabs = ({
  specification,
  approveAllCalculationsJob,
  lastConverterWizardReportDate,
  monitorAssignTemplateCalculationsJob,
}: {
  specification: SpecificationSummary;
  approveAllCalculationsJob: JobDetails | undefined;
  lastConverterWizardReportDate: Date | undefined;
  monitorAssignTemplateCalculationsJob: () => Promise<void>;
}) => {
  const { addErrorToContext } = useErrorContext();
  const location = useLocation();
  const { calculationErrors, calculationErrorCount, isLoadingCalculationErrors } = useCalculationErrors(
    specification.id,
    (err) => {
      addErrorToContext({ error: err, description: "Error while checking for calculation errors" });
    },
    0
  );
  const [initialTab, setInitialTab] = useState<string>();

  useEffect(() => {
    const params = QueryString.parse(location.search);

    if (params.showDatasets) {
      setInitialTab("datasets");
    } else if (params.showVariationManagement) {
      setInitialTab("variation-management");
    } else {
      setInitialTab("fundingline-structure");
    }
  }, [location]);

  if (!initialTab) return null;

  return (
    <div className="govuk-main-wrapper  govuk-!-padding-top-2">
      <div className="govuk-grid-row" data-testid="hi">
        <Tabs initialTab={"fundingline-structure"}>
          <ul className="govuk-tabs__list">
            <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
            {isLoadingCalculationErrors || calculationErrorCount === 0 ? (
              ""
            ) : (
              <Tabs.Tab label="calculation-errors">
                Calculations errors
                <Badge errorCount={calculationErrorCount} />
              </Tabs.Tab>
            )}
            <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
            <Tabs.Tab
              hidden={!specification.isSelectedForFunding}
              data-testid={"variations-tab"}
              label="variations"
            >
              Variations
            </Tabs.Tab>
          </ul>
          <Tabs.Panel label="fundingline-structure">
            <SpecificationFundingLineResults
              specification={specification}
              refreshFundingLines={approveAllCalculationsJob?.isSuccessful}
              monitorAssignTemplateCalculationsJob={monitorAssignTemplateCalculationsJob}
            />
          </Tabs.Panel>
          <Tabs.Panel label="additional-calculations">
            <AdditionalCalculations
              specificationId={specification.id}
              showCreateButton={true}
              addError={addErrorToContext}
            />
          </Tabs.Panel>
          <Tabs.Panel label="calculation-errors">
            <CalculationErrors calculationErrors={calculationErrors} />
          </Tabs.Panel>
          <Tabs.Panel label="datasets">
            <Datasets
              specificationId={specification.id}
              lastConverterWizardReportDate={lastConverterWizardReportDate}
            />
          </Tabs.Panel>
          <Tabs.Panel hidden={!specification.isSelectedForFunding} label={"variations"}>
            <VariationManagement
              specificationId={specification.id}
              fundingPeriodId={specification.fundingPeriod.id}
              fundingStreamId={specification.fundingStreams[0].id}
            />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};
