namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public enum DatasetValidationStatusOperation
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
