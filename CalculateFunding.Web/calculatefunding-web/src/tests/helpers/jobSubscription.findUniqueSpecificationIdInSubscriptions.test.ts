import { DateTime } from "luxon";

import { findUniqueSpecificationIdInSubscriptions } from "../../helpers/jobSubscriptionUtilities";
import { JobSubscription } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";

describe("jobSubscriptionUtilities tests", () => {
  describe("findUniqueSpecificationIdInSubscriptions tests", () => {
    it("returns nothing if no subscriptions", () => {
      const subs: JobSubscription[] = [];
      const result = findUniqueSpecificationIdInSubscriptions(subs);

      expect(result).toBe(undefined);
    });

    it("returns nothing if subscriptions not specification specific", () => {
      const sub1: JobSubscription = {
        id: "z35hsrt6h",
        isEnabled: true,
        filterBy: {
          jobTypes: [JobType.RefreshFundingJob],
          jobId: "helloId",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const sub2: JobSubscription = {
        id: "678iok8",
        isEnabled: true,
        filterBy: {
          jobTypes: [JobType.RunConverterDatasetMergeJob],
          jobId: "srydtghjnr",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const subs: JobSubscription[] = [sub1, sub2];
      const result = findUniqueSpecificationIdInSubscriptions(subs);

      expect(result).toBe(undefined);
    });

    it("returns nothing if subscriptions have different specifications", () => {
      const sub1: JobSubscription = {
        id: "z35hsrt6h",
        isEnabled: true,
        filterBy: {
          specificationId: "spec_1",
          jobTypes: [JobType.RefreshFundingJob],
          jobId: "helloId",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const sub2: JobSubscription = {
        id: "678iok8",
        isEnabled: true,
        filterBy: {
          specificationId: "spec_2",
          jobTypes: [JobType.RunConverterDatasetMergeJob],
          jobId: "srydtghjnr",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const subs: JobSubscription[] = [sub1, sub2];
      const result = findUniqueSpecificationIdInSubscriptions(subs);

      expect(result).toBe(undefined);
    });

    it("returns nothing if one subscription has a specification but the other does not", () => {
      const sub1: JobSubscription = {
        id: "z35hsrt6h",
        isEnabled: true,
        filterBy: {
          specificationId: "spec_1",
          jobTypes: [JobType.RefreshFundingJob],
          jobId: "helloId",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const sub2: JobSubscription = {
        id: "678iok8",
        isEnabled: true,
        filterBy: {
          specificationId: undefined,
          jobTypes: [JobType.RunConverterDatasetMergeJob],
          jobId: "srydtghjnr",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const subs: JobSubscription[] = [sub1, sub2];
      const result = findUniqueSpecificationIdInSubscriptions(subs);

      expect(result).toBe(undefined);
    });

    it("returns correct spec id if all subscriptions have the same specification", () => {
      const sub1: JobSubscription = {
        id: "z35hsrt6h",
        isEnabled: true,
        filterBy: {
          specificationId: "spec_1",
          jobTypes: [JobType.RefreshFundingJob],
          jobId: "helloId",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const sub2: JobSubscription = {
        id: "678iok8",
        isEnabled: true,
        filterBy: {
          specificationId: "spec_1",
          jobTypes: [JobType.RunConverterDatasetMergeJob],
          jobId: "srydtghjnr",
        },
        startDate: DateTime.now(),
        onError: () => null,
      };
      const subs: JobSubscription[] = [sub1, sub2];
      const result = findUniqueSpecificationIdInSubscriptions(subs);

      expect(result).toBe("spec_1");
    });
  });
});
