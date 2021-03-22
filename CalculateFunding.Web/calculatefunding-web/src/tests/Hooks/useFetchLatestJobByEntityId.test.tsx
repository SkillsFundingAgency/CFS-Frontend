import {renderHook} from "@testing-library/react-hooks";
import {useFetchLatestJobByEntityId} from "../../hooks/Jobs/useFetchLatestJobByEntityId";
import {QueryClientProviderTestWrapper} from "./QueryClientProviderTestWrapper";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {act} from "react-test-renderer";
import {JobDetails} from "../../types/jobDetails";
import {RunningStatus} from "../../types/RunningStatus";

describe("useFetchLatestJobByEntityId tests ", () => {

    describe(" handles invalid inputs correctly ", () => {
        it('should return false when specificationId is null', () => {
            const {result} = renderHook(() => useFetchLatestJobByEntityId("", "ENTITY123"),
                {
                    wrapper: QueryClientProviderTestWrapper
                });

            expect(result.current.errorCheckingForJob).toBe("");
            expect(result.current.haveErrorCheckingForJob).toBe(false);
            expect(result.current.isCheckingForJob).toBe(false);
            expect(result.current.isFetching).toBe(false);
            expect(result.current.isFetched).toBe(false);
            expect(result.current.lastJob).toBe(undefined);
        });

        it("when entityId is null", async () => {
            const {result} =
                renderHook(() =>
                        useFetchLatestJobByEntityId("SPEC123", ""),
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
        const specificationId: string = "SPEC123";
        const entityId: string = "ENTITY123";
        const mockValidQueuedJobResult: JobDetails = {
            failures: [],
            isActive: false,
            isComplete: false,
            isFailed: false,
            isSuccessful: false,
            jobDescription: "test job",
            jobId: "123",
            runningStatus: RunningStatus.Completed,
            statusDescription: "",
            lastUpdated: new Date(Date.UTC(2001, 1, 15)),
            created: new Date(Date.UTC(2001, 1, 15))
        }

        const mockAnInvalidJobResult: JobDetails = {
            failures: [],
            isActive: false,
            isComplete: false,
            isFailed: false,
            isSuccessful: false,
            jobDescription: "test job",
            jobId: "",
            runningStatus: RunningStatus.Completed,
            statusDescription: "",
            lastUpdated: new Date(Date.UTC(2001, 1, 15)),
            created: new Date(Date.UTC(2001, 1, 15))
        }

        afterAll(() => {
            mock.reset();
            jest.resetAllMocks()
        });

        it("returns correct latest job", async () => {

            mock.onGet(`/api/jobs/latest-by-entity-id/${specificationId}/${entityId}`)
                .replyOnce(200, mockValidQueuedJobResult);

            const {result, waitForNextUpdate} =
                renderHook(() =>
                        useFetchLatestJobByEntityId(specificationId, entityId),
                    {wrapper: QueryClientProviderTestWrapper});

            await act(async () => {
                await waitForNextUpdate();
            });

            expect(result.current.lastJob).not.toBeUndefined();
            if (result.current.lastJob) {
                expect(result.current.lastJob.jobId).toEqual(mockValidQueuedJobResult.jobId);
                expect(result.current.lastJob.jobType).toEqual(mockValidQueuedJobResult.jobType);
                expect(result.current.lastJob.specificationId).toEqual(mockValidQueuedJobResult.specificationId);
                expect(result.current.lastJob.completionStatus).toEqual(mockValidQueuedJobResult.completionStatus);
                expect(result.current.lastJob.runningStatus).toEqual(mockValidQueuedJobResult.runningStatus);
                expect(result.current.lastJob.lastUpdated).not.toBeUndefined();
                expect(result.current.lastJob.created).not.toBeUndefined();
            }
        });

        it("does not return a job given job is undefined", async () => {
            mock.onGet(`/api/jobs/latest-by-entity-id/${specificationId}/${entityId}`)
                .replyOnce(200, mockAnInvalidJobResult);

            const {result, waitForNextUpdate} =
                renderHook(() =>
                        useFetchLatestJobByEntityId(specificationId, entityId),
                    {wrapper: QueryClientProviderTestWrapper});

            await act(async () => {
                await waitForNextUpdate();
            });

            expect(result.current.lastJob).toBeUndefined();
        });
    });
});