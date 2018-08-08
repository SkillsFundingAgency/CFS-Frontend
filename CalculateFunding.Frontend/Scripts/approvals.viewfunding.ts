//namespace calculateFunding.approvals.viewFunding {
//    export class ViewFundingPageViewModel(){

//    }
//}

$("#specificationId").on("change", (e: JQuery.Event<HTMLSelectElement, null>) => {
    e.target.form.submit();
});

$("#approve").on("click", (e: JQuery.Event<HTMLButtonElement, null>) => {
    let selectedAllocationLines: Array<ISelectedProviderAllocationLine> = [];

    $("input.target-checkbox-allocationline[data-status='Held']:checked").each((index: number, element: HTMLInputElement) => {
        let $element = $(element);
        let allocationLine: ISelectedProviderAllocationLine = {
            providerId: $element.data("providerid"),
            allocationLineId: $element.data("allocationlineid"),
        };

        selectedAllocationLines.push(allocationLine);
    });

    updateApprovalStatus(selectedAllocationLines, ApprovalStatus.Approved);

    e.preventDefault();
});

$("#publish").on("click", (e: JQuery.Event<HTMLButtonElement, null>) => {
    let selectedAllocationLines: Array<ISelectedProviderAllocationLine> = [];

    $("input.target-checkbox-allocationline[data-status='Approved']:checked").each((index: number, element: HTMLInputElement) => {
        let $element = $(element);
        let allocationLine: ISelectedProviderAllocationLine = {
            providerId: $element.data("providerid"),
            allocationLineId: $element.data("allocationlineid"),
        };

        selectedAllocationLines.push(allocationLine);
    });

    updateApprovalStatus(selectedAllocationLines, ApprovalStatus.Published);

    e.preventDefault();
});

declare var testScenarioQueryUrl: string;
declare var approveAllocationLineUrl: string;
declare var viewFundingPageUrl: string;
declare var antiforgeryToken: string;

$("input.target-checkbox-allocationline").on("change", (e: JQuery.Event<HTMLButtonElement, null>) => {
    toggleButtonStatus();
});

function updateApprovalStatus(allocationLines: Array<ISelectedProviderAllocationLine>, approvalStatus: ApprovalStatus) {

    let data = {
        SpecificationId: $("#specificationId").val,
        Filter: {
            Status: approvalStatus,
            Providers: allocationLines,
        }
    };

    let query = $.ajax({
        url: approveAllocationLineUrl,
        method: "POST",
        contentType: 'application/json',
        data: JSON.stringify(data),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", antiforgeryToken);
        }
    });

    actionRunning = true;
    toggleButtonStatus();

    query.fail((ex) => {
        alert("Updating approval status failed");
        actionRunning = false;
        toggleButtonStatus();
    });

    query.done((resultUntyped) => {
        let result: IAllocationLineUpdateStatusResponse = resultUntyped;
        if (result) {
            if (typeof result.updatedAllocationLines === "undefined") {
                throw new Error("updatedAllocationLines not defined in result");
            }

            if (typeof result.updatedProviders === "undefined") {
                throw new Error("updatedProviders is not defined in result");
            }

            let operationType;

            if (approvalStatus == ApprovalStatus.Approved) {
                operationType = "AllocationLineStatusApproved";
            }
            else {
                operationType = "AllocationLineStatusPublished";
            }

            window.location.href = viewFundingPageUrl + "&operationType=" + operationType + "&updatedProviders=" + result.updatedProviders + "&updatedAllocationLines=" + result.updatedAllocationLines;

        }
        else {
            actionRunning = false;
            toggleButtonStatus();
        }
    });
}

var approvalCacheElement: JQuery<HTMLElement> = null;
var publishCacheElement: JQuery<HTMLElement> = null;
var actionRunning: boolean = false;

