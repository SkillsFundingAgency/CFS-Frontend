import { cloneDeep } from "lodash";
import * as QueryString from "query-string";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";

import * as action from "../../actions/jobObserverActions";
import { Badge } from "../../components/Badge";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { AdditionalCalculations } from "../../components/Calculations/AdditionalCalculations";
import { CalculationErrors } from "../../components/Calculations/CalculationErrors";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { Details } from "../../components/Details";
import { Footer } from "../../components/Footer";
import { FundingLineResults } from "../../components/fundingLineStructure/FundingLineResults";
import { Header } from "../../components/Header";
import { JobProgressNotificationBanner } from "../../components/Jobs/JobProgressNotificationBanner";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { Datasets } from "../../components/Specifications/Datasets";
import { VariationManagement } from "../../components/Specifications/VariationManagement";
import { Tabs } from "../../components/Tabs";
import { useCalculationErrors } from "../../hooks/Calculations/useCalculationErrors";
import {
  JobNotification,
  JobSubscription,
  MonitorFallback,
  MonitorMode,
  useJobSubscription,
} from "../../hooks/Jobs/useJobSubscription";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useSpecificationResults } from "../../hooks/Specifications/useSpecificationResults";
import { useErrors } from "../../hooks/useErrors";
import { useFundingConfiguration } from "../../hooks/useFundingConfiguration";
import { IStoreState } from "../../reducers/rootReducer";
import * as calculationService from "../../services/calculationService";
import * as publishService from "../../services/publishService";
import * as specificationService from "../../services/specificationService";
import { JobObserverState } from "../../states/JobObserverState";
import { CalculationSummary } from "../../types/CalculationDetails";
import { CalculationType } from "../../types/CalculationSearchResponse";
import { JobDetails } from "../../types/jobDetails";
import { JobType } from "../../types/jobType";
import { Permission } from "../../types/Permission";
import { PublishStatus } from "../../types/PublishStatusModel";
import { Section } from "../../types/Sections";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { ReleaseTimetable } from "./ReleaseTimetable";

export interface ViewSpecificationRoute {
  specificationId: string;
}

