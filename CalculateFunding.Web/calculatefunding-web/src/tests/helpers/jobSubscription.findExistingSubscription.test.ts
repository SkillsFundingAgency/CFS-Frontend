import { DateTime } from "luxon";

import { findExistingSubscription } from "../../helpers/jobSubscriptionUtilities";
import { AddJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import { JobSubscription } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";

describe("findExistingSubscription tests", () => {
  it("returns nothing if no subscriptions", () => {
    const subs: JobSubscription[] = [];
    const newSub: AddJobSubscription = {
      filterBy: {
        specificationId: "ertdhset",
      },
      onError: () => null,
    };

    const result = findExistingSubscription(subs, newSub);

    expect(result).toBe(undefined);
  });

  it("returns nothing if matching job type but not matching spec id", () => {
    const sub: JobSubscription = {
      id: "z35hsrt6h",
      filterBy: {
        specificationId: "different",
        jobTypes: [JobType.RefreshFundingJob],
      },
      isEnabled: true,
      startDate: DateTime.now(),
      onError: () => null,
    };
    const subs: JobSubscription[] = [sub];
    const newSub: AddJobSubscription = {
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
      },
      onError: () => null,
    };

    const result = findExistingSubscription(subs, newSub);

    expect(result).toBe(undefined);
  });

  it("returns nothing if not matching job id", () => {
    const sub: JobSubscription = {
      id: "z35hsrt6h",
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
        jobId: "different",
      },
      isEnabled: true,
      startDate: DateTime.now(),
      onError: () => null,
    };
    const subs: JobSubscription[] = [sub];
    const newSub: AddJobSubscription = {
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
        jobId: "34643",
      },
      isEnabled: true,
      onError: () => null,
    };

    const result = findExistingSubscription(subs, newSub);

    expect(result).toBe(undefined);
  });

  it("returns nothing if matching spec id but not matching job type", () => {
    const sub: JobSubscription = {
      id: "z35hsrt6h",
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
      },
      startDate: DateTime.now(),
      isEnabled: true,
      onError: () => null,
    };
    const subs: JobSubscription[] = [sub];
    const newSub: AddJobSubscription = {
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.CreateAllocationJob],
      },
      isEnabled: true,
      onError: () => null,
    };

    const result = findExistingSubscription(subs, newSub);

    expect(result).toBe(undefined);
  });

  it("returns match if only matching spec id", () => {
    const sub: JobSubscription = {
      id: "z35hsrt6h",
      filterBy: {
        specificationId: "spec123",
      },
      startDate: DateTime.now(),
      isEnabled: true,
      onError: () => null,
    };
    const subs: JobSubscription[] = [sub];
    const newSub: AddJobSubscription = {
      filterBy: {
        specificationId: "spec123",
      },
      isEnabled: true,
      onError: () => null,
    };

    const result = findExistingSubscription(subs, newSub);

    expect(result).toBeTruthy();
  });

  it("returns match if matching spec id and job type", () => {
    const sub: JobSubscription = {
      id: "z35hsrt6h",
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
      },
      startDate: DateTime.now(),
      isEnabled: true,
      onError: () => null,
    };
    const subs: JobSubscription[] = [sub];
    const newSub: AddJobSubscription = {
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
      },
      isEnabled: true,
      onError: () => null,
    };

    const result = findExistingSubscription(subs, newSub);

    expect(result).toBeTruthy();
  });

  it("returns match if matching spec id, job types, and job id", () => {
    const sub: JobSubscription = {
      id: "z35hsrt6h",
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob, JobType.CreateAllocationJob],
        jobId: "34643",
      },
      startDate: DateTime.now(),
      isEnabled: true,
      onError: () => null,
    };
    const subs: JobSubscription[] = [sub];
    const newSub: AddJobSubscription = {
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob, JobType.CreateAllocationJob],
        jobId: "34643",
      },
      isEnabled: true,
      onError: () => null,
    };

    const result = findExistingSubscription(subs, newSub);

    expect(result).toBeTruthy();
  });

  it("returns match if matching includeChildJobs", () => {
    const sub: JobSubscription = {
      id: "z35hsrt6h",
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
        jobId: "89345",
        includeChildJobs: true,
      },
      startDate: DateTime.now(),
      isEnabled: true,
      onError: () => null,
    };
    const sub2: JobSubscription = {
      id: "356ehdr",
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
        jobId: "89345",
        includeChildJobs: false,
      },
      startDate: DateTime.now(),
      isEnabled: true,
      onError: () => null,
    };
    const subs: JobSubscription[] = [sub, sub2];
    const newSub: AddJobSubscription = {
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
        jobId: "89345",
        includeChildJobs: true,
      },
      isEnabled: true,
      onError: () => null,
    };

    const result = findExistingSubscription(subs, newSub);

    expect(result).toBeTruthy();
  });

  it("returns match if matching triggerByEntityId", () => {
    const sub: JobSubscription = {
      id: "z35hsrt6h",
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
        jobId: "89345",
        triggerByEntityId: "456yuhwset",
        includeChildJobs: true,
      },
      startDate: DateTime.now(),
      isEnabled: true,
      onError: () => null,
    };
    const sub2: JobSubscription = {
      id: "4682346",
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
        jobId: "89345",
        triggerByEntityId: "different",
        includeChildJobs: true,
      },
      startDate: DateTime.now(),
      isEnabled: true,
      onError: () => null,
    };
    const subs: JobSubscription[] = [sub, sub2];
    const newSub: AddJobSubscription = {
      filterBy: {
        specificationId: "spec123",
        jobTypes: [JobType.RefreshFundingJob],
        jobId: "89345",
        triggerByEntityId: "456yuhwset",
        includeChildJobs: true,
      },
      isEnabled: true,
      onError: () => null,
    };

    const result = findExistingSubscription(subs, newSub);

    expect(result).toBeTruthy();
  });
});
