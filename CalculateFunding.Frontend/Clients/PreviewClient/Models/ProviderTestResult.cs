namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;

    public class ProviderTestResult
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("budget")]
        public Reference Budget { get; set; }

        [JsonProperty("provider")]
        public Reference Provider { get; set; }

        [JsonProperty("scenarioResults")]
        public ProductTestScenarioResult[] ScenarioResults { get; set; }
    }
}