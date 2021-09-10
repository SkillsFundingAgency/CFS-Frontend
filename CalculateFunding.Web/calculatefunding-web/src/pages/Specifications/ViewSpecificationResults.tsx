import * as React from "react";
import { useEffect, useState } from "react";
import { RouteComponentProps, useLocation } from "react-router";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { AdditionalCalculations } from "../../components/Calculations/AdditionalCalculations";
import { Footer } from "../../components/Footer";
import { FundingLineResults } from "../../components/fundingLineStructure/FundingLineResults";
import { Header } from "../../components/Header";
import { LoadingStatus } from "../../components/LoadingStatus";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { DownloadableReports } from "../../components/Reports/DownloadableReports";
import { Tabs } from "../../components/Tabs";
import { useLatestSpecificationJobWithMonitoring } from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import { useErrors } from "../../hooks/useErrors";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { JobType } from "../../types/jobType";
import { PublishStatus } from "../../types/PublishStatusModel";
import { Section } from "../../types/Sections";

export interface ViewSpecificationResultsRoute {
  specificationId: string;
}

function useParamQuery() {
  return new URLSearchParams(useLocation().search);
}

export function ViewSpecificationResults({ match }: RouteComponentProps<ViewSpecificationResultsRoute>) {
  const [initialTab, setInitialTab] = useState<string>("");
  const query = useParamQuery();
  const { errors, addErrorMessage, addError, clearErrorMessages } = useErrors();
  const specificationId = match.params.specificationId;
  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addErrorMessage(err.message, "Error while loading specification")
  );
  const { latestJob: latestReportJob } = useLatestSpecificationJobWithMonitoring(
    specificationId,
    [JobType.GenerateCalcCsvResultsJob],
    (err) => addErrorMessage("Error while checking for latest CSV generation job")
  );

  useEffect(() => {
    if (query.get("initialTab")) {
      const tabParam = query.get("initialTab") ?? "";
      setInitialTab(tabParam);
    } else {
      setInitialTab("fundingline-structure");
    }
  }, [query]);

  return (
    <div>
      <Header location={Section.Results} />
      <div className="govuk-width-container">
        <Breadcrumbs>
          <Breadcrumb name={"Calculate funding"} url={"/"} />
          <Breadcrumb name={"View results"} url={"/results"} />
          <Breadcrumb name={"Select specification"} url={"/SelectSpecification"} />
          <Breadcrumb name={specification ? specification.name : ""} />
        </Breadcrumbs>

        <MultipleErrorSummary errors={errors} />
        <LoadingStatus title={"Loading specification"} hidden={!isLoadingSpecification} />
        <div className="govuk-main-wrapper" hidden={isLoadingSpecification}>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-1">
                {specification !== undefined ? specification?.name : ""}
              </h1>
              <span className="govuk-caption-l">
                {specification !== undefined ? specification.fundingPeriod?.name : ""}
              </span>
              {specification && specification.isSelectedForFunding && (
                <p className="govuk-body govuk-!-margin-top-2">
                  <strong className="govuk-tag">Chosen for funding</strong>
                </p>
              )}
            </div>
            <div className="govuk-grid-column-one-third">
              <ul className="govuk-list right-align">
                {specification && specification.isSelectedForFunding && (
                  <li>
                    <Link
                      className="govuk-link govuk-link--no-visited-state"
                      to={`/Approvals/SpecificationFundingApproval/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${specification.id}`}
                    >
                      View funding
                    </Link>
                  </li>
                )}
                <li>
                  <Link className={"govuk-link"} to={`/ViewSpecification/${specification?.id}`}>
                    Manage specification
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {initialTab.length > 0 && (
            <div className="govuk-grid-row govuk-!-padding-top-5">
              <div className="govuk-grid-column-full" hidden={isLoadingSpecification}>
                <Tabs initialTab={initialTab}>
                  <ul className="govuk-tabs__list">
                    <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                    <Tabs.Tab label="additional-calculations">Additional Calculations</Tabs.Tab>
                    <Tabs.Tab label="downloadable-reports">
                      Downloadable Reports&nbsp;
                      {latestReportJob?.isFailed && (
                        <span
                          className="notification-badge"
                          data-testid="notification-badge"
                          aria-label="contains 1 error"
                        >
                          1
                        </span>
                      )}
                    </Tabs.Tab>
                  </ul>
                  <Tabs.Panel label="fundingline-structure">
                    {specification !== undefined && specification.fundingStreams?.length > 0 ? (
                      <FundingLineResults
                        specificationId={specification.id}
                        fundingStreamId={specification.fundingStreams[0].id}
                        fundingPeriodId={specification.fundingPeriod.id}
                        status={specification.approvalStatus as PublishStatus}
                        addError={addError}
                        clearErrorMessages={clearErrorMessages}
                        showApproveButton={false}
                        useCalcEngine={true}
                        jobTypes={[JobType.AssignTemplateCalculationsJob]}
                      />
                    ) : (
                      ""
                    )}
                  </Tabs.Panel>
                  <Tabs.Panel label="additional-calculations">
                    <AdditionalCalculations
                      specificationId={specificationId}
                      addError={addErrorMessage}
                      showCreateButton={false}
                    />
                  </Tabs.Panel>
                  <Tabs.Panel label="downloadable-reports">
                    <DownloadableReports
                      fundingPeriodId={specification !== undefined ? specification.fundingPeriod?.id : ""}
                      specificationId={specificationId}
                    />
                  </Tabs.Panel>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
