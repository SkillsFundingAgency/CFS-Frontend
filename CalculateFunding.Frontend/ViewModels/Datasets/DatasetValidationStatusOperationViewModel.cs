using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum DatasetValidationStatusOperationViewModel
    {
        Queued,
        Processing,
        ValidatingExcelWorkbook,
        ValidatingTableResults,
        SavingResults,
        Validated,
        FailedValidation,
        ExceptionThrown,
    }
}
