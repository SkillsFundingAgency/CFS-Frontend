
namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    using CalculateFunding.Common.ApiClient.Models;
    using Newtonsoft.Json;

    public class TestSpecificationSummary : Reference
    {
        [JsonProperty("fundingPeriod")]
        public Reference FundingPeriod { get; set; }
    }
}
