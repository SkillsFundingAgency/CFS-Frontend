declare var setApprovedStatusUrl: string;
declare var setPublishedStatusUrl: string;
declare var viewFundingUrl: string;
declare var updateModelJson: string;
declare var antiforgeryToken: string;

$("#approve").on("click", (e: JQuery.Event<HTMLButtonElement, null>) => {
    $("#approve").prop("disabled", true);

    callChangeStatusUrl(setApprovedStatusUrl, "StatusChangedToApproved", "FailedToChangeStatusToApproved");
    e.preventDefault();
});

$("#publish").on("click", (e: JQuery.Event<HTMLButtonElement, null>) => {
    $("#publish").prop("disabled", true);

    callChangeStatusUrl(setPublishedStatusUrl, "StatusChangedToPublished", "FailedToChangeStatusToPublished");
    e.preventDefault();
});

function callChangeStatusUrl(apiUrl: string, successStatus: string, failureStatus: string) {
    $("#wait-state-container").show();

    $.ajax({
        url: apiUrl,
        method: "PUT",
        contentType: 'application/json',
        data: updateModelJson,
        headers: {
            RequestVerificationToken: antiforgeryToken
        }
    })
        .done((result) => {
            window.location.href = viewFundingUrl + "?confirmationStatus=" + successStatus;
        })
        .fail((ex) => {
            window.location.href = viewFundingUrl + "?confirmationStatus=" + failureStatus;
    });
}
