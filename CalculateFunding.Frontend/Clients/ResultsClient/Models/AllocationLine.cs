namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    using Newtonsoft.Json;

    public class AllocationLine
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("productFolders")]
        public ProductFolder[] ProductFolders { get; set; }
    }
}