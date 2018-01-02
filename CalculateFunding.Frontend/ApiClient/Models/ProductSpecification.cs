using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class ProductSpecification
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("allocationLine")]
        public Reference AllocationLine { get; set; }


    }
}