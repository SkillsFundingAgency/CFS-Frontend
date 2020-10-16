import {renderHook} from "@testing-library/react-hooks";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {useFetchLatestSpecificationJob} from "../../hooks/Jobs/useFetchLatestSpecificationJob";
import {JobType} from "../../types/jobType";
import {act} from 'react-test-renderer';
import {JobSummary} from "../../types/jobSummary";
import {RunningStatus} from "../../types/RunningStatus";

const mockQueuedJobResult: JobSummary = {
        jobId: "sdfg",
        jobType: JobType.RefreshFundingJob,
        specificationId: "abc123",
        runningStatus: RunningStatus.Queued,
        completionStatus: null,
        lastUpdated: new Date(),
        created: new Date(),
    };

describe("useFetchLatestSpecificationJob tests", () => {
    const specificationId = "abc123";
    
    describe("Handles invalid inputs correctly", () => {
        it("when specification id is null", async () => {
            const {result, waitForNextUpdate, waitForValueToChange} =
                renderHook(() =>
                    useFetchLatestSpecificationJob("", [JobType.RefreshFundingJob]));
            expect(result.current.lastJob).toBe(undefined);
            expect(result.current.isCheckingForJob).toBe(false);
            expect(result.current.haveErrorCheckingForJob).toBe(false);
            expect(result.current.errorCheckingForJob).toBe("");
            expect(result.current.isCheckingForJob).toBe(false);
            expect(result.current.isFetching).toBe(false);
            expect(result.current.isFetched).toBe(false);
        });
        it("when no job types supplied", async () => {
            const {result, waitForNextUpdate} =
                renderHook(() =>
                    useFetchLatestSpecificationJob(specificationId, []));
            await act(async () => {
                await waitForNextUpdate();
            });
            
            expect(result.current).toBeTruthy();
            expect(result.current.lastJob).toBe(undefined);
            expect(result.current.haveErrorCheckingForJob).toBe(true);
            expect(result.current.errorCheckingForJob).toBe("Missing job types");
            expect(result.current.isCheckingForJob).toBe(false);
            expect(result.current.isFetching).toBe(false);
            expect(result.current.isFetched).toBe(false);
        });
    });

    describe("When api throws a 500", () => {
        it("returns correct error", async () => {
            const {result, waitForNextUpdate, waitForValueToChange} = 
                renderHook(() => 
                    useFetchLatestSpecificationJob(specificationId, [JobType.CreateSpecificationJob]));

            await act(async () => {
                await waitForValueToChange(() => result.current.isCheckingForJob);
            });
            
            expect(result.current.lastJob).toBeUndefined();
            expect(result.current.haveErrorCheckingForJob).toBeTruthy();
            expect(result.current.errorCheckingForJob).toBe("Request failed with status code 404");
        });
    });
    describe("When passing valid inputs", () => {
        const mock = new MockAdapter(axios);

        beforeAll(() => {
            mock.onGet(`/api/jobs/${specificationId}/${JobType.RefreshFundingJob}`).reply(200, [{}, mockQueuedJobResult, {}]);
        });
        afterAll(() => {
            mock.reset();
            jest.clearAllMocks()
        });
        it("returns correct latest job", async () => {
            const {result, waitForNextUpdate} = 
                renderHook(() => 
                    useFetchLatestSpecificationJob(specificationId, [JobType.RefreshFundingJob]));

            await act(async () => {
                await waitForNextUpdate();
            });
            
            expect(result.current.lastJob).not.toBeUndefined();
            if (result.current.lastJob) {
                expect(result.current.lastJob.jobId).toEqual(mockQueuedJobResult.jobId);
                expect(result.current.lastJob.jobType).toEqual(mockQueuedJobResult.jobType);
                expect(result.current.lastJob.specificationId).toEqual(mockQueuedJobResult.specificationId);
                expect(result.current.lastJob.completionStatus).toEqual(mockQueuedJobResult.completionStatus);
                expect(result.current.lastJob.runningStatus).toEqual(mockQueuedJobResult.runningStatus);
                expect(result.current.lastJob.lastUpdated).not.toBeUndefined();
                expect(result.current.lastJob.created).not.toBeUndefined();
            }
        });
    });
});