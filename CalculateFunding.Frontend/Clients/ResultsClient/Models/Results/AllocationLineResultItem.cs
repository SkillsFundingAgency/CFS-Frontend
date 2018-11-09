using CalculateFunding.Common.ApiClient.Models;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models.Results
{
    public class AllocationLineResultItem
    {
        public Reference AllocationLine { get; set; }
        public double? Value { get; set; }
    }
}