export function ViewSpecification({ match }: RouteComponentProps<ViewSpecificationRoute>) {
  const jobObserverState: JobObserverState = useSelector<IStoreState, JobObserverState>(
    (state) => state.jobObserverState
  );
  const initialSpecification: SpecificationSummary = {
    coreProviderVersionUpdates: undefined,
    name: "",
    approvalStatus: "",
    description: "",
    fundingPeriod: {
      id: "",
      name: "",
    },
    fundingStreams: [
      {
        name: "",
        id: "",
      },
    ],
    id: "",
    isSelectedForFunding: false,
    providerVersionId: "",
    dataDefinitionRelationshipIds: [],
    templateIds: {},
  };
  const [specification, setSpecification] = useState<SpecificationSummary>(initialSpecification);
  const specificationId = match.params.specificationId;
  const { errors, addError, clearErrorMessages, addValidationErrors } = useErrors();
  const [selectedForFundingSpecId, setSelectedForFundingSpecId] = useState<string | undefined>();
  const [isLoadingSelectedForFunding, setIsLoadingSelectedForFunding] = useState(true);
  const [initialTab, setInitialTab] = useState<string>("");
  const { missingPermissions, hasPermission, isPermissionsFetched } = useSpecificationPermissions(
    match.params.specificationId,
    [Permission.CanApproveSpecification, Permission.CanChooseFunding, Permission.CanApproveAllCalculations]
  );
  const canApproveAllCalculations: boolean = useMemo(
    () => !!(hasPermission && hasPermission(Permission.CanApproveAllCalculations)),
    [isPermissionsFetched]
  );
  const canChooseForFunding: boolean = useMemo(
    () => hasPermission(Permission.CanChooseFunding) === true,
    [isPermissionsFetched]
  );
  const [observedJobSubscription, setObservedJobSubscription] = useState<JobSubscription>();
  const [converterWizardJob, setConverterWizardJob] = useState<JobDetails>();
  const [lastConverterWizardReportDate, setLastConverterWizardReportDate] = useState<Date | undefined>(
    undefined
  );
  const [approveAllCalculationsJob, setApproveAllCalcsJob] = useState<JobDetails>();
  const fundingStream = specification?.fundingStreams ? specification.fundingStreams[0] : undefined;
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();

  const { addSub, removeSub, removeAllSubs, subs, results } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring the running jobs" }),
    onNewNotification: handleJobNotification,
  });

  const isRefreshJobMonitoring = useMemo(
    () => !!subs.find((s) => s.filterBy.jobTypes?.includes(JobType.RefreshFundingJob)),
    [subs]
  );
  const isApproveCalcsJobMonitoring = useMemo(
    () => !!subs.find((s) => s.filterBy.jobTypes?.includes(JobType.ApproveAllCalculationsJob)),
    [subs]
  );
  const isApproveCalcsJobRunning = useMemo(
    () => !!results.find((n) => n.latestJob?.jobType === JobType.ApproveAllCalculationsJob),
    [subs]
  );

  const { calculationErrors, isLoadingCalculationErrors, calculationErrorCount } = useCalculationErrors(
    specificationId,
    (err) => {
      addError({ error: err, description: "Error while checking for calculation errors" });
    },
    0
  );

  const { fundingConfiguration } = useFundingConfiguration(
    fundingStream?.id,
    specification.fundingPeriod?.id,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );

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

  useEffect(() => {
    if (jobObserverState?.jobFilter) {
      addSub({
        filterBy: jobObserverState.jobFilter,
        monitorMode: MonitorMode.SignalR,
        onError: (e) => addError({ error: e, description: "Error while trying to monitor background jobs" }),
      }).then((sub) => setObservedJobSubscription(sub as JobSubscription));
    }
  }, [jobObserverState]);

  useEffect(() => {
    document.title = "Specification Results - Calculate funding";
    clearErrorMessages();
    fetchData();

    addSub({
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      filterBy: {
        specificationId: specificationId,
        jobTypes: [
          JobType.RunConverterDatasetMergeJob,
          JobType.ConverterWizardActivityCsvGenerationJob,
          JobType.EditSpecificationJob,
        ],
      },
      onError: (e) => addError({ error: e, description: "Error while checking for converter wizard job" }),
    });

    return () => {
      removeAllSubs();
    };
  }, [specificationId]);

  const { specificationHasCalculationResults, isLoadingSpecificationResults } = useSpecificationResults(
    specification.id,
    specification.fundingStreams[0].id,
    specification.fundingPeriod.id,
    (err) => addError({ error: err, description: "Error while loading specification results" })
  );

  const fetchData = async () => {
    try {
      const spec: SpecificationSummary = (
        await specificationService.getSpecificationSummaryService(specificationId)
      ).data;
      setSpecification(spec);

      if (spec.isSelectedForFunding) {
        setSelectedForFundingSpecId(spec.id);
      } else {
        spec.fundingStreams.some(async (stream) => {
          const result =
            await specificationService.getSpecificationsSelectedForFundingByPeriodAndStreamService(
              spec.fundingPeriod?.id,
              stream.id
            );
          const selectedSpecs = result.data;
          const hasAnySelectedForFunding = selectedSpecs !== null && selectedSpecs.length > 0;
          if (hasAnySelectedForFunding) {
            setSelectedForFundingSpecId(selectedSpecs[0]?.id);
          }
          return hasAnySelectedForFunding;
        });
      }
    } finally {
      setIsLoadingSelectedForFunding(false);
    }
  };

  async function handleJobNotification(notification: JobNotification) {
    if (!notification?.latestJob) return;

    switch (notification.latestJob.jobType) {
      case JobType.ConverterWizardActivityCsvGenerationJob:
        return await handleConverterWizardReportJob(notification);
      case JobType.RefreshFundingJob:
        return await handleRefreshFundingJobNotification(notification);
      case JobType.ApproveAllCalculationsJob:
        return await handleApproveAllCalculationsJob(notification);
      case JobType.RunConverterDatasetMergeJob:
        return await handleConverterWizardJob(notification);
      case JobType.EditSpecificationJob:
        return await handleEditSpecificationJob(notification);
    }
  }

  async function handleObservedJobNotification(notification: JobNotification) {
    if (
      !observedJobSubscription ||
      !notification?.latestJob ||
      notification.subscription.id !== observedJobSubscription.id
    )
      return;

    const observedJob = notification.latestJob;
    if (!observedJob || observedJob.isActive) return;
    if (observedJob.isComplete) {
      if (observedJob.isFailed) {
        addError({
          error: observedJob.outcome ?? "An unknown error occurred",
          description: "A background job failed",
        });
      }
      dispatch(action.clearJobObserverState());
      removeSub(observedJobSubscription.id);
      setObservedJobSubscription(undefined);
    }
  }

  async function handleRefreshFundingJobNotification(notification: JobNotification) {
    if (notification?.latestJob?.jobType !== JobType.RefreshFundingJob) return;

    const job = notification.latestJob;
    clearErrorMessages();
    if (job.isComplete) {
      if (job.isSuccessful) {
        history.push(
          `/Approvals/SpecificationFundingApproval/${fundingStream?.id}/${specification.fundingPeriod.id}/${specificationId}`
        );
      } else {
        addError({
          error: job.outcome || job.statusDescription,
          description: "Failed to choose specification for funding",
        });
      }
      removeSub(notification.subscription.id);
    }
  }

  async function handleApproveAllCalculationsJob(notification: JobNotification) {
    if (notification.latestJob?.jobType !== JobType.ApproveAllCalculationsJob) return;

    if (observedJobSubscription && notification.subscription.id === observedJobSubscription.id) {
      await handleObservedJobNotification(notification);
    }

    const job = notification.latestJob;
    setApproveAllCalcsJob(job);
    if (job.isComplete) {
      removeSub(notification.subscription.id);
    }
  }

  async function handleConverterWizardJob(notification: JobNotification) {
    if (notification.latestJob?.jobType !== JobType.RunConverterDatasetMergeJob) return;

    if (observedJobSubscription && notification.subscription.id === observedJobSubscription.id) {
      await handleObservedJobNotification(notification);
    }

    const job = notification.latestJob;
    if (job.isActive) {
      setConverterWizardJob(job);
    } else {
      // we don't do anything with success or fail
      setConverterWizardJob(undefined);
    }
  }

  async function handleEditSpecificationJob(notification: JobNotification) {
    if (notification.latestJob?.jobType !== JobType.EditSpecificationJob) {
      return;
    }

    if (observedJobSubscription && notification.subscription.id === observedJobSubscription.id) {
      return await handleObservedJobNotification(notification);
    }

    const job = notification.latestJob;
    if (job.isFailed) {
      addError({
        error: job.outcome as string,
        description: "There has been a problem updating this specification",
      });
    }
  }

  async function handleConverterWizardReportJob(notification: JobNotification) {
    if (notification.latestJob?.jobType !== JobType.ConverterWizardActivityCsvGenerationJob) return;

    if (observedJobSubscription && notification.subscription.id === observedJobSubscription.id) {
      setLastConverterWizardReportDate(undefined);
      return await handleObservedJobNotification(notification);
    }

    const job = notification.latestJob;
    if (job.isComplete) {
      if (job.isSuccessful) {
        setLastConverterWizardReportDate(job.lastUpdated);
        return;
      } else {
        addError({
          description: "Converter wizard report failed",
          error: job.outcome || job.statusDescription,
        });
      }
    }
    setLastConverterWizardReportDate(undefined);
  }

  async function approveAllCalculations() {
    try {
      clearErrorMessages();
      const isAllowed: boolean = await isUserAllowedToApproveAllCalculations();
      if (isAllowed) {
        ConfirmationModal(
          "Are you sure you want to approve all calculations?",
          submitApproveAllCalculations,
          "Confirm",
          "Cancel"
        );
      }
    } catch (e) {
      addError({ error: "A problem occurred while getting user permissions" });
    }
  }

  async function submitApproveAllCalculations(confirm: boolean) {
    if (confirm) {
      try {
        const response = await calculationService.approveAllCalculationsService(specificationId);
        if (response.status !== 200 || !response.data?.id) {
          addError({ error: "A problem occurred while approving all calculations" });
        } else {
          await addSub({
            monitorMode: MonitorMode.SignalR,
            monitorFallback: MonitorFallback.Polling,
            fetchPriorNotifications: true,
            filterBy: {
              specificationId: specificationId,
              jobTypes: [JobType.ApproveAllCalculationsJob],
              jobId: response.data?.id,
            },
            onError: (e) =>
              addError({ error: e, description: "Error while checking for approve all calculation job" }),
          });
        }
      } catch (err: any) {
        addError({ description: "A problem occurred while approving all calculations", error: err });
      }
    }
  }

  async function chooseForFunding() {
    try {
      clearErrorMessages();
      const isAllowed: boolean = await isUserAllowedToChooseSpecification(specificationId);
      if (isAllowed) {
        ConfirmationModal(
          <div className="govuk-row govuk-!-width-full">
            Are you sure you want to choose this specification?
          </div>,
          refreshFunding,
          "Confirm",
          "Cancel"
        );
      }
    } catch (e) {
      addError({ error: "A problem occurred while getting user permissions" });
    }
  }

  async function refreshFunding(confirm: boolean) {
    if (confirm) {
      try {
        const response = await publishService.refreshSpecificationFundingService(specificationId);
        const jobId = response.data as string;
        if (jobId != null && jobId !== "") {
          await addSub({
            monitorMode: MonitorMode.SignalR,
            filterBy: {
              specificationId: specificationId,
              jobTypes: [JobType.RefreshFundingJob],
              jobId: jobId,
            },
            onError: (e) =>
              addError({ error: e, description: "Error while checking for refresh funding job" }),
          });
        } else {
          addError({ error: "A problem occurred while refreshing funding" });
        }
      } catch (err: any) {
        if (err.response.status === 400) {
          const errResponse = err.response.data;
          addValidationErrors({ validationErrors: errResponse, message: "Validation failed" });
        } else {
          addError({ description: "A problem occurred while refreshing funding", error: err });
        }
      }
    }
  }

  async function isUserAllowedToChooseSpecification(specificationId: string) {
    if (!canChooseForFunding) {
      addError({ error: "You do not have permissions to choose this specification for funding" });
      return false;
    }
    if (specification.approvalStatus !== PublishStatus.Approved) {
      addError({
        error: "Specification must be approved before the specification can be chosen for funding.",
      });
      return false;
    }
    try {
      const calcs: CalculationSummary[] = (
        await calculationService.getCalculationSummaryBySpecificationId(specificationId)
      ).data;
      if (
        calcs
          .filter((calc) => calc.calculationType === CalculationType.Template)
          .some((calc) => calc.status !== PublishStatus.Approved)
      ) {
        addError({
          error: "Template calculations must be approved before the specification can be chosen for funding.",
        });
        return false;
      }
    } catch (err) {
      addError({ error: "A problem occurred while choosing specification" });
      return false;
    }
    return true;
  }

  async function isUserAllowedToApproveAllCalculations() {
    if (!canApproveAllCalculations) {
      addError({ error: "You don't have permission to approve calculations" });
      return false;
    }
    try {
      const calcs: CalculationSummary[] = (
        await calculationService.getCalculationSummaryBySpecificationId(specificationId)
      ).data;
      if (!calcs.some((calc) => calc.status !== PublishStatus.Approved)) {
        addError({ error: "All calculations have already been approved" });
        return false;
      }
    } catch (err) {
      addError({ error: "Approve all calculations failed - try again" });
      return false;
    }
    return true;
  }

  const setApprovalStatusToApproved = () => {
    const updatedSpecification = cloneDeep(specification);
    updatedSpecification.approvalStatus = PublishStatus.Approved;
    setSpecification(updatedSpecification);
  };

  return (
    <div>
      <Header location={Section.Specifications} />
      <div className="govuk-width-container">
        <Breadcrumbs>
          <Breadcrumb name={"Calculate funding"} url={"/"} />
          <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
          <Breadcrumb name={specification?.name} />
        </Breadcrumbs>

        <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />

        <MultipleErrorSummary errors={errors} />

        <LoadingStatusNotifier
          notifications={[
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
              <JobProgressNotificationBanner job={approveAllCalculationsJob} displaySuccessfulJob={true} />
            )}
            {converterWizardJob && <JobProgressNotificationBanner job={converterWizardJob} />}
          </div>
        )}

        <div className="govuk-grid-row" hidden={isApproveCalcsJobMonitoring || isRefreshJobMonitoring}>
          <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-1">{specification.name}</h1>
            <span className="govuk-caption-l">
              {fundingStream?.name} for {specification?.fundingPeriod?.name}
            </span>
            {!isLoadingSelectedForFunding && specification.isSelectedForFunding && (
              <strong className="govuk-tag govuk-!-margin-bottom-5">Chosen for funding</strong>
            )}
            {fundingConfiguration && fundingConfiguration.enableConverterDataMerge && (
              <p className="govuk-body govuk-!-margin-top-2">
                <strong className="govuk-tag govuk-tag--green">In year opener enabled</strong>
              </p>
            )}
          </div>
          <div className="govuk-grid-column-two-thirds">
            <Details title={`What is ${specification.name}`} body={specification.description} />
          </div>
          <div className="govuk-grid-column-one-third">
            <ul className="govuk-list">
              <li>
                <Link to={`/Specifications/EditSpecification/${specificationId}`} className="govuk-link">
                  Edit specification
                </Link>
              </li>

              <li>
                <button
                  type="button"
                  className="govuk-link"
                  onClick={approveAllCalculations}
                  data-testid="approve-calculations"
                >
                  Approve all calculations
                </button>
              </li>
              {isLoadingSelectedForFunding && <LoadingFieldStatus title={"checking funding status..."} />}
              {!isLoadingSelectedForFunding && (
                <li>
                  {specification.isSelectedForFunding || selectedForFundingSpecId ? (
                    <Link
                      className="govuk-link govuk-link--no-visited-state"
                      to={`/Approvals/SpecificationFundingApproval/${fundingStream?.id}/${specification.fundingPeriod.id}/${selectedForFundingSpecId}`}
                    >
                      View funding
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="govuk-link"
                      onClick={chooseForFunding}
                      data-testid="choose-for-funding"
                    >
                      Choose for funding
                    </button>
                  )}
                </li>
              )}
              {!isLoadingSpecificationResults && specificationHasCalculationResults && (
                <li>
                  <Link className={"govuk-link"} to={`/ViewSpecificationResults/${specificationId}`}>
                    View specification results
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
        {initialTab.length > 0 &&
          !isApproveCalcsJobMonitoring &&
          specification.id?.length > 0 &&
          !isRefreshJobMonitoring && (
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
                    <Tabs.Tab label="release-timetable">Release timetable</Tabs.Tab>
                    <Tabs.Tab
                      hidden={!specification.isSelectedForFunding}
                      data-testid={"variations-tab"}
                      label="variations"
                    >
                      Variations
                    </Tabs.Tab>
                  </ul>
                  <Tabs.Panel label="fundingline-structure">
                    <FundingLineResults
                      specificationId={specification.id}
                      fundingStreamId={specification.fundingStreams[0].id}
                      fundingPeriodId={specification.fundingPeriod.id}
                      status={specification.approvalStatus as PublishStatus}
                      addError={addError}
                      clearErrorMessages={clearErrorMessages}
                      setStatusToApproved={setApprovalStatusToApproved}
                      refreshFundingLines={approveAllCalculationsJob?.isSuccessful}
                      showApproveButton={true}
                      useCalcEngine={true}
                      jobTypes={[JobType.AssignTemplateCalculationsJob]}
                    />
                  </Tabs.Panel>
                  <Tabs.Panel label="additional-calculations">
                    <AdditionalCalculations
                      specificationId={specificationId}
                      addError={addError}
                      showCreateButton={true}
                    />
                  </Tabs.Panel>
                  <Tabs.Panel label="calculation-errors">
                    <CalculationErrors calculationErrors={calculationErrors} />
                  </Tabs.Panel>
                  <Tabs.Panel label="datasets">
                    <Datasets
                      specificationId={specificationId}
                      lastConverterWizardReportDate={lastConverterWizardReportDate}
                    />
                  </Tabs.Panel>
                  <Tabs.Panel label="release-timetable">
                    <section className="govuk-tabs__panel">
                      <ReleaseTimetable
                        specificationId={specificationId}
                        addErrorMessage={addError}
                        clearErrorMessages={clearErrorMessages}
                        errors={errors}
                      />
                    </section>
                  </Tabs.Panel>
                  <Tabs.Panel hidden={!specification.isSelectedForFunding} label={"variations"}>
                    <VariationManagement
                      specificationId={specificationId}
                      fundingPeriodId={specification.fundingPeriod.id}
                      fundingStreamId={specification.fundingStreams[0].id}
                      addError={addError}
                      clearErrorMessages={clearErrorMessages}
                    />
                  </Tabs.Panel>
                </Tabs>
              </div>
            </div>
          )}
      </div>
      &nbsp;
      <Footer />
    </div>
  );
}
