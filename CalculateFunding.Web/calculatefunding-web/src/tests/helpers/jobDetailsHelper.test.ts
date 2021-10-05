import { DateTime } from "luxon";

import { getLatestJob, removeDuplicateJobsById, sortByLatest } from "../../helpers/jobDetailsHelper";
import { JobDetails } from "../../types/jobDetails";

describe("jobDetailsHelper tests", () => {
  describe("removeDuplicateJobsById tests", () => {
    it("returns nothing if no jobs", () => {
      const jobs: JobDetails[] = [];

      const result = removeDuplicateJobsById(jobs);

      expect(result).toEqual([]);
    });

    it("returns without duplicate", () => {
      const jobs: JobDetails[] = [
        createDummyJob({ jobId: "111" }),
        createDummyJob({ jobId: "222" }),
        createDummyJob({ jobId: "111" }),
      ];

      const result = removeDuplicateJobsById(jobs);

      expect(result).toHaveLength(2);
      expect(result).toEqual([createDummyJob({ jobId: "111" }), createDummyJob({ jobId: "222" })]);
    });
  });

  describe("sortByLatest tests", () => {
    it("returns nothing if no jobs", () => {
      const jobs: JobDetails[] = [];

      const result = sortByLatest(jobs);

      expect(result).toEqual([]);
    });

    it("returns in correct order", () => {
      const baseDate = DateTime.fromISO("2016-05-25T09:08:34.123");
      const jobs: JobDetails[] = [
        createDummyJob({ lastUpdated: baseDate.minus({ hour: 1 }).toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.plus({ minute: 1 }).toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.minus({ minute: 1 }).toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.toJSDate() }),
      ];

      const result = sortByLatest(jobs);

      expect(result).toHaveLength(4);
      expect(result).toEqual([
        createDummyJob({ lastUpdated: baseDate.plus({ minute: 1 }).toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.minus({ minute: 1 }).toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.minus({ hour: 1 }).toJSDate() }),
      ]);
    });
  });

  describe("latestJob tests", () => {
    it("returns undefined if no jobs", () => {
      const jobs: JobDetails[] = [];

      const result = getLatestJob(jobs);

      expect(result).toStrictEqual(undefined);
    });

    it("returns correct result", () => {
      const baseDate = DateTime.fromISO("2016-05-25T09:08:34.123");
      const jobs: JobDetails[] = [
        createDummyJob({ lastUpdated: baseDate.minus({ hour: 1 }).toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.plus({ minute: 1 }).toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.plus({ minute: 12 }).toJSDate() }),
        createDummyJob({ lastUpdated: baseDate.minus({ minute: 1 }).toJSDate() }),
      ];

      const result = getLatestJob(jobs);

      expect(result).toEqual(createDummyJob({ lastUpdated: baseDate.plus({ minute: 12 }).toJSDate() }));
    });
  });

  function createDummyJob({
    jobId = "job-id",
    lastUpdated = DateTime.fromISO("2000-01-01T00:00:00.000").toJSDate(),
  }: {
    jobId?: string;
    lastUpdated?: Date;
  }): JobDetails {
    return { jobId, lastUpdated } as JobDetails;
  }
});
