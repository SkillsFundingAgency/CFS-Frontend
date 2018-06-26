namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using Newtonsoft.Json;

    public class CreatePolicyModel
    {
        [JsonProperty("specificationId")]
        public string SpecificationId { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }
    }
}
