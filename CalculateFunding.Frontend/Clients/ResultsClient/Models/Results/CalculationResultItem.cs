using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models.Results
{
    public class CalculationResultItem
    {
        public Reference Calculation { get; set; }
        public decimal? Value { get; set; }
        public CalculationSpecificationType CalculationType { get; set; }
    }
}
