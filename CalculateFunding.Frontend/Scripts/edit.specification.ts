$("#EditSpecificationViewModel-FundingStreamIds").select2();
var initialFundingStreamIds: Array<string>= [];
var initialFundingStreams : string = $("#EditSpecificationViewModel_OriginalFundingStreams").val() as string;
 initialFundingStreamIds  = initialFundingStreams.split(",");

showAlert();

$("#EditSpecificationViewModel-FundingStreamIds").on("change", function (e) {
    showAlert()
});

function showAlert() {

    var currentFundingStreamIds : Array<string> =  $("#EditSpecificationViewModel-FundingStreamIds").val() as Array<string>;
    var showAlert = !arrayContainsArray(initialFundingStreamIds, currentFundingStreamIds);
    $(".alert").toggle(showAlert)
}

function arrayContainsArray(subset : Array<string>, superset : Array<string>) {
    if (0 === subset.length) {
        return false;
    }
    return subset.every(function (value) {
        return (superset.indexOf(value) >= 0);
    });
}