import {MultipleErrorSummary} from "../MultipleErrorSummary";
import {RunningStatus} from "../../types/RunningStatus";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {getDownloadableReportsService} from "../../services/specificationService";
import {
    ReportGrouping,
    ReportGroupingLevel,
    ReportMetadataViewModel
} from "../../types/Specifications/ReportMetadataViewModel";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {useErrors} from "../../hooks/useErrors";
import {runGenerateCalculationCsvResultsJob} from "../../services/calculationService";
import {ReportCategory} from "../../types/Specifications/ReportCategory";
import {AccordionPanel} from "../AccordionPanel";
import {InputSearch} from "../InputSearch";
import {DownloadableReportItem} from "./DownloadableReportItem";
import {BackToTop} from "../BackToTop";

export function DownloadableReports(props: {
    specificationId: string,
    fundingPeriodId: string
}) {
    const [allExpanded, setAllExpanded] = useState<boolean>(false);
    const [reportsSearchSuggestions, setReportsSearchSuggestions] = useState<string[]>([]);
    const [downloadableReports, setDownloadableReports] = useState<ReportMetadataViewModel[]>([]);
    const [downloadableReportsGrouping, setDownloadableReportsGrouping] = useState<ReportGrouping[]>([]);
    const [reportsRenderInternalState, setReportsRenderInternalState] = useState<boolean>();
    const reportAccordionReactRef = useRef(null);
    const nullReactRef = useRef(null);
    const {
        errors: liveReportErrors,
        addErrorMessage: addLiveReportErrors,
        clearErrorMessages: clearLiveReportErrorMessages
    } = useErrors();
    const {hasJob: hasCalculationJob, latestJob: latestCalculationJob, isCheckingForJob: isCheckingForCalculationJob} =
        useLatestSpecificationJobWithMonitoring(props.specificationId,
            [JobType.CreateInstructAllocationJob,
                JobType.GenerateGraphAndInstructAllocationJob,
                JobType.CreateInstructGenerateAggregationsAllocationJob,
                JobType.GenerateGraphAndInstructGenerateAggregationAllocationJob],
            err => addLiveReportErrors(`Error checking for calculation job ${err}`)
        );
    const {hasJob: hasReportJob, latestJob: latestReportJob, isCheckingForJob: isCheckingForReportJob} =
        useLatestSpecificationJobWithMonitoring(props.specificationId,
            [JobType.GenerateCalcCsvResultsJob],
            err => addLiveReportErrors(`Error checking for CSV results job ${err}`)
        );
    const [isRefreshingReports, setIsRefreshingReports] = useState<boolean>(false);
    const [liveReportStatusMessage, setLiveReportStatusMessage] = useState<string>("");

    useEffect(() => {
        jobStatusReport();
    }, [hasCalculationJob, hasReportJob]);

    useEffect(() => {
        getDownloadableReportsService(props.specificationId, props.fundingPeriodId)
            .then((result) => {
                const response = result.data as ReportMetadataViewModel[];
                setDownloadableReports(response);
                setInitialExpandedStatus(response, false);
                setDownloadableReportsGrouping(
                    [...new Set(response.filter(r => r.grouping !== ReportGrouping.Live).map(p => p.grouping))]);
                setReportsSearchSuggestions([...getDistinctPublishedReports(response)]);
            }).catch((err) => {
            addLiveReportErrors(`Error fetching downloadable reports. ${err}`);
        });
    }, [props.specificationId]);

    useEffect(() => {
        if (!reportsRenderInternalState) {
            return
        }
        if (reportAccordionReactRef !== null && reportAccordionReactRef.current !== null) {
            // @ts-ignore
            reportAccordionReactRef.current.scrollIntoView({behavior: 'smooth', block: 'start'})
        }
        setReportsRenderInternalState(false);
    }, [reportsRenderInternalState]);

    function jobStatusReport() {
        if (!latestCalculationJob && !latestReportJob) return;

        if ((latestCalculationJob?.isActive &&
            (latestCalculationJob?.runningStatus !== RunningStatus.Completed || latestCalculationJob?.parentJobId !== undefined))
            && latestReportJob?.created === undefined) {
            setLiveReportStatusMessage("Initial calculations in progress, live data reports will be available soon.");
        } else if ((latestCalculationJob?.isActive &&
            (latestCalculationJob?.runningStatus !== RunningStatus.Completed || latestCalculationJob?.parentJobId !== undefined))
            && latestReportJob?.runningStatus === RunningStatus.Completed
            && latestReportJob?.isSuccessful && latestReportJob?.parentJobId === undefined
        ) {
            setLiveReportStatusMessage("Calculation run in progress. Please wait.");
        } else if ((latestCalculationJob?.runningStatus === RunningStatus.Completed && latestCalculationJob?.parentJobId === undefined)
            && (latestReportJob?.isActive
                && (latestReportJob?.runningStatus !== RunningStatus.Completed ||
                    latestReportJob?.parentJobId !== undefined))) {
            setLiveReportStatusMessage("Live report refresh in progress, please wait.");
        } else if (latestReportJob?.isFailed) {
            addLiveReportErrors(`The live report refresh failed - try again`)
        } else {
            setLiveReportStatusMessage("");
        }
    }

    function setInitialExpandedStatus(reports: ReportMetadataViewModel[], expanded: boolean) {
        reports.map((fundingStructureItem: ReportMetadataViewModel) => {
            fundingStructureItem.expanded = expanded;
        });
    }

    function getDistinctPublishedReports(reports: ReportMetadataViewModel[]) {
        const reportNames: string[] = [];
        reports.filter((report) => report.category === ReportCategory.History).map((reportMetadataViewModel: ReportMetadataViewModel) => {
            reportNames.push(reportMetadataViewModel.name);
        });

        return new Set(reportNames.sort((a, b) => a.localeCompare(b)));
    }

    function searchReports(reportName: string) {
        const downloadableReportsCopy: ReportMetadataViewModel[] = downloadableReports as ReportMetadataViewModel[];
        expandReportByName(downloadableReportsCopy, reportName, reportAccordionReactRef, nullReactRef);
        setDownloadableReports(downloadableReportsCopy);
        setReportsRenderInternalState(true);
    }

    function openCloseAllReports(isOpen: boolean) {
        setAllExpanded(isOpen);
        updateDownloadableReportsExpandStatus(downloadableReports, isOpen);
    }

    function updateDownloadableReportsExpandStatus(downloadableReports: ReportMetadataViewModel[], expandedStatus: boolean) {
        downloadableReports.map((downloadableReport: ReportMetadataViewModel) => {
            downloadableReport.expanded = expandedStatus;
        });
    }

    function expandReportByName(reportsToFilter: ReportMetadataViewModel[], keyword: string,
                                customRef: React.MutableRefObject<null>, nullRef: React.MutableRefObject<null>) {
        reportsToFilter.map((report: ReportMetadataViewModel) => {
            report.customRef = nullRef;
            report.expanded = false;
        });

        let isRefAlreadyAssigned = false;
        reportsToFilter.map((report: ReportMetadataViewModel) => {
                if (report.name.toLowerCase() === keyword.toLowerCase()) {
                    report.expanded = true;
                    if (!isRefAlreadyAssigned) {
                        report.customRef = customRef;
                        isRefAlreadyAssigned = true;
                    }
                }
            }
        );
    }

    function submitRefresh() {
        clearLiveReportErrorMessages();
        runCalculationRefresh();
    }

    const runCalculationRefresh = async () => {
        setIsRefreshingReports(true);
        try {
            await runGenerateCalculationCsvResultsJob(props.specificationId);
            setIsRefreshingReports(false);
        } catch (err) {
            addLiveReportErrors(`Live reports couldn't refresh, please try again. ${err}`)
            setIsRefreshingReports(false);
        }
    }

    const handleExpandClick = () => {
        setAllExpanded(!allExpanded);
    }

    return <section className="govuk-tabs__panel" id="downloadable-reports">
        <h2 className="govuk-heading-l">Downloadable reports</h2>
        <MultipleErrorSummary errors={liveReportErrors}/>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
                <div className="govuk-body-l" hidden={downloadableReports.length > 0}>
                    There are no reports available for this Specification
                </div>

                <div hidden={!downloadableReports.some(dr => dr.grouping === ReportGrouping.Live)}>
                    <h3 className="govuk-heading-m govuk-!-margin-top-5" data-testid={"live-report"}>Live reports</h3>
                    <div className={`govuk-form-group ${liveReportErrors.length > 0 ? "govuk-form-group--error" : ""}`}>
                        {downloadableReports.filter(dr => dr.grouping === ReportGrouping.Live)
                            .map((dlr, index) =>
                                    <DownloadableReportItem key={`live-report-${index}`} itemKey={`live-report-${index}`} reportMetadataViewModel={dlr} />
                            )}
                        <div className="attachment__thumbnail">
                            <a className="govuk-link" target="_self"
                               aria-hidden="true" href="">
                                <svg
                                    className="attachment__thumbnail-image thumbnail-image-small "
                                    version="1.1" viewBox="0 0 99 140" width="99"
                                    height="140" aria-hidden="true">
                                    <path
                                        d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z"
                                    ></path>
                                    <path
                                        d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z"
                                    ></path>
                                    <path
                                        d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5"
                                        fill="none"
                                    ></path>
                                </svg>
                            </a>
                        </div>
                        <div className="attachment__details">
                            <h4 className="govuk-heading-s">
                                <p hidden={downloadableReports.some(dr => dr.category === ReportCategory.Live
                                    && latestReportJob?.runningStatus === RunningStatus.InProgress
                                    && latestCalculationJob?.runningStatus === RunningStatus.InProgress)}
                                   className="govuk-body-m"><strong>Refresh live reports to
                                    view the latest results</strong></p>

                                <p hidden={latestReportJob?.runningStatus !== RunningStatus.InProgress
                                && latestCalculationJob?.runningStatus !== RunningStatus.InProgress}
                                   className="govuk-body-m"><strong>Generating new report</strong></p>


                                {(isCheckingForReportJob || isCheckingForCalculationJob ||
                                    hasReportJob || hasCalculationJob || isRefreshingReports) &&
                                <div className="govuk-form-group">
                                    <LoadingFieldStatus title={"Checking for running jobs..."}
                                                        hidden={!isCheckingForReportJob
                                                        && !isCheckingForCalculationJob && !isRefreshingReports}/>


                                    <LoadingFieldStatus title={liveReportStatusMessage}
                                                        hidden={liveReportStatusMessage === ""}/>
                                </div>
                                }
                            </h4>
                        </div>
                        {liveReportErrors.length > 0 ? <span className="govuk-error-message">
                                                        <span className="govuk-visually-hidden">Error:</span> Live reports couldn't refresh, please try again.
                                                        </span>
                            : null
                        }
                    </div>
                    <div className="govuk-grid-row govuk-!-margin-top-3">
                        <div className="govuk-grid-column-full">
                            <button data-testid="refresh-button" className="govuk-button"
                                    type="button"
                                    aria-label="Refresh"
                                    disabled={isRefreshingReports}
                                    onClick={submitRefresh}>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
                <div hidden={!downloadableReports.some(dr => dr.category === ReportCategory.History)}>
                    <h3 className="govuk-heading-m govuk-!-margin-top-5">Published reports</h3>

                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-third">
                        </div>
                        <div className="govuk-grid-column-two-thirds">
                            <div className="govuk-form-group search-container">
                                <label className="govuk-label">
                                    Search for a published report
                                </label>
                                {<InputSearch id={"input-auto-complete"} suggestions={reportsSearchSuggestions}
                                              callback={searchReports}/>}
                            </div>
                        </div>
                    </div>

                    <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
                        <div className="govuk-accordion__controls">
                            <button type="button" onClick={handleExpandClick} className="govuk-accordion__open-all"
                                    data-testid={"open-close"}
                                    aria-expanded={allExpanded ? "true" : "false"}>
                                {allExpanded ? "Close" : "Open"} all<span
                                className="govuk-visually-hidden"> sections</span>
                            </button>
                        </div>
                        {
                            downloadableReportsGrouping
                                .map((group, groupIndex) => {
                                    return <AccordionPanel title={`${group} level reports`}
                                                           key={`panel-group-${groupIndex}`} id={`panel-${groupIndex}`}
                                                           boldSubtitle={""} subtitle={""}
                                                           expanded={downloadableReports.some((r) =>
                                                               r.expanded && r.grouping === group)}
                                                           autoExpand={allExpanded}>
                                        {
                                            [...new Set(downloadableReports.filter(dr => dr.grouping === group)
                                                .map(p => p.groupingLevel))]
                                                .map((groupLevel, groupLevelIndex) => {
                                                        return <div key={groupLevelIndex} id="accordion-default-content-1"
                                                                    className="govuk-accordion__section-content"
                                                                    aria-labelledby="accordion-default-heading-1">
                                                            <h1 className="govuk-heading-s govuk-!-margin-bottom-3">
                                                                {
                                                                    groupLevel === ReportGroupingLevel.All ? "All versions " :
                                                                        groupLevel === ReportGroupingLevel.Current ? "Current state " :
                                                                            groupLevel === ReportGroupingLevel.Released ? "Released only " : ""
                                                                }
                                                                {group.toLowerCase()} level funding line reports
                                                            </h1>
                                                            {
                                                                downloadableReports.filter(dlr => dlr.grouping === group && dlr.groupingLevel === groupLevel)
                                                                    .map((dlr, dlrIndex) => {
                                                                        return <DownloadableReportItem
                                                                            key={`published-report-${dlrIndex}`}
                                                                            itemKey={groupLevel}
                                                                            reportMetadataViewModel={dlr}/>
                                                                    })}
                                                        </div>
                                                    }
                                                )}
                                    </AccordionPanel>
                                })
                        }
                    </div>
                </div>
            </div>
        </div>
        <BackToTop id={"downloadable-reports"} hidden={downloadableReports.length === 0} />
    </section>
}
