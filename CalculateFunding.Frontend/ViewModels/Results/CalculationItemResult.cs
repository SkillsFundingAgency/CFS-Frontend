using System;
using CalculateFunding.Common.ApiClient.Calcs.Models;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class CalculationItemResult
    {
        public string Calculation { get; set; }
        public CalculationSpecificationType CalculationType { get; set; }
        public string CalculationExceptionType { get; set; }
        public string CalculationExceptionMessage { get; set; }
        public decimal? SubTotal { get; set; }
        public string TotalFormatted
        {
            get
            {
                if (SubTotal.HasValue)
                {
                    switch (CalculationType)
                    {
                        case CalculationSpecificationType.Funding:
                            return SubTotal.Value.AsFormattedMoney();
                        case CalculationSpecificationType.Number:
                            return SubTotal.Value.AsFormattedNumber();
                        case CalculationSpecificationType.Baseline:
                            return SubTotal.Value.AsFormattedMoney();
                        // TODO: Update display format based on template or number type, instead of calculation type
                        case CalculationSpecificationType.Additional:
                        case CalculationSpecificationType.Template:
                            return SubTotal.Value.AsFormattedNumber();
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
}
