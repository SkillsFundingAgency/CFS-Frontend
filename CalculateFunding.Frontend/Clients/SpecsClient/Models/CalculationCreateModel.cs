namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using Newtonsoft.Json;

    public class CalculationCreateModel
    {
        [JsonProperty("specificationId")]
        public string SpecificationId { get; set; }

        [JsonProperty("allocationLineId")]
        public string AllocationLineId { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("calculationType")]
        public CalculationSpecificationType CalculationType { get; set; }
    }
}
