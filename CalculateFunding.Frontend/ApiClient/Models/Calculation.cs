using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class Calculation : Reference
    {
        [JsonProperty("description")]
        public string Description { get; set; }
    }
}