namespace calculateFunding.specification {
    export class SpecificationCommonViewModel {
        public selectedFundingStream: KnockoutObservable<string> = ko.observable();
        public providerVersions: KnockoutObservableArray<IProviderVersion> = ko.observableArray([]);
        public selectedProviderVersion: KnockoutObservable<string> = ko.observable();
        public fundingPeriods: KnockoutObservableArray<IFundingPeriod> = ko.observableArray([]);

        constructor() {
            let self = this;
        }

        public fundingStreamChanged(providerVesionId: string = null, selectedFundingPeriod: string = null): void {
            let selectedItem: string = $("#select-funding-stream").val().toString();
            let selectedText: string = $("#select-funding-stream option:selected").text().toString();
            this.selectedFundingStream(selectedItem);

            let request = $.ajax({
                url: `/api/providerversions/getbyfundingstream/${selectedItem}`,
                dataType: "json",
                method: "GET",
            });

            console.log("Starting search request");

            request.done((resultUntyped) => {
                console.log("Search request completed");
                let results: Array<IProviderVersion> = resultUntyped;
                this.providerVersions(ko.utils.arrayMap(results, function (item) {
                    item.display = selectedText + " from " + new Date(item.targetDate).toLocaleDateString() + " Version " + Number(item.version);
                    item.description = item.description;
                    return item;
                }));
                $("#select-funding-period > option").remove();

                this.populateFundingPeriods(selectedItem, selectedFundingPeriod);
                this.selectedProviderVersion(providerVesionId)
            });

            request.fail((xhrDetails: JQuery.jqXHR<any>, errorStatus: JQuery.Ajax.ErrorTextStatus) => {
                console.log("Search request failed");
            });
        }

        public populateFundingPeriods(selectedFundingStreamId: string, selectedFundingPeriod: string = null) {
            let request = $.ajax({
                url: `/api/policy/fundingperiods/${selectedFundingStreamId}`,
                dataType: "json",
                method: "GET"
            });

            console.log("Starting request for funding period ids");

            request.done((resultUntyped) => {
                console.log("Request completed");
                let results: Array<IFundingPeriod> = resultUntyped;
                this.fundingPeriods(ko.utils.arrayMap(results, function (item) {
                    return item;
                }));
                $("#select-funding-period").val(selectedFundingPeriod);
            });

            request.fail((xhrDetails: JQuery.jqXHR<any>, errorStatus: JQuery.Ajax.ErrorTextStatus) => {
                console.log("Search request failed");
            });
        }
    }

    export interface IProviderVersion {
        providerVersionId: string,
        version: string,
        targetDate: string,
        display: string,
        description: string
    }
}