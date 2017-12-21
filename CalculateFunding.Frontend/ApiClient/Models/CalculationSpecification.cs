using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class CalculationSpecification : Reference
    {
        [JsonProperty("description")]
        public string Description { get; set; }
    }
}