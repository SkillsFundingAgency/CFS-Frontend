using System;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class CalculationItemResult
    {
        public string Calculation { get; set; }

        public CalculationSpecificationType CalculationType { get; set; }

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
