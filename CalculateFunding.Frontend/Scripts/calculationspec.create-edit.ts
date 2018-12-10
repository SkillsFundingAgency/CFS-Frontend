declare let hideAllocationLines: Array<string>;
declare let existingAllocationId: string;
declare let availableBaselineAllocationLineIds: number;

if ($("#CalculationTypes").val() !== "Funding" && $("#CalculationTypes").val() !== "Baseline") {

    $('#inline-allocation-line-container').hide();
}

if ($("#CalculationTypes").val() !== "Number") {

    $('#inline-ispublic').hide();
}

function onCalculationTypeChange() {

    var selectedValue = $(this).val();
    if (selectedValue == "Funding") {
        $('#inline-allocation-line-container').show();
        $('#inline-ispublic').hide();
        $("#AllocationLines option").show();
        $("#allocationLineIdLabel").text("Allocation line");
        $("#noAllocationLinesError").hide();

    }
    else if (selectedValue == "Number") {
        $('#inline-allocation-line-container').hide();
        $("#AllocationLines").val("");
        $('#inline-ispublic').show();
    }
    else if (selectedValue == "Baseline") {
        $('#inline-allocation-line-container').show();
        $('#inline-ispublic').hide();


        $("#allocationLineIdLabel").text("Select the allocation line for the baseline calculation");
        $("#noAllocationLinesError").show();

        $("#AllocationLines option").each((index: number, element: HTMLOptionElement) => {
            if (element.value) {

                // Don't hide the dropdown element for currently selected value of the calculation
                if ((typeof existingAllocationId !== "undefined" && existingAllocationId && existingAllocationId == element.value)) {
                    return;
                }
                
                if (hideAllocationLines.indexOf(element.value) > -1) {
                    $(element).hide();
                }
            }
        });

        // Create/edit form, there could be a value from funding type selected selected
        if (existingAllocationId && availableBaselineAllocationLineIds <= 0 && $("#AllocationLines").val() !== existingAllocationId) {
            $("#AllocationLines").val("");
        } 
    }
    else if (selectedValue == "") {
        // Initial page load
    }
    else {
        alert("Unknown calculation type");
    }
}

$("#CalculationTypes").on('change', onCalculationTypeChange);

$("#CalculationTypes").trigger("change");