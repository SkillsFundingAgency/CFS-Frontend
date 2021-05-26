import {renderHook} from "@testing-library/react-hooks";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {useFetchLatestSpecificationJob} from "../../hooks/Jobs/useFetchLatestSpecificationJob";
import {JobType} from "../../types/jobType";
import {act} from 'react-test-renderer';
import {RunningStatus} from "../../types/RunningStatus";
import {JobResponse} from "../../types/jobDetails";
import {QueryClient, QueryClientProvider} from "react-query";
import React from "react";
import {QueryClientProviderTestWrapper} from "./QueryClientProviderTestWrapper";

const specificationId = "abc123";
const mockQueuedJobResult1: JobResponse = {
    jobId: "sdfg",
    jobType: JobType.RefreshFundingJob,
    specificationId: specificationId,
    runningStatus: RunningStatus.Queued,
    completionStatus: undefined,
    lastUpdated: new Date("2020-11-20T10:29:03.2643188+00:00"),
    created: new Date("2020-11-20T10:28:03.2643188+00:00"),
};
const mockQueuedJobResult2: JobResponse = {
    jobId: "tyije5",
    jobType: JobType.RefreshFundingJob,
    specificationId: specificationId,
    runningStatus: RunningStatus.InProgress,
    completionStatus: undefined,
    lastUpdated: new Date("2020-11-20T10:31:03.2643188+00:00"),
    created: new Date("2020-11-20T10:29:03.2643188+00:00"),
};

describe("useFetchLatestSpecificationJob tests", () => {

    describe("Handles invalid inputs correctly", () => {
        it("when specification id is null", async () => {
            const {result} =
                renderHook(() =>  useFetchLatestSpecificationJob({
                        jobFilter: {
                            jobTypes: [JobType.RefreshFundingJob],
                            specificationId: ""
                        }}),
                    {wrapper: QueryClientProviderTestWrapper});
            expect(result.current.lastJob).toBe(undefined);
            expect(result.current.isCheckingForJob).toBe(false);
            expect(result.current.haveErrorCheckingForJob).toBe(false);
            expect(result.current.errorCheckingForJob).toBe("");
            expect(result.current.isCheckingForJob).toBe(false);
            expect(result.current.isFetching).toBe(false);
            expect(result.current.isFetched).toBe(false);
        });
        it("when no job types supplied", async () => {
            const {result} =
                renderHook(() =>  useFetchLatestSpecificationJob({
                    jobFilter: {
                        jobTypes: [],
                        specificationId
                    }}),
                    {wrapper: QueryClientProviderTestWrapper});
            expect(result.current.lastJob).toBe(undefined);
            expect(result.current.isCheckingForJob).toBe(false);
            expect(result.current.haveErrorCheckingForJob).toBe(false);
            expect(result.current.errorCheckingForJob).toBe("");
            expect(result.current.isCheckingForJob).toBe(false);
            expect(result.current.isFetching).toBe(false);
            expect(result.current.isFetched).toBe(false);
        });
    });

    describe("When passing valid inputs", () => {
        const mock = new MockAdapter(axios);

        beforeAll(() => {
            mock.onPost(`/api/jobs/${specificationId}`, [JobType.RefreshFundingJob.toString()])
                .replyOnce(200, [{}, mockQueuedJobResult1, {}, mockQueuedJobResult2, {}]);
        });
        afterAll(() => {
            mock.reset();
            jest.resetAllMocks()
        });

        it("returns correct latest job", async () => {
            const {result, waitForNextUpdate} =
                renderHook(() =>  useFetchLatestSpecificationJob({
                    jobFilter: {
                        jobTypes: [JobType.RefreshFundingJob],
                        specificationId: specificationId
                    }}),
                {wrapper: QueryClientProviderTestWrapper});

            await act(async () => {
                await waitForNextUpdate();
            });

            expect(result.current.lastJob).not.toBeUndefined();
            if (result.current.lastJob) {
                expect(result.current.lastJob.jobId).toEqual(mockQueuedJobResult2.jobId);
                expect(result.current.lastJob.jobType).toEqual(mockQueuedJobResult2.jobType);
                expect(result.current.lastJob.specificationId).toEqual(mockQueuedJobResult2.specificationId);
                expect(result.current.lastJob.completionStatus).toEqual(mockQueuedJobResult2.completionStatus);
                expect(result.current.lastJob.runningStatus).toEqual(mockQueuedJobResult2.runningStatus);
                expect(result.current.lastJob.lastUpdated).not.toBeUndefined();
                expect(result.current.lastJob.created).not.toBeUndefined();
            }
        });
    });
});