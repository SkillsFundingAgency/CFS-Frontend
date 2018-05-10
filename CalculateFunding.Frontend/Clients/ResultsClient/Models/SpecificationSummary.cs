using CalculateFunding.Frontend.Clients.CommonModels;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class SpecificationSummary : Reference
    {
        [JsonProperty("period")]
        public Reference Period { get; set; }

        [JsonProperty("fundingStreams")]
        public IEnumerable<Reference> FundingStreams { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }
    }
}