namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    using Newtonsoft.Json;

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