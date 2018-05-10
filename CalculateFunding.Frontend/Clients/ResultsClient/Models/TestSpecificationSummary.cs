
namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;

    public class TestSpecificationSummary : Reference
    {
        [JsonProperty("fundingPeriod")]
        public Reference FundingPeriod { get; set; }
    }
}
