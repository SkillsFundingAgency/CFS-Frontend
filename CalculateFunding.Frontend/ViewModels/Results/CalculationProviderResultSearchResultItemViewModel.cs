namespace CalculateFunding.Frontend.ViewModels.Results
{
    using System;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;

    public class CalculationProviderResultSearchResultItemViewModel : ProviderSearchResultItemViewModel
    {
        public CalculationSpecificationType CalculationType { get; set; }

        public Decimal CalculationResult { get; set; }

        public string CalculationResultDisplay
        {
            get
            {
                return CalculationType == CalculationSpecificationType.Funding ? CalculationResult.AsMoney() : CalculationResult.ToString("#.##");
            }
        }

        public DateTimeOffset? LastUpdatedDate { get; set; }

        public string LastUpdatedDateDisplay
        {
            get
            {
                return LastUpdatedDate.HasValue ? LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString) : "Unknown";
            }
        }
    }
}
