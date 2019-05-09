using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models.Results
{
    public class CalculationResultItem
    {
        public Reference Calculation { get; set; }
        public string ExceptionType { get; set; }
        public string ExceptionMessage { get; set; }
        public decimal? Value { get; set; }
        public CalculationSpecificationType CalculationType { get; set; }
    }
}
