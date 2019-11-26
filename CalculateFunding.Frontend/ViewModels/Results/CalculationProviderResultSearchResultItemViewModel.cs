namespace CalculateFunding.Frontend.ViewModels.Results
{
    using System;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using Helpers;

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

        public decimal? CalculationResult { get; set; }

        public string CalculationExceptionType { get; set; }

        public string CalculationExceptionMessage { get; set; }

        public string LastUpdatedDateDisplay => LastUpdatedDate.ToString(FormatStrings.DateTimeFormatString);

        public string DateOpenedDisplay => OpenDate.HasValue
            ? OpenDate.Value.ToString(FormatStrings.DateTimeFormatString)
            : string.Empty;

        public string AsDisplay(CalculationValueTypeViewModel calculationValueTypeViewModel)
        {


            if (CalculationResult.HasValue)
            {
                switch (calculationValueTypeViewModel)
                {
                    case CalculationValueTypeViewModel.Number:
                        return CalculationResult.Value.AsFormattedNumber();
                    case CalculationValueTypeViewModel.Percentage:
                        return CalculationResult.Value.AsFormattedPercentage();
                    case CalculationValueTypeViewModel.Currency:
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
}
