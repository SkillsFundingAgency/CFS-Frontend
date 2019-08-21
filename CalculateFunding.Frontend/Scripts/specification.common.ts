namespace calculateFunding.specification {
    export class SpecificationCommonViewModel {
        public selectedFundingStream: KnockoutObservable<string> = ko.observable();
        public providerVersions: KnockoutObservableArray<IProviderVersion> = ko.observableArray([]);
        public selectedProviderVersion: KnockoutObservable<string> = ko.observable();

        constructor() {
            let self = this;
        }

        public fundingStreamChanged(providerVesionId: string = null): void {
            let selectedItem: string = $("#select-funding-stream").val().toString();
            let selectedText: string = $("#select-funding-stream option:selected").text().toString();
            this.selectedFundingStream(selectedItem);

            let request = $.ajax({
                data: JSON.stringify(selectedItem),
                url: "/api/providerversions/getbyfundingstream",
                dataType: "json",
                method: "POST",
                contentType: "application/json"
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
                this.selectedProviderVersion(providerVesionId)
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