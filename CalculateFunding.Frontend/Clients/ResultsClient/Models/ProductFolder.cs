using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
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