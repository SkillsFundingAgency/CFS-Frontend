﻿import {RouteComponentProps, useHistory} from "react-router";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Footer} from "../../components/Footer";
import * as publishedProviderService from "../../services/publishedProviderService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {useMutation, useQuery} from "react-query";
import {JobCreatedResponse} from "../../types/JobCreatedResponse";
import {AxiosError} from "axios";
import {BatchUploadResponse} from "../../types/PublishedProvider/BatchUploadResponse";
import {useErrors} from "../../hooks/useErrors";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {BatchValidationRequest} from "../../types/PublishedProvider/BatchValidationRequest";
import {FundingActionType} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import {useDispatch} from "react-redux";
import * as actions from "../../actions/FundingSearchSelectionActions";
import {HistoryPage} from "../../types/HistoryPage";


export interface UploadBatchRouteProps {
    fundingStreamId: string,
    fundingPeriodId: string,
    specificationId: string
}

export function UploadBatch({match}: RouteComponentProps<UploadBatchRouteProps>) {
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;
    const [fileName, setFileName] = useState<string>("");
    const [theFile, setTheFile] = useState<File>();
    const [jobId, setJobId] = useState<string | undefined>();
    const [batchId, setBatchId] = useState<string | undefined>();
    const [isUpdating, setIsUpdating] = useState<boolean>();
    const [isWaitingForJob, setIsWaitingForJob] = useState<boolean>();
    const [actionType, setActionType] = useState<FundingActionType | undefined>();
    const history = useHistory();
    const dispatch = useDispatch();
    const {errors, addError, clearErrorMessages} = useErrors();
    const currentPage: HistoryPage = {
        title: "Upload batch file",
        path: history.location.pathname
    };

    const {latestJob, isCheckingForJob} =
        useLatestSpecificationJobWithMonitoring(
            specificationId,
            [JobType.BatchPublishedProviderValidationJob,
                JobType.RefreshFundingJob,
                JobType.ApproveAllProviderFundingJob,
                JobType.ApproveBatchProviderFundingJob,
                JobType.PublishBatchProviderFundingJob,
                JobType.PublishAllProviderFundingJob],
            err => addError({error: err, description: "Error checking for background jobs running"}));
    const {mutate: uploadBatchFile, isLoading: isUploadingBatchFile} =
        useMutation<BatchUploadResponse, AxiosError, File>(
            async (theFile) => {
                return (await publishedProviderService.uploadBatchOfPublishedProviders(theFile)).data;
            },
            {
                onError: err => addError({error: err, description: "Error while trying to queue job to validate your batch file"}),
                onSuccess: data => {
                    setBatchId(data.batchId);
                    createValidationJob({
                        batchId: data.batchId,
                        specificationId: specificationId,
                        fundingStreamId: fundingStreamId,
                        fundingPeriodId: fundingPeriodId
                    })
                }
            }
        );
    const {data: publishedProviderIds, isLoading: isExtractingProviderIds} = useQuery<string[], AxiosError>(
        `batch-${batchId}-publishedProviderIds`,
        async () => (await publishedProviderService.getPublishedProvidersByBatch(batchId as string)).data,
        {
            enabled: (batchId !== undefined && jobId && latestJob && latestJob.jobId === jobId && latestJob.isSuccessful) === true,
            cacheTime: 0,
            staleTime: 0
        });
    const {mutate: createValidationJob, isLoading: isCreatingValidationJob} =
        useMutation<JobCreatedResponse, AxiosError, BatchValidationRequest>(
            async (request) => {
                return (await publishedProviderService.validatePublishedProvidersByBatch(request)).data;
            },
            {
                onError: err => addError({error: err, description: "Error while trying to create job to validate your batch file"}),
                onSuccess: data => {
                    setJobId(data.jobId);
                    setIsWaitingForJob(true);
                }
            }
        );

    const getFileToUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files !== null) {
            const file: File = e.target.files[0];
            setFileName(file.name);
            setTheFile(file);
        }
    }

    const uploadForApprove = async () => {
        setIsUpdating(true);
        clearErrorMessages();
        setActionType(FundingActionType.Approve);
        await uploadBatchFile(theFile as File);
    }

    const uploadForRelease = async () => {
        setIsUpdating(true);
        clearErrorMessages();
        setActionType(FundingActionType.Release);
        await uploadBatchFile(theFile as File);
    }

    useEffect(() => {
        if (!latestJob || latestJob.jobId !== jobId) return;

        if (isWaitingForJob) {
            setIsWaitingForJob(false);
        }

        if (latestJob.isFailed) {
            addError({error: latestJob.outcome ? latestJob.outcome : "", description: "Validation failed"});
            setIsUpdating(false);
        } else if (latestJob.isSuccessful && publishedProviderIds) {
            dispatch(actions.initialiseFundingSearchSelection(fundingStreamId, fundingPeriodId, specificationId));
            dispatch(actions.addProvidersToFundingSelection(publishedProviderIds));

            history.push(
                `/Approvals/ConfirmFunding/${fundingStreamId}/${fundingPeriodId}/${specificationId}/${actionType}`,
                {previousPage: currentPage})
        }
    }, [latestJob, publishedProviderIds]);

    const isBlocked = (isUpdating || isWaitingForJob || isUploadingBatchFile || isCreatingValidationJob || isCheckingForJob || isExtractingProviderIds ||
        (latestJob && latestJob.jobId === jobId && latestJob.isActive));
    const hasActiveJob = latestJob && latestJob.isActive;
    const hasUsersValidationJobActive = latestJob && latestJob.isActive && latestJob.jobId === jobId;
    const isValidatingOrUploading = isUpdating || isUploadingBatchFile || isCreatingValidationJob || isWaitingForJob || hasUsersValidationJobActive;


    return <div>
        <Header location={Section.Approvals}/>
        <div className="govuk-width-container">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing" id="main-content" role="main">
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <Breadcrumbs>
                                    <Breadcrumb name="Calculate funding" url="/"/>
                                    <Breadcrumb name="Approvals"/>
                                    <Breadcrumb name="Select specification" url="/Approvals/Select"/>
                                    <Breadcrumb name={currentPage.title}/>
                                </Breadcrumbs>
                            </div>
                        </div>

                        <MultipleErrorSummary errors={errors}/>

                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <div className="govuk-form-group">
                                    <fieldset className="govuk-fieldset">
                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                            <h1 className="govuk-fieldset__heading govuk-!-margin-bottom-5">
                                                {currentPage.title}
                                            </h1>
                                        </legend>

                                        {!isBlocked &&
                                        <ul className="govuk-list govuk-list--bullet">
                                            <li>The file is in xlsx format</li>
                                            <li>The file contains one UKPRN column</li>
                                            <li>The upload data must be in the first sheet of the xlsx file
                                            </li>
                                            <li>Providers already approved or released will not be shown in the provider count summaries
                                            </li>
                                        </ul>
                                        }
                                    </fieldset>
                                </div>
                            </div>
                        </div>

                        {isBlocked &&
                        <LoadingStatus title={
                            isValidatingOrUploading ? "Validating your upload" :
                                hasActiveJob ? "Background job is running" :
                                    isExtractingProviderIds ? "Extracting providers from file" : "Loading"}
                                       subTitle={
                                           isUploadingBatchFile ? "Uploading your file..." :
                                               isCreatingValidationJob ? "Creating job to validate file..." :
                                                   isWaitingForJob ? "Waiting for validation job to start..." :
                                                       latestJob && latestJob.isActive ? `Job ${latestJob.statusDescription}: ${latestJob.jobDescription}` : ""}/>
                        }

                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <div className="govuk-form-group">
                                    <label className="govuk-label" htmlFor="file-upload"><strong>
                                        Upload an XLSX file</strong>
                                    </label>
                                    <input className="govuk-file-upload"
                                           id="file-upload"
                                           name="file-upload"
                                           type="file"
                                           disabled={isBlocked}
                                           onChange={getFileToUpload}
                                    />
                                </div>
                                <button className="govuk-button govuk-!-margin-right-1"
                                        type="button"
                                        onChange={uploadForApprove}
                                        onClick={uploadForApprove}
                                        disabled={fileName.length === 0 || isBlocked}
                                        data-module="govuk-button">
                                    Approve funding
                                </button>
                                <button className="govuk-button govuk-button--warning govuk-!-margin-right-1"
                                        type="button"
                                        onChange={uploadForRelease}
                                        onClick={uploadForRelease}
                                        disabled={fileName.length === 0 || isBlocked}
                                        data-module="govuk-button">
                                    Release funding
                                </button>
                                <Link className="govuk-button govuk-button--secondary"
                                      data-module="govuk-button"
                                      to={`/Approvals/Select`}>
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}