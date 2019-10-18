namespace calculateFunding.approvals {

    /** Funding stream dropdown options  */
    export class FundingStreamResponse {
        constructor(id: string, name: string) {
            this.id = id;
            this.name = name;
        }
        id: string;
        name: string;
    }

    /** Funding period dropdown options */
    export class FundingPeriodResponse {
        constructor(id: string, value: string, name: string, period: string) {
            this.id = id;
            this.value = value;
            this.name = name;
            this.period = period;
        }
        id: string;
        value: string;
        name: string;
        period: string;
    }

    export class SpecificationIdsRequestModel {
        constructor(specificationIds: Array<string>) {
            this.specificationIds = specificationIds;
        }
        specificationIds: Array<string>;
    }

    /** Specification dropdown options  */
    export class SpecificationResponse {
        constructor(id: string, name: string, fundingPeriod: FundingPeriodResponse, publishedResultsRefreshedAt: Date, fundingStreams: Array<FundingStreamResponse>) {
            this.id = id;
            this.name = name;
            this.fundingPeriod = fundingPeriod;
            this.publishedResultsRefreshedAt(publishedResultsRefreshedAt);
            this.fundingStreams = fundingStreams;
        }
        id: string;
        name: string;
        fundingPeriod: FundingPeriodResponse;
        fundingStreams: Array<FundingStreamResponse>;
        publishedResultsRefreshedAt: KnockoutObservable<Date> = ko.observable();

        publishedResultsRefreshedAtDisplay: KnockoutComputed<string> = ko.computed(function () {
            if (this.publishedResultsRefreshedAt()) {
                let date: Date = new Date(this.publishedResultsRefreshedAt());
                let dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
                return date.toLocaleString('en-GB', dateOptions);
            }
            else {
                return 'Not available';
            }
        }, this);
    }

    export class CalculationStatusCounts {
        constructor(specificationId: string,
            approved: number,
            updated: number,
            draft: number,
            total: number) {
            this.specificationId = specificationId;
            this.approved = approved;
            this.updated = updated;
            this.draft = draft;
            this.total = total;
        }
        specificationId: string;
        approved: number;
        updated: number;
        draft: number;
        total: number;
    }

    export class SpecificationTestScenarioResultCounts {
        constructor(specificationId: string,
            passed: number,
            failed: number,
            ignored: number,
            testCoverage: number) {
            this.specificationId = specificationId;
            this.passed = passed;
            this.failed = failed;
            this.ignored = ignored;
            this.testCoverage = testCoverage;
        }
        specificationId: string;
        passed: number;
        failed: number;
        ignored: number;
        testCoverage: number;
    }

    export class SpecificationChooseForFunding extends SpecificationResponse {
        constructor(id: string, name: string, fundingPeriod: FundingPeriodResponse, publishedResultsRefreshedAt: Date, fundingStreams: Array<FundingStreamResponse>, approvalStatus: string, isSelectedForFunding: boolean, canBeChosen: boolean) {
            super(id, name, fundingPeriod, publishedResultsRefreshedAt, fundingStreams);
            this.approvalStatus(approvalStatus);
            this.canBeChosen(canBeChosen);
            this.isSelectedForFunding(isSelectedForFunding);
            this.providerQaCoverage(0);
            this.QaTestsPassed(0);
            this.QaTestsTotal(0);
            this.CalculationsApproved(0);
            this.CalculationsTotal(0);
        }
        approvalStatus: KnockoutObservable<string> = ko.observable();
        approvalStatusCssClass: KnockoutComputed<string> = ko.computed(function () {
            switch (this.approvalStatus()) {
                case "Approved":
                    return "status-approved";
                case "Draft":
                    return "status-draft";
                case "Updated":
                    return "status-updated";
                default:
                    return "";
            }
        }, this);
        isSelectedForFunding: KnockoutObservable<boolean> = ko.observable();
        canBeChosen: KnockoutObservable<boolean> = ko.observable();
        providerQaCoverage: KnockoutObservable<number> = ko.observable();
        QaTestsPassed: KnockoutObservable<number> = ko.observable();
        QaTestsTotal: KnockoutObservable<number> = ko.observable();
        CalculationsApproved: KnockoutObservable<number> = ko.observable();
        CalculationsTotal: KnockoutObservable<number> = ko.observable();
    }

    export class PageBannerOperation {
        constructor(entityName: string,
            entityType: string,
            operationAction: string,
            operationId: string,
            actionText: string,
            actionUrl: string)
        {
            this.entityName(entityName);
            this.entityType(entityType);
            this.operationAction(operationAction);
            this.operationId(operationId);
            this.actionText(actionText);
            this.actionUrl(actionUrl);
        }

        entityName: KnockoutObservable<string> = ko.observable();
        entityType: KnockoutObservable<string> = ko.observable();
        operationAction: KnockoutObservable<string> = ko.observable();
        operationId: KnockoutObservable<string> = ko.observable();
        actionText: KnockoutObservable<string> = ko.observable();
        actionUrl: KnockoutObservable<string> = ko.observable();
        displayOperationActionSummary: KnockoutObservable<boolean> = ko.observable(false);
        operationActionSummaryText: KnockoutObservable<string> = ko.observable("");
        secondaryActionUrl: KnockoutObservable<string> = ko.observable("");
    }
}