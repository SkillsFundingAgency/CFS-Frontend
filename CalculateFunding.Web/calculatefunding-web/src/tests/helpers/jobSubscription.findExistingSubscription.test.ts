import jobSubscriptionUtilities from "../../helpers/jobSubscriptionUtilities";
import {AddJobSubscription, JobSubscription} from "../../hooks/Jobs/useJobSubscription";
import {JobType} from "../../types/jobType";
import {DateTime} from "luxon";

describe("findExistingSubscription tests", () => {

    it('returns nothing if no subscriptions', () => {
        const {findExistingSubscription} = jobSubscriptionUtilities();
        const subs: JobSubscription[] = [];
        const newSub: AddJobSubscription = {
            filterBy: {
                specificationId: 'ertdhset'
            },
            onError: () => null
        };

        const result = findExistingSubscription(subs, newSub);

        expect(result).toBe(undefined);
    });

    it('returns nothing if matching job type but not matching spec id', () => {
        const {findExistingSubscription} = jobSubscriptionUtilities();
        const sub: JobSubscription = {
            id: "z35hsrt6h",
            filterBy: {
                specificationId: 'different',
                jobTypes: [JobType.RefreshFundingJob],
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const subs: JobSubscription[] = [sub];
        const newSub: AddJobSubscription = {
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
            },
            onError: () => null
        };

        const result = findExistingSubscription(subs, newSub);

        expect(result).toBe(undefined);
    });

    it('returns nothing if not matching job id', () => {
        const {findExistingSubscription} = jobSubscriptionUtilities();
        const sub: JobSubscription = {
            id: "z35hsrt6h",
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
                jobId: 'different'
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const subs: JobSubscription[] = [sub];
        const newSub: AddJobSubscription = {
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
                jobId: '34643'
            },
            onError: () => null
        };

        const result = findExistingSubscription(subs, newSub);

        expect(result).toBe(undefined);
    });

    it('returns nothing if matching spec id but not matching job type', () => {
        const {findExistingSubscription} = jobSubscriptionUtilities();
        const sub: JobSubscription = {
            id: "z35hsrt6h",
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const subs: JobSubscription[] = [sub];
        const newSub: AddJobSubscription = {
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.CreateAllocationJob],
            },
            onError: () => null
        };

        const result = findExistingSubscription(subs, newSub);

        expect(result).toBe(undefined);
    });

    it('returns match if only matching spec id', () => {
        const {findExistingSubscription} = jobSubscriptionUtilities();
        const sub: JobSubscription = {
            id: "z35hsrt6h",
            filterBy: {
                specificationId: 'spec123',
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const subs: JobSubscription[] = [sub];
        const newSub: AddJobSubscription = {
            filterBy: {
                specificationId: 'spec123',
            },
            onError: () => null
        };

        const result = findExistingSubscription(subs, newSub);

        expect(result).toBeTruthy();
    });

    it('returns match if matching spec id and job type', () => {
        const {findExistingSubscription} = jobSubscriptionUtilities();
        const sub: JobSubscription = {
            id: "z35hsrt6h",
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const subs: JobSubscription[] = [sub];
        const newSub: AddJobSubscription = {
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
            },
            onError: () => null
        };

        const result = findExistingSubscription(subs, newSub);

        expect(result).toBeTruthy();
    });

    it('returns match if matching spec id, job types, and job id', () => {
        const {findExistingSubscription} = jobSubscriptionUtilities();
        const sub: JobSubscription = {
            id: "z35hsrt6h",
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob, JobType.CreateAllocationJob],
                jobId: '34643'
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const subs: JobSubscription[] = [sub];
        const newSub: AddJobSubscription = {
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob, JobType.CreateAllocationJob],
                jobId: '34643'
            },
            onError: () => null
        };

        const result = findExistingSubscription(subs, newSub);

        expect(result).toBeTruthy();
    });

    it('returns match if matching includeChildJobs', () => {
        const {findExistingSubscription} = jobSubscriptionUtilities();
        const sub: JobSubscription = {
            id: "z35hsrt6h",
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
                jobId: '89345',
                includeChildJobs: true
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const sub2: JobSubscription = {
            id: "356ehdr",
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
                jobId: '89345',
                includeChildJobs: false
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const subs: JobSubscription[] = [sub, sub2];
        const newSub: AddJobSubscription = {
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
                jobId: '89345',
                includeChildJobs: true
            },
            onError: () => null
        };

        const result = findExistingSubscription(subs, newSub);

        expect(result).toBeTruthy();
    });

    it('returns match if matching triggerByEntityId', () => {
        const {findExistingSubscription} = jobSubscriptionUtilities();
        const sub: JobSubscription = {
            id: "z35hsrt6h",
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
                jobId: '89345',
                triggerByEntityId: '456yuhwset',
                includeChildJobs: true
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const sub2: JobSubscription = {
            id: "4682346",
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
                jobId: '89345',
                triggerByEntityId: 'different',
                includeChildJobs: true
            },
            startDate: DateTime.now(),
            onError: () => null
        }
        const subs: JobSubscription[] = [sub, sub2];
        const newSub: AddJobSubscription = {
            filterBy: {
                specificationId: 'spec123',
                jobTypes: [JobType.RefreshFundingJob],
                jobId: '89345',
                triggerByEntityId: '456yuhwset',
                includeChildJobs: true
            },
            onError: () => null
        };

        const result = findExistingSubscription(subs, newSub);

        expect(result).toBeTruthy();
    });
})