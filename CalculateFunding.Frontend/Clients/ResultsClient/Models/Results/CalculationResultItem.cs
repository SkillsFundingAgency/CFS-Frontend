using CalculateFunding.Frontend.Clients.CommonModels;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models.Results
{
    public class CalculationResultItem
    {
        public Reference Calculation { get; set; }
        public double? Value { get; set; }
    }
}
