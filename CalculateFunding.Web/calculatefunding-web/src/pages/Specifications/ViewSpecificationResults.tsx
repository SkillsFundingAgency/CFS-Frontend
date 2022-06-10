import * as React from "react";
import { useEffect, useState } from "react";
import { RouteComponentProps, useLocation } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { AdditionalCalculations } from "../../components/Calculations/AdditionalCalculations";
import { FundingLineResults } from "../../components/fundingLineStructure/FundingLineResults";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { DownloadableReports } from "../../components/Reports/DownloadableReports";
import { Tabs } from "../../components/Tabs";
import { TextLink } from "../../components/TextLink";
import { useJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import { useSpecsSelectedForFunding } from "../../hooks/Specifications/useSpecsSelectedForFunding";
import { useErrors } from "../../hooks/useErrors";
import { useFeatureFlags } from "../../hooks/useFeatureFlags";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { JobType } from "../../types/jobType";
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
  const fundingStreamId = specification?.fundingStreams[0]?.id;
  const fundingPeriodId = specification?.fundingPeriod.id;

  const { addSub, results: jobNotifications } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring background jobs" }),
  });

  useEffect(() => {
    if (specificationId)
      addSub({
        filterBy: {
          specificationId: specificationId,
          jobTypes: [JobType.GenerateCalcCsvResultsJob],
        },
        onError: (err) => addError({ error: err }),
      });
  }, [specificationId]);

  useEffect(() => {
    if (query.get("initialTab")) {
      const tabParam = query.get("initialTab") ?? "";
      setInitialTab(tabParam);
    } else {
      setInitialTab("fundingline-structure");
    }
  }, [query]);

  const { specsSelectedForFunding, isLoadingSpecsSelectedForFunding } = useSpecsSelectedForFunding(
    fundingPeriodId,
    fundingStreamId
  );

  const { enableNewFundingManagement } = useFeatureFlags();

  return (
    <Main location={Section.Results}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name={"View results"} url={"/results"} />
        <Breadcrumb name={"Select specification"} url={"/SelectSpecification"} />
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
              <li>Navigate to:</li>
              {!isLoadingSpecsSelectedForFunding && !!specsSelectedForFunding?.length && (
                <>
                  {enableNewFundingManagement ? (
                    <>
                      <NavActionLink
                        label="Funding approvals"
                        link={`/FundingManagement/Approve/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
                      />
                      <NavActionLink
                        label="Release management"
                        link={`/FundingManagement/Release/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
                      />
                    </>
                  ) : (
                    <NavActionLink
                      label="Funding approvals"
                      link={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
                    />
                  )}
                </>
              )}
              <NavActionLink label="Manage specification" link={`/ViewSpecification/${specification?.id}`} />
            </ul>
          </div>
        </div>
        {initialTab.length > 0 && !isLoadingSpecification && (
          <div className="govuk-grid-row govuk-!-padding-top-5">
            <div className="govuk-grid-column-full" hidden={isLoadingSpecification}>
              <Tabs initialTab={initialTab}>
                <ul className="govuk-tabs__list">
                  <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                  <Tabs.Tab label="additional-calculations">Additional Calculations</Tabs.Tab>
                  <Tabs.Tab label="downloadable-reports">
                    Downloadable Reports&nbsp;
                    {jobNotifications.find((x) => x.latestJob)?.latestJob?.isFailed && (
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
                  {specification && (
                    <FundingLineResults
                      specification={specification}
                      addError={addError}
                      clearErrorMessages={clearErrorMessages}
                      jobTypes={[JobType.AssignTemplateCalculationsJob]}
                    />
                  )}
                </Tabs.Panel>
                <Tabs.Panel label="additional-calculations">
                  <AdditionalCalculations
                    specificationId={specificationId}
                    showCreateButton={false}
                    addError={addError}
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
    </Main>
  );
}

const NavActionLink = ({ link, label }: { link: string; label: string }) => {
  return (
    <li>
      <TextLink to={link}>{label}</TextLink>
    </li>
  );
};
