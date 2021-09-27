import { DateTime } from "luxon";

import { findMatchingSubs } from "../../helpers/jobSubscriptionUtilities";
import { JobDetails } from "../../types/jobDetails";
import { JobSubscription } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import { RunningStatus } from "../../types/RunningStatus";

describe("jobSubscriptionUtilities tests", () => {
  describe("findMatchingSubs tests", () => {
    it("returns nothing if no subscriptions", () => {
      const subs: JobSubscription[] = [];
      const job: JobDetails = {
        failures: [],
        isActive: false,
        isComplete: false,
        isFailed: false,
        isSuccessful: false,
        jobDescription: "",
        jobId: "",
        runningStatus: RunningStatus.Completed,
        statusDescription: "",
        specificationId: "ertdhset",
      };

      const result = findMatchingSubs(subs, job);

      expect(result).toHaveLength(0);
    });

    it("returns nothing if matching job type but not matching spec id", () => {
      const sub: JobSubscription = {
        id: "z35hsrt6h",
        isEnabled: true,
        filterBy: {
          specificationId: "different",
          jobTypes: [JobType.RefreshFundingJob],
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const subs: JobSubscription[] = [sub];
      const job: JobDetails = {
        failures: [],
        isActive: true,
        isComplete: false,
        isFailed: false,
        isSuccessful: false,
        jobDescription: "",
        jobId: "",
        runningStatus: RunningStatus.Completed,
        statusDescription: "",
        specificationId: "hello",
      };

      const result = findMatchingSubs(subs, job);

      expect(result).toHaveLength(0);
    });

    it("returns match if matching job id, job types, and job id", () => {
      const sub: JobSubscription = {
        id: "z35hsrt6h",
        isEnabled: true,
        filterBy: {
          specificationId: "helloSpec",
          jobTypes: [JobType.RefreshFundingJob],
          jobId: "helloId",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const subs: JobSubscription[] = [sub];
      const job: JobDetails = {
        failures: [],
        isActive: false,
        isComplete: false,
        isFailed: false,
        isSuccessful: false,
        jobDescription: "",
        jobId: "helloId",
        jobType: JobType.RefreshFundingJob,
        runningStatus: RunningStatus.InProgress,
        statusDescription: "",
        specificationId: "helloSpec",
      };

      const result = findMatchingSubs(subs, job);

      expect(result).toHaveLength(1);
    });

    it("returns match if matching job trigger entity", () => {
      const sub: JobSubscription = {
        id: "z35hsrt6h",
        isEnabled: true,
        filterBy: {
          specificationId: "helloSpec",
          triggerByEntityId: "trigger",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const subs: JobSubscription[] = [sub];
      const job: JobDetails = {
        failures: [],
        isActive: false,
        isComplete: false,
        isFailed: false,
        isSuccessful: false,
        jobDescription: "",
        jobId: "hello",
        jobType: JobType.RefreshFundingJob,
        triggeredByEntityId: "trigger",
        trigger: { entityId: "trigger", entityType: "", message: "" },
        runningStatus: RunningStatus.Completed,
        statusDescription: "",
        specificationId: "helloSpec",
      };

      const result = findMatchingSubs(subs, job);

      expect(result).toHaveLength(1);
    });

    it("returns match if matching child job", () => {
      const sub: JobSubscription = {
        id: "z35hsrt6h",
        isEnabled: true,
        filterBy: {
          jobId: "helloId",
          includeChildJobs: true,
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const subs: JobSubscription[] = [sub];
      const job: JobDetails = {
        failures: [],
        isActive: false,
        isComplete: false,
        isFailed: false,
        isSuccessful: false,
        jobDescription: "",
        jobId: "different",
        parentJobId: "helloId",
        jobType: JobType.RefreshFundingJob,
        triggeredByEntityId: "trigger",
        trigger: { entityId: "trigger", entityType: "", message: "" },
        runningStatus: RunningStatus.Completed,
        statusDescription: "",
        specificationId: "whateverSpec",
      };

      const result = findMatchingSubs(subs, job);

      expect(result).toHaveLength(1);
    });

    it("returns nothing if matching job trigger entity but not job type", () => {
      const sub: JobSubscription = {
        id: "z35hsrt6h",
        isEnabled: true,
        filterBy: {
          specificationId: "not applicable",
          triggerByEntityId: "trigger",
          jobTypes: [JobType.CreateAllocationJob],
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const subs: JobSubscription[] = [sub];
      const job: JobDetails = {
        failures: [],
        isActive: false,
        isComplete: false,
        isFailed: false,
        isSuccessful: false,
        jobDescription: "",
        jobId: "hello",
        jobType: JobType.RefreshFundingJob,
        triggeredByEntityId: "trigger",
        trigger: { entityId: "trigger", entityType: "", message: "" },
        runningStatus: RunningStatus.Completed,
        statusDescription: "",
        specificationId: "ertdhset",
      };

      const result = findMatchingSubs(subs, job);

      expect(result).toHaveLength(0);
    });
  });
});