function toggleButtonStatus(): void {
    let approveButton = $("#approve");
    let publishButton = $("#publish");

    if (actionRunning) {
        approveButton.prop("disabled", true);
        publishButton.prop("disabled", true);
        return;
    }

    let enableApproval: boolean = false;
    let enablePublish: boolean;
    let checkboxes = $("input.target-checkbox-allocationline:checked");

    if (approvalCacheElement !== null) {
        console.log("Approval value:", approvalCacheElement.val());
        if (approvalCacheElement.data("status") === "Held" && approvalCacheElement.is(":checked")) {
            enableApproval = true;
        }
    }

    if (publishCacheElement !== null) {
        if (publishCacheElement.data("status") === "Approved" && publishCacheElement.is(":checked")) {
            enablePublish = true;
        }
    }

    if (!enableApproval || !enablePublish) {
        for (let i = 0; i < checkboxes.length; i++) {
            let inputElement = $(checkboxes[i]);
            let currentStatus = inputElement.data("status");
            if (!enableApproval && currentStatus === "Held") {
                enableApproval = true;
                approvalCacheElement = inputElement;
            }
            if (!enablePublish && currentStatus === "Approved") {
                enablePublish = true;
                publishCacheElement = inputElement;
            }

            if (enableApproval && enablePublish) {
                break;
            }
        }
    }

    approveButton.prop("disabled", !enableApproval);
    publishButton.prop("disabled", !enablePublish);
}

$("input.target-checkbox-provider").on("change", (e: JQuery.Event<HTMLButtonElement, null>) => {
    let $element = $(e.target);
    let providerId = $element.data("providerid");
    if (providerId) {
        let checked: boolean = $element.prop("checked") ? true : false;

        $("input.target-checkbox-fundingstream[data-providerid='" + providerId + "']").prop("checked", checked);
        $("input.target-checkbox-allocationline[data-providerid='" + providerId + "']").prop("checked", checked);
    }

    toggleButtonStatus();
});

$("input.target-checkbox-fundingstream").on("change", (e: JQuery.Event<HTMLButtonElement, null>) => {
    let $element = $(e.target);
    let providerId = $element.data("providerid");
    let fundingStreamId = $element.data("fundingstreamid");
    if (providerId && fundingStreamId) {
        let checked: boolean = $element.prop("checked") ? true : false;
        $("input.target-checkbox-allocationline[data-providerid='" + providerId + "'][data-fundingstreamid='" + fundingStreamId + "']").prop("checked", checked);
    }

    toggleButtonStatus();
});

$("#selectAll").on("change", (e: JQuery.Event<HTMLButtonElement, null>) => {
    let $element = $(e.target);

    let checked: boolean = $element.prop("checked") ? true : false;
    $("input.target-checkbox-provider").prop("checked", checked);
    $("input.target-checkbox-fundingstream").prop("checked", checked);
    $("input.target-checkbox-allocationline").prop("checked", checked);


    toggleButtonStatus();
});

$(".expander-trigger-cell").on("click", function (e: JQuery.Event<HTMLSelectElement, null>) {
    if (typeof testScenarioQueryUrl !== "undefined" && testScenarioQueryUrl) {
        let $element = $(e.currentTarget);

        let statusKey: string = "testscenario-status";

        let status: string = $element.data(statusKey);
        if (!status) {
            let providerId: string = $element.data("providerid");
            if (providerId) {
                console.log(providerId);
                let query = $.ajax({
                    url: testScenarioQueryUrl + "/" + providerId,
                    method: 'GET',
                    type: 'json'
                });

                let $parentElement = $element.parent();
                let nextRow = $parentElement.next();
                $element.data(statusKey, "loading");

                query.done((result) => {
                    let resultTyped: IResultCountResponse = result;

                    let coverageContainer = nextRow.find(".qa-coverage-container");

                    coverageContainer.find(".data-qa-coverage").text(resultTyped.testCoverage + "%");
                    coverageContainer.find(".data-qa-passed").text(resultTyped.passed);
                    coverageContainer.find(".data-qa-totaltests").text(resultTyped.failed + resultTyped.ignored + resultTyped.passed);

                    $element.data(statusKey, "loaded");

                    nextRow.find(".qa-coverage-loading").hide();

                    coverageContainer.show();

                });

                query.fail(() => {
                    $element.data(statusKey, "failed");
                    nextRow.find(".qa-coverage-loading-failed").show();
                    nextRow.find(".qa-coverage-loading").hide();
                });
            }
        }
    }
});

interface IResultCountResponse {
    passed: number;
    failed: number;
    ignored: number;
    testCoverage: number;
}

interface ISelectedProviderAllocationLine {
    providerId: string;
    allocationLineId: string;
}

enum ApprovalStatus {
    Approved = "Approved",
    Published = "Published",
}

interface IAllocationLineUpdateStatusResponse {
    updatedAllocationLines: number;
    updatedProviders: number;
}