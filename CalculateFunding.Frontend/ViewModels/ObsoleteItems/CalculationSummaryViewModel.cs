using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.ObsoleteItems
{
    public class CalculationSummaryViewModel
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        
        [JsonProperty("name")]
        public string Name { get; set; }
    }
}