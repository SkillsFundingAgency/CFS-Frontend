import {MultipleErrorSummary} from "../MultipleErrorSummary";
import {DateFormatter} from "../DateFormatter";
import {RunningStatus} from "../../types/RunningStatus";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import * as React from "react";
import {useEffect, useState} from "react";
import {getDownloadableReportsService} from "../../services/specificationService";
import {ReportMetadataViewModel} from "../../types/Specifications/ReportMetadataViewModel";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {useErrors} from "../../hooks/useErrors";
import {runGenerateCalculationCsvResultsJob} from "../../services/calculationService";
import {ReportCategory} from "../../types/Specifications/ReportCategory";

export function DownloadableReports(props: {
    specificationId: string,
    fundingPeriodId: string,
}) {

    const [downloadableReports, setDownloadableReports] = useState<ReportMetadataViewModel[]>([]);
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
        } else {
            setLiveReportStatusMessage("");
        }
    }

    useEffect(() => {
        jobStatusReport();
    }, [hasCalculationJob, hasReportJob]);

    useEffect(() => {
        getDownloadableReportsService(props.specificationId, props.fundingPeriodId)
            .then((result) => {
                const response = result.data as ReportMetadataViewModel[];
                setDownloadableReports(response);
            }).catch((err) => {
            addLiveReportErrors(`Error fetching downloadable reports. ${err}`);
        });
    }, [props.specificationId]);

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

    return <section className="govuk-tabs__panel" id="downloadable-reports">
        <h2 className="govuk-heading-l">Downloadable reports</h2>
        <MultipleErrorSummary errors={liveReportErrors}/>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
                <div className="govuk-body-l" hidden={downloadableReports.length > 0}>
                    There are no reports available for this Specification
                </div>

                <div hidden={!downloadableReports.some(dr => dr.category === ReportCategory.Live)}>
                    <h3 className="govuk-heading-m govuk-!-margin-top-5">Live reports</h3>
                    <div className={`govuk-form-group ${liveReportErrors.length > 0 ? "govuk-form-group--error" : ""}`}>
                        {liveReportErrors.length > 0 ? <span className="govuk-error-message">
                                                        <span className="govuk-visually-hidden">Error:</span> Live reports couldn't refresh, please try again.
                                                        </span>
                            : null
                        }
                        {downloadableReports.filter(dr => dr.category === "Live").map((dlr, index) => <div>
                                <div className="attachment__thumbnail" key={index}>
                                    <a href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`}
                                       className="govuk-link" target="_self"
                                       aria-hidden="true">
                                        <svg
                                            className="attachment__thumbnail-image thumbnail-image-small "
                                            version="1.1" viewBox="0 0 99 140" width="99"
                                            height="140"
                                            aria-hidden="true">
                                            <path
                                                d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z"
                                            ></path>
                                            <path
                                                d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z"
                                            ></path>
                                            <path
                                                d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5"
                                                fill="none" stroke-width="2"></path>
                                        </svg>
                                    </a>
                                </div>
                                <div className="attachment__details">
                                    <h4 className="govuk-heading-s">
                                        <a className="govuk-link" target="_self"
                                           href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`}>{dlr.name}</a>
                                        {
                                            downloadableReports.some(dr => dr.specificationReportIdentifier === dlr.specificationReportIdentifier
                                                && dr.lastModified > dlr.lastModified) ? <strong
                                                    className="govuk-tag govuk-!-margin-left-2 govuk-tag--green ">
                                                    New version available
                                                </strong>
                                                : null
                                        }
                                    </h4>
                                    <p className="govuk-body-s">
                                        <span>{dlr.format}</span>, <span>{dlr.size}</span>, Updated: <span><DateFormatter
                                        date={dlr.lastModified}/></span>
                                    </p>
                                </div>
                                <div className="govuk-clearfix"></div>
                            </div>
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
                </div>
                <div hidden={!downloadableReports.some(dr => dr.category === ReportCategory.History)}>
                    <h3 className="govuk-heading-m govuk-!-margin-top-5">Published reports</h3>
                    {downloadableReports.filter(dr => dr.category === ReportCategory.History).map((dlr, index) =>
                        <div key={index}>
                            <div className="attachment__thumbnail">
                                <a href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`}
                                   className="govuk-link" target="_self"
                                   aria-hidden="true">
                                    <svg
                                        className="attachment__thumbnail-image thumbnail-image-small "
                                        version="1.1" viewBox="0 0 99 140" width="99"
                                        height="140"
                                        aria-hidden="true">
                                        <path
                                            d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z"
                                            stroke-width="0"></path>
                                        <path
                                            d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z"
                                            stroke-width="0"></path>
                                        <path
                                            d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5"
                                            fill="none" stroke-miterlimit="10"
                                            stroke-width="2"></path>
                                    </svg>
                                </a>
                            </div>
                            <div className="attachment__details">
                                <h4 className="govuk-heading-s">
                                    <a className="govuk-link" target="_self"
                                       href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`}>{dlr.name}</a>
                                </h4>
                                <p className="govuk-body-s">
                                    <span>{dlr.format}</span>, <span>{dlr.size}</span>, Updated: <span><DateFormatter
                                    date={dlr.lastModified}/></span>
                                </p>
                            </div>
                            <div className="govuk-clearfix"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </section>
}