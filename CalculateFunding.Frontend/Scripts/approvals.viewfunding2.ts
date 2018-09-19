namespace calculateFunding.approvals {
    /** Main view model that the page will be bound to */
    export class ViewFundingViewModel {
        private settings: IViewFundingSettings;

        public isViewFundingButtonEnabled: KnockoutComputed<boolean>;

        public isSpecificationDropdownEnabled: KnockoutComputed<boolean>;

        public isViewFundingStreamDropdownEnabled: KnockoutComputed<boolean>;

        public isLoadingVisible: KnockoutComputed<boolean>;

        public state: KnockoutObservable<string> = ko.observable("idle");

        /** Included to cater for Approve and Publish selector feature */
        public FundingPeriods: KnockoutObservableArray<FundingPeriodResponse> = ko.observableArray(); 
         
        public Specifications: KnockoutObservableArray<SpecificationResponse> = ko.observableArray();

        public FundingStreams: KnockoutObservableArray<FundingStreamResponse> = ko.observableArray();
 
        constructor(settings: IViewFundingSettings) {
            if (typeof settings !== "undefined" && settings === null) {
                throw "Settings must be provided to the view funding view model";
            }
            else if (typeof settings.antiforgeryToken !== "undefined" && settings.antiforgeryToken === null) {
                throw "Settings must contain the antiforgeryToken";
            }
            else if (typeof settings.testScenarioQueryUrl !== "undefined" && settings.testScenarioQueryUrl === null) {
                throw "Settings must contain the test scenario query url";
            }
            else if (typeof settings.viewFundingPageUrl !== undefined && settings.viewFundingPageUrl === null) {
                throw "Settings must contain the view funding page query url";
            }
            else if (typeof settings.fundingPeriodUrl !== "undefined" && settings.fundingPeriodUrl === null) {
                throw "Settings must contain the funding period query url";
            }
            else if (typeof settings.fundingStreamsUrl !== "undefined" && settings.fundingStreamsUrl === null) {
                throw "Settings must contain the fuding streams query url";
            }
            else if (typeof settings.specificationsUrl !== "undefined" && settings.specificationsUrl === null) {
                throw "Settings must contain the specifications query url";
            }

            let self = this;

            self.settings = settings;

            // Defer updates on the array of items being bound to the page, so updates don't constantly to the UI and slow things down
            self.currentPageResults.extend({ deferred: true });

            //Included for ApproveandPublishSelection 

            /** Request to get the funding periods */
            self.pageState() == "initial";
            let fundingPeriodRequest = $.ajax({
                url: this.settings.fundingPeriodUrl,
                dataType: "json",
                method: "get",
                contentType: "application/json",
            }).done(function (response) {
                let newPeriodArray = Array<FundingPeriodResponse>();

                ko.utils.arrayForEach(response, function (item: any) {

                    var x = new FundingPeriodResponse(item.id, item.name);

                    newPeriodArray.push(x);
                });

                self.FundingPeriods(newPeriodArray);
            })

            this.selectedFundingPeriod.subscribe(function () {
                if (self.selectedFundingPeriod() !== undefined && self.selectedFundingPeriod() !== "Select") {                   
                    /** Load Specifications in the specification dropdown */
                    let getSpecificationForSelectedPeriodUrl = self.settings.specificationsUrl.replace("{fundingPeriodId}", self.selectedFundingPeriod());

                    let specificationRequest = $.ajax({
                        url: getSpecificationForSelectedPeriodUrl,
                        dataType: "json",
                        method: "get",
                        contentType: "application/json",
                    }).done(function (response) {
                        let newSpecificationArray = Array<SpecificationResponse>();

                        ko.utils.arrayForEach(response, function (item: any) {

                            var y = new SpecificationResponse(item.id, item.name, item.fundingStreams);

                            newSpecificationArray.push(y);
                        });

                        self.Specifications(newSpecificationArray);
                    })
                }  
            });

            self.selectedSpecification.subscribe(function () {
                if (self.selectedSpecification() !== undefined && self.selectedFundingPeriod() !== "Select") {

                    let newFundingStreamArray = Array<FundingStreamResponse>();

                    let spec = ko.utils.arrayFirst(self.Specifications(),
                        function (item: SpecificationResponse) {
                            return (item.id === self.selectedSpecification());
                        });

                    self.FundingStreams(spec.fundingstreams);
                } else {
                    self.FundingStreams([]);
                }              
            });
            
            self.isSpecificationDropdownEnabled = ko.computed(() => {
                let isEnabled = (self.selectedFundingPeriod() !== undefined && self.selectedFundingPeriod().length > 0);            

                return isEnabled;
            });

            self.isViewFundingStreamDropdownEnabled = ko.computed(() => {
                let isEnabled = (self.selectedSpecification() !== undefined && self.selectedSpecification().length > 0);

                return isEnabled;             
            });
    

            self.isViewFundingButtonEnabled = ko.computed(() => {
                let isEnabled = (self.selectedFundingStream() !== undefined && self.selectedFundingStream().length > 0
                    && self.selectedFundingPeriod() !== undefined && self.selectedFundingPeriod().length > 0
                    && self.selectedSpecification() !== undefined && self.selectedSpecification().length > 0);

                return isEnabled;
            });
         }

        pageState: KnockoutObservable<string> = ko.observable("initial");

        specificationId: string;
        selectedSpecValue: KnockoutObservable<string> = ko.observable("");
        selectedFundingPeriodValue: KnockoutObservable<string> = ko.observable("");
        selectedFundingStreamValue: KnockoutObservable<string> = ko.observable("");
        selectedSpecification: KnockoutObservable<string> = ko.observable("");
        selectedFundingPeriod: KnockoutObservable<string> = ko.observable("");
        selectedFundingStream: KnockoutObservable<string> = ko.observable("");
  
        pageNumber: KnockoutObservable<number> = ko.observable(0);
        itemsPerPage: number = 500;

        allProviderResults: KnockoutObservableArray<PublishedProviderResultViewModel> = ko.observableArray([]);
        filteredResults: KnockoutComputed<Array<PublishedProviderResultViewModel>> = ko.pureComputed(function () {
            return this.allProviderResults();
        }, this);
        currentPageResults: KnockoutComputed<Array<PublishedProviderResultViewModel>> = ko.pureComputed(function () {
            let startIndex = this.pageNumber() * this.itemsPerPage;
            return this.filteredResults().slice(startIndex, startIndex + this.itemsPerPage);
        }, this);

        /** An array of the page numbers that contain the results */
        allPageNumbers: KnockoutComputed<Array<number>> = ko.pureComputed(function () {
            let totalPages = Math.ceil(this.filteredResults().length / this.itemsPerPage);

            let pageNumbers: Array<number> = [];
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(i + 1);
            }

            return pageNumbers;
        }, this);

        /** Is there a page previous to the current one */
        hasPrevious: KnockoutComputed<boolean> = ko.pureComputed(function () {
            return this.pageNumber() !== 0;
        }, this);

        /** Is there a page after the current one */
        hasNext: KnockoutComputed<boolean> = ko.pureComputed(function () {
            return this.pageNumber() + 1 !== this.allPageNumbers().length;
        }, this);

        /** Move to the previous page */
        viewPrevious() {
            if (this.pageNumber() !== 0) {
                this.pageNumber(this.pageNumber() - 1);
            }
        }

        /** Move to the next page */
        viewNext() {
            if (this.pageNumber() < this.allPageNumbers.length) {
                this.pageNumber(this.pageNumber() + 1);
            }
        }

        /** Move to a specific page */
        viewPage(parentVM: ViewFundingViewModel, targetPage: number) {
            return parentVM.pageNumber(targetPage - 1);
        }

        /** Has the used selected at least one allocation line result that can be approved */
        canApprove: KnockoutComputed<boolean> = ko.computed(function () {
            let providerResults = this.allProviderResults();
            for (let i = 0; i < providerResults.length; i++) {
                let allocationResults = providerResults[i].allocationLineResults();

                for (let j = 0; j < allocationResults.length; j++) {
                    let allocationLineResult = allocationResults[j];

                    if (allocationLineResult.isSelected() && allocationLineResult.status === AllocationLineStatus.New) {
                        return true;
                    }
                }

                return false;
            }
        }, this);

        /** Show confirmation page for approval of selected allocation lines */
        confirmApprove() { alert('the approve button is not implemented yet'); }

        /** Has the used selected at least one allocation line result that can be published */
        canPublish: KnockoutComputed<boolean> = ko.pureComputed(function () {
            let providerResults = this.allProviderResults();
            for (let i = 0; i < providerResults.length; i++) {
                let allocationResults = providerResults[i].allocationLineResults();

                for (let j = 0; j < allocationResults.length; j++) {
                    let allocationLineResult = allocationResults[j];

                    if (allocationLineResult.isSelected() && (allocationLineResult.status === AllocationLineStatus.Approved || allocationLineResult.status === AllocationLineStatus.Updated)) {
                        return true;
                    }
                }

                return false;
            }
        }, this);

        /** Show confirmation page for publish of selected allocation lines */
        confirmPublish() { alert('the publish button is not implemented yet'); }

        /** Load results given the initial filter criteria */
        loadResults(response: any) {


            this.specificationId = "abc1";
            //this.selectedSpecification;
           // this.fundingPeriod = "Test Funding Period";
           // this.fundingStream = "Test Funding Stream";

            let tempArray: Array < PublishedProviderResultViewModel > =[];

            for (let i = 0; i < 20000; i++) {
                let provResult = new PublishedProviderResultViewModel();
                provResult.authority = "Authority " + i;
                provResult.fundingAmount = (Math.random() * 1000) + 1;
                provResult.numberApproved = 1;
                provResult.numberNew = 1;
                provResult.numberPublished = 1;
                provResult.numberUpdated = 1;
                provResult.providerId = "ProvId" + i;
                provResult.providerName = "Provider " + i;
                provResult.totalAllocationLines = 4;
                provResult.ukprn = "UKPRN" + i;

                let aOne = new PublishedAllocationLineResultViewModel();
                aOne.allocationLineId = provResult.providerId + "-Alloc1";
                aOne.allocationLineName = "Allocation Line 1";
                aOne.fundingAmount = (Math.random() *100) + 1;
                aOne.status = AllocationLineStatus.New;
                aOne.version = "0.1";

                let aTwo = new PublishedAllocationLineResultViewModel();
                aTwo.allocationLineId = provResult.providerId + "-Alloc2";
                aTwo.allocationLineName = "Allocation Line 2";
                aTwo.fundingAmount = (Math.random() * 100) + 1;
                aTwo.status = AllocationLineStatus.Approved;
                aTwo.version = "0.2";

                let aThree = new PublishedAllocationLineResultViewModel();
                aThree.allocationLineId = provResult.providerId + "-Alloc3";
                aThree.allocationLineName = "Allocation Line 3";
                aThree.fundingAmount = (Math.random() * 100) + 1;
                aThree.status = AllocationLineStatus.Updated;
                aThree.version = "1.3";

                let aFour = new PublishedAllocationLineResultViewModel();
                aFour.allocationLineId = provResult.providerId + "-Alloc4";
                aFour.allocationLineName = "Allocation Line 4";
                aFour.fundingAmount = (Math.random() * 100) + 1;
                aFour.status = AllocationLineStatus.Published;
                aFour.version = "2.0";

                let tempArray2: Array<PublishedAllocationLineResultViewModel> = [];
                tempArray2.push(aOne);
                tempArray2.push(aTwo);
                tempArray2.push(aThree);
                tempArray2.push(aFour);
                provResult.allocationLineResults(tempArray2);

                tempArray.push(provResult);
            }

            this.allProviderResults(tempArray);
            this.pageState("main");
        }

        /** This provides a shortcut to evaluating the UI for performing the select all operation */
        private executingSelectAll: KnockoutObservable<boolean> = ko.observable(false);

        /** Select all allocation line results across all results for the current filter */
        selectAll: KnockoutComputed<boolean> = ko.computed({
            read: function () {
                if (this.executingSelectAll()) { return false; }

                let filteredResults = this.filteredResults();

                for (let i = 0; i < filteredResults.length; i++) {
                    let providerResult = filteredResults[i];
                    for (let j = 0; j < providerResult.allocationLineResults().length; j++) {
                        let allocationLineResult = providerResult.allocationLineResults()[j];
                        if (!allocationLineResult.isSelected()) {
                            return false;
                        }
                    }
                }

                return true;
            },
            write: function (newValue) {
                let self = this;
                setTimeout(function () {
                    self.executingSelectAll(true);
                    let filteredResults = self.filteredResults();
                    for (let i = 0; i < filteredResults.length; i++) {
                        let providerResult = filteredResults[i];
                        providerResult.isSelected(newValue);
                    }

                    self.executingSelectAll(false);
                }, 1);
            }
        }, this);

        /** Expand a provider result line to show the allocation lines and qa results */
        expandProvider(providerResult: PublishedProviderResultViewModel, parentVM: ViewFundingViewModel) {

            if (!providerResult.qaTestResults()) {

                providerResult.qaTestResultsRequestStatus('loading');

                let getQAResultsUrl = parentVM.settings.testScenarioQueryUrl.replace("{specificationId}", parentVM.specificationId);
                let query = $.ajax({
                    url: getQAResultsUrl + "/" + providerResult.providerId,
                    method: 'GET',
                    type: 'json'
                })
                    .done((result) => {
                        let resultTyped: IQAResultResponse = result;
                        providerResult.qaTestResults(resultTyped);

                        providerResult.qaTestResultsRequestStatus('loaded');
                    })
                    .fail(() => {
                        providerResult.qaTestResultsRequestStatus('failed');
                    });
            }
        }

        /** On click of the button, map the response and load results */
        public viewFunding(): void {
            if(this.state() !== "idle")
                return;
            let self = this;
          
            let viewfundingPageUrl = self.settings.viewFundingPageUrl.replace("{fundingPeriodId}", self.selectedFundingPeriod());
            viewfundingPageUrl = viewfundingPageUrl.replace("{specificationId}", self.selectedSpecification());
            viewfundingPageUrl = viewfundingPageUrl.replace("{fundingstreamId}", self.selectedFundingStream());

            let viewFundingRequest = $.ajax({             
                url: viewfundingPageUrl ,
                dataType : "json",
                method: "GET",
                contentType: "application/json"
            });

            self.state("Loading");

            viewFundingRequest.done((response) => {
                if (response) {
                    console.log(response);
                    let viewFundingResponse: KnockoutObservableArray<PublishedProviderResultViewModel> = response;
                    self.handlevfSuccess(viewFundingResponse);
                    self.pageState("main");
                }
            });
        }

        public handlevfSuccess(response: any) {

           //There are some attributes that still need to be mapped

            if (response !== null && response !== undefined) {
                let publishedProviderArray: Array<IProviderResultsResponse> = response;
                let providers: Array<PublishedProviderResultViewModel> = [];

                for (let p in publishedProviderArray) {
                    let provider: IProviderResultsResponse = publishedProviderArray[p];

                    let providerObservable: PublishedProviderResultViewModel = new PublishedProviderResultViewModel();
                    // Here we need to go and set the provider properties
                    providerObservable.providerId = provider.providerId;
                    providerObservable.providerName = provider.providerName;
                    providerObservable.fundingAmount = provider.fundingAmount;                 
                    providerObservable.numberApproved = provider.numberApproved;
                    providerObservable.numberNew = provider.numberHeld;
                    providerObservable.numberPublished = provider.numberPublished;
                    providerObservable.totalAllocationLines = provider.totalAllocationLines;
                    providerObservable.numberUpdated = 0;
                    
                    for (let f in provider.fundingStreamResults) {
                        let fundingStream: IFundingStreamResultResponse = provider.fundingStreamResults[f];
                       
                        for (let a in fundingStream.allocationLineResults) {
                            let allocationLine: IAllocationLineResultsResponse = fundingStream.allocationLineResults[a];

                            let allocationLineObservable: PublishedAllocationLineResultViewModel = new PublishedAllocationLineResultViewModel();

                            // set the properties 
                            allocationLineObservable.allocationLineId = allocationLine.allocationLineId;
                            allocationLineObservable.allocationLineName = allocationLine.allocationLineName;
                            allocationLineObservable.fundingAmount = allocationLine.fundingAmount;
                            allocationLineObservable.lastUpdated = allocationLine.lastUpdated;
                            allocationLineObservable.status = allocationLine.status;
                            allocationLineObservable.version = "1.0" //allocationLine.

                            // bit of contention here
                            providerObservable.authority = allocationLine.authority;

                            providerObservable.allocationLineResults.push(allocationLineObservable);
                        }                        
                    }
                    providers.push(providerObservable)
                }
                this.allProviderResults(providers); 
            }
        }
   

    }

   

    /** A published provider result */
    class PublishedProviderResultViewModel {
        providerName: string;
        providerId: string;
        ukprn: string;
        authority: string;
        fundingAmount: number;

        get fundingAmountDisplay(): string {
            return (Number(this.fundingAmount)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }

        totalAllocationLines: number;
        numberNew: number;
        numberApproved: number;
        numberUpdated: number;
        numberPublished: number;
        testCoveragePercent: number;
        testsPassed: number;
        testsTotal: number;

        allocationLineResults: KnockoutObservableArray<PublishedAllocationLineResultViewModel> = ko.observableArray([]);

        qaTestResults: KnockoutObservable<IQAResultResponse> = ko.observable(null);
        qaTestResultsRequestStatus: KnockoutObservable<string> = ko.observable(null);

        /** 
         *  Are all allocation lines in the provider currently selected.
         *  Note: there is no direct selection of a provider line, it is all based on whether the child allocation lines are selected
         */
        isSelected: KnockoutComputed<boolean> = ko.computed({
            read: function () {
                let allocationResults = this();

                for (let i = 0; i < allocationResults.length; i++) {
                    let allocationLineResult = allocationResults[i];
                    if (!allocationLineResult.isSelected()) {
                        return false;
                    }
                }

                return true;
            },
            write: function (newValue) {
                let allocationResults = this();

                for (let i = 0; i < allocationResults.length; i++) {
                    let allocationLineResult = allocationResults[i];
                    if (allocationLineResult.isSelected.peek() !== newValue) {
                        allocationLineResult.isSelected(newValue);
                    }
                }
            }
        }, this.allocationLineResults);
    }

    /** A published allocation line result */
    class PublishedAllocationLineResultViewModel {
        allocationLineId: string;
        allocationLineName: string;
        status: AllocationLineStatus;
        fundingAmount: number;
        lastUpdated: string;
        authority: string;

        get fundingAmountDisplay(): string {
            return (Number(this.fundingAmount)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }

        version: string;

        isSelected: KnockoutObservable<boolean> = ko.observable(false);
    }


    export interface IFundingStreamResultResponse {
        allocationLineResults: Array<IAllocationLineResultsResponse>;
        fundingStreamName: string;
        fundingStreamId: string;
        fundingAmount: number;
        lastUpdated: string;
        numberHeld: number;
        numberApproved: number;
        numberPublished: number;
        totalAllocationLines: number;
    }

    export interface IAllocationLineResultsResponse {
        allocationLineId: string;
        allocationLineName: string;
        fundingAmount: number;
        status: number;
        lastUpdated: string;
        authority: string;
    }

    export interface IProviderResultsResponse {
        fundingStreamResults: Array<IFundingStreamResultResponse>
        specificationId: string;
        providerName: string;
        providerId: string;
        ukprn: string;
        fundingAmount: number;
        totalAllocationLines: number;
        numberHeld: number;
        numberApproved: number;
        numberPublished: number;
        numberUpdated: number;
        lastUpdated: string;
        authority: string;
    }



    /** The allowable statuses of an allocation line */
    export enum AllocationLineStatus {
        New,
        Approved,
        Updated,
        Published
    }

    /** The settings */
    interface IViewFundingSettings {
        testScenarioQueryUrl: string;
        viewFundingPageUrl: string;
        antiforgeryToken: string;
        fundingPeriodUrl: string;
        specificationsUrl: string;
        fundingStreamsUrl: string;
    }

    /** The response of retrieving qa results */
    interface IQAResultResponse {
        passed: number;
        failed: number;
        ignored: number;
        testCoverage: number;
    }
   
    /** Funding period dropdown options */
    export class FundingPeriodResponse {
        constructor(id:string, value:string)
        {
          this.id = id;
          this.value = value;  
        }
        id: string;
        value: string;
    }

   
    /** Specification dropdown options  */
    export class SpecificationResponse {
        constructor(id: string, value: string, fundingStreams: Array<any>)
        {
            this.id = id;
            this.value = value;
            this.fundingstreams = fundingStreams; 
        }
        id: string;
        value: string;
        fundingstreams: Array<FundingStreamResponse>;
    }

   
    /** Funding stream dropdown options  */

    export class FundingStreamResponse{
        constructor(id:string, name:string)
        {
          this.id = id;
          this.name = name;  
        }
        id: string;
        name: string;
    }

  
     export interface IViewFundingSelectorModelState{
        FundingPeriod: string;
        Specification: string;
        FundingStream: string;
    }

}