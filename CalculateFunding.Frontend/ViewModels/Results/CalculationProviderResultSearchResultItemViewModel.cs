namespace CalculateFunding.Frontend.ViewModels.Results
{
    using System;
    using CalculateFunding.Common.ApiClient.Calcs.Models;
    using Helpers;

    public class CalculationProviderResultSearchResultItemViewModel : ProviderSearchResultItemViewModel
    {
        public CalculationSpecificationType CalculationType { get; set; }
		public Decimal? CalculationResult { get; set; }
        public string CalculationExceptionType { get; set; }
		public string CalculationExceptionMessage { get; set; }
		public string CalculationResultDisplay
        {
            get
            {
                if (CalculationResult.HasValue)
                {
                    switch (CalculationType)
                    {
                        case CalculationSpecificationType.Funding:
                            return CalculationResult.Value.AsFormattedMoney();
                        case CalculationSpecificationType.Number:
                            return CalculationResult.Value.AsFormattedNumber();
                        case CalculationSpecificationType.Baseline:
                            return CalculationResult.Value.AsFormattedMoney();
                        default:
                            throw new InvalidOperationException("Unknown calculation type");
                    }
                }
                else
                {
                    return Properties.PageText.ExcludedText;
                }
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
