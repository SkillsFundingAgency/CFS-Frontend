namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using Newtonsoft.Json;

    public class CalculationUpdateModel
    {
        [JsonProperty("allocationLineId")]
        public string AllocationLineId { get; set; }

        [JsonProperty("policyId")]
        public string PolicyId { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("calculationType")]
        public CalculationSpecificationType CalculationType { get; set; }

        [JsonProperty("isPublic")]
        public bool IsPublic { get; set; }
    }
}
