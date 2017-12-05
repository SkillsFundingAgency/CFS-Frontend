using Newtonsoft.Json;

namespace CalculateFunding.Web.ApiClient.Models
{
    public class ProductCalculation
    {
        [JsonProperty("description")]
        public CalculationType CalculationType { get; set; }
        [JsonProperty("sourceCode")]
        public string SourceCode { get; set; }
    }
}