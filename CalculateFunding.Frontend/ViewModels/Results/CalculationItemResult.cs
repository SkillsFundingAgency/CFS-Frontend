using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using System;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class CalculationItemResult
    {
        public string Calculation { get; set; }

        public CalculationSpecificationType CalculationType { get; set; }

        public decimal SubTotal { get; set; }

        public string TotalFormatted
        {
            get
            {
                switch (CalculationType)
                {
                    case CalculationSpecificationType.Funding:
                        return SubTotal.AsFormattedMoney();
                    case CalculationSpecificationType.Number:
                        return SubTotal.AsFormattedNumber();
                    default:
                        throw new InvalidOperationException("Unknown calculation type");
                }
            }
        }
    }
}
