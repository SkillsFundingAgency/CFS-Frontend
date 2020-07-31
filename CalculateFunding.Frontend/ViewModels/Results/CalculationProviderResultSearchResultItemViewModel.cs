using System;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.Helpers;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class CalculationProviderResultSearchResultItemViewModel
    {
        public string Id { get; set; }

        public string ProviderId { get; set; }

        public string ProviderName { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public DateTimeOffset LastUpdatedDate { get; set; }

        public string LocalAuthority { get; set; }

        public string ProviderType { get; set; }

        public string ProviderSubType { get; set; }

        public string UKPRN { get; set; }

        public string URN { get; set; }

        public string UPIN { get; set; }

        public DateTimeOffset? OpenDate { get; set; }

        public string EstablishmentNumber { get; set; }

        public string CalculationId { get; set; }

        public string CalculationName { get; set; }

        public object CalculationResult { get; set; }

        public string CalculationExceptionType { get; set; }

        public string CalculationExceptionMessage { get; set; }

        public string LastUpdatedDateDisplay => LastUpdatedDate.ToString(FormatStrings.DateTimeFormatString);

        public string DateOpenedDisplay => OpenDate.HasValue
            ? OpenDate.Value.ToString(FormatStrings.DateTimeFormatString)
            : string.Empty;

        public string CalculationResultDisplay { get; set; }

        public void SetCalculationResultDisplay(CalculationValueTypeViewModel calculationValueTypeViewModel)
        {
	        CalculationResultDisplay = CalculationResult.AsFormatCalculationType(calculationValueTypeViewModel);
        }

        public string AsDisplay(CalculationValueTypeViewModel calculationValueTypeViewModel)
        {
            return CalculationResult.AsFormatCalculationType(calculationValueTypeViewModel);
        }
    }
}
