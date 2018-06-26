if ($("#CalculationTypes").val() !== "Funding") {

    $('#inline-allocation-line-container').hide();
}

if ($("#CalculationTypes").val() !== "Number") {

    $('#inline-ispublic').hide();
}

$("#CalculationTypes").on('change', function () {

    var selectedValue = $(this).val();
    if (selectedValue == "Funding") {
        $('#inline-allocation-line-container').show();
        $('#inline-ispublic').hide();
    }
    else {
        $('#inline-allocation-line-container').hide();
        $("#AllocationLines").val("");
        $('#inline-ispublic').show();
    }
});