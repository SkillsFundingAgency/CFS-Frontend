using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class ProductFolder
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("products")]
        public Product[] Products { get; set; }
    }
}