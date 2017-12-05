using Newtonsoft.Json;

namespace CalculateFunding.Web.ApiClient.Models
{
    public class FundingPolicy
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("allocationLines")]
        public AllocationLine[] AllocationLines { get; set; }
    }
}