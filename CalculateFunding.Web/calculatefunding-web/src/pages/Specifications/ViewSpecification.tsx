import React from "react";
import { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import JobBanner from "../../components/Jobs/JobBanner";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { ViewSpecificationSummary } from "../../components/Specifications/ViewSpecificationSummary";
import { ViewSpecificationTabs } from "../../components/Specifications/ViewSpecificationTabs";
import { useErrorContext } from "../../context/ErrorContext";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useSpecsSelectedForFunding } from "../../hooks/Specifications/useSpecsSelectedForFunding";
import { useViewSpecificationJobs } from "../../hooks/Specifications/useViewSpecificationJobs";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { JobType } from "../../types/jobType";
import { Permission } from "../../types/Permission";
import { Section } from "../../types/Sections";

export interface ViewSpecificationRoute {
  specificationId: string;
}

export function ViewSpecification({ match }: RouteComponentProps<ViewSpecificationRoute>): JSX.Element {
  const specificationId = match.params.specificationId;

  const {
    state: errors,
    addErrorToContext: addError,
    clearErrorsFromContext: clearErrorMessages,
  } = useErrorContext();
  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({
      error: err,
      description: "Error while loading specification",
    })
  );
  const fundingStream = specification?.fundingStreams ? specification.fundingStreams[0] : undefined;
  const { missingPermissions, isPermissionsFetched } = useSpecificationPermissions(specificationId, [
    Permission.CanApproveSpecification,
    Permission.CanChooseFunding,
    Permission.CanApproveAllCalculations,
  ]);
  const [selectedForFundingSpecId, setSelectedForFundingSpecId] = useState<string | undefined>();
  const { isLoadingSpecsSelectedForFunding } = useSpecsSelectedForFunding(
    specification?.fundingPeriod?.id,
    fundingStream?.id,
    {
      enabled:
        !!fundingStream?.id?.length &&
        !!specification?.fundingPeriod?.id &&
        !specification.isSelectedForFunding,
      onSuccess: (data) => setSelectedForFundingSpecId(data?.find((x) => !!x.id)?.id),
    }
  );
  const {
    monitorApproveAllCalculationsJob,
    monitorConverterWizardJob,
    monitorRefreshFundingJob,
    monitorAssignTemplateCalculationsJob,
    converterWizardJob,
    approveAllCalculationsJob,
    isRefreshJobMonitoring,
    isApproveCalcsJobRunning,
    isApproveCalcsJobMonitoring,
    lastConverterWizardReportDate,
  } = useViewSpecificationJobs({
    specificationId,
    addError,
    onSuccessfulRefreshFunding,
  });
  const history = useHistory();

  useEffect(() => {
    document.title = "Specification Results - Calculate funding";
    monitorConverterWizardJob();
    clearErrorMessages();
  }, [specification?.id]);

  async function onSuccessfulRefreshFunding() {
    clearErrorMessages();
    history.push(
      `/Approvals/SpecificationFundingApproval/${fundingStream?.id}/${specification?.fundingPeriod.id}/${specificationId}`
    );
  }

  return (
    <Main location={Section.Specifications}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
        <Breadcrumb name={specification?.name ?? ""} />
      </Breadcrumbs>
      <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />
      <MultipleErrorSummary errors={errors} />
      <LoadingStatusNotifier
        notifications={[
          {
            isActive: isLoadingSpecification,
            title: "Loading specification",
            description: "Please wait, this could take several minutes",
          },
          {
            isActive: isApproveCalcsJobMonitoring,
            title: "Background job is running",
            subTitle: "Approving calculations",
            description: "Please wait, this could take several minutes",
          },
          {
            isActive: isRefreshJobMonitoring,
            title: "Background job is running",
            subTitle: "Refreshing funding",
            description: "Please wait, this could take several minutes",
          },
        ]}
      />
      {(isRefreshJobMonitoring ||
        (converterWizardJob && !converterWizardJob.isSuccessful) ||
        isApproveCalcsJobMonitoring) && (
        <div className="govuk-form-group">
          {(isRefreshJobMonitoring || isApproveCalcsJobMonitoring) && (
            <LoadingFieldStatus title={"Checking for running jobs..."} />
          )}
          {isApproveCalcsJobRunning && (
            <JobBanner
              job={approveAllCalculationsJob}
              notificationSettings={[
                {
                  showSuccessful: true,
                  jobTypes: [JobType.ApproveAllCalculationsJob],
                },
              ]}
            />
          )}
          {converterWizardJob && <JobBanner job={converterWizardJob} />}
        </div>
      )}
      {specification && fundingStream && !isApproveCalcsJobMonitoring && !isRefreshJobMonitoring && (
        <>
          <ViewSpecificationSummary
            specificationId={specificationId}
            isLoadingSelectedForFunding={isLoadingSpecsSelectedForFunding}
            monitorApproveAllCalculationsJob={monitorApproveAllCalculationsJob}
            monitorRefreshFundingJob={monitorRefreshFundingJob}
            selectedForFundingSpecId={selectedForFundingSpecId}
          />
          <ViewSpecificationTabs
            specification={specification}
            approveAllCalculationsJob={approveAllCalculationsJob}
            lastConverterWizardReportDate={lastConverterWizardReportDate}
            monitorAssignTemplateCalculationsJob={monitorAssignTemplateCalculationsJob}
          />
        </>
      )}
    </Main>
  );
}
