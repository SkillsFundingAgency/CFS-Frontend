using CalculateFunding.Frontend.Clients.CommonModels;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class SpecificationSummary : Reference
    {
        [JsonProperty("period")]
        public Reference Period { get; set; }

        [JsonProperty("fundingStream")]
        public Reference FundingStream { get; set; }
    }
}