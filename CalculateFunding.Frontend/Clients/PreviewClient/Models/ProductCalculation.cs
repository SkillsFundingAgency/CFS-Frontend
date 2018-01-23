using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{
    public class ProductCalculation
    {
        [JsonProperty("description")]
        public CalculationType CalculationType { get; set; }
        [JsonProperty("sourceCode")]
        public string SourceCode { get; set; }
    }
}