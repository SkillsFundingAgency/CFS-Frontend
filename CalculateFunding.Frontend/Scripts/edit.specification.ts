$("#EditSpecificationViewModel-FundingStreamIds").select2();
var initialFundingStreamIds = new Array();
var initialFundingStreams = $("#EditSpecificationViewModel_OriginalFundingStreams").val();
var initialFundingStreamIds = initialFundingStreams.split(",");

showAlert();

$("#EditSpecificationViewModel-FundingStreamIds").on("change", function (e) {
    showAlert()
});

function showAlert() {

    var currentFundingStreamIds = new Array();
    currentFundingStreamIds = $("#EditSpecificationViewModel-FundingStreamIds").val();
    var showAlert = !arrayContainsArray(initialFundingStreamIds, currentFundingStreamIds);
    $(".alert").toggle(showAlert)
}

function arrayContainsArray(subset, superset) {
    if (0 === subset.length) {
        return false;
    }
    return subset.every(function (value) {
        return (superset.indexOf(value) >= 0);
    });
}