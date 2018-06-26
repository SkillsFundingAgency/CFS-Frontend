namespace CalculateFunding.Frontend.Clients.TestEngineClient.Models
{
    using Newtonsoft.Json;
    using System;
    public class TestScenarioSearchResultItem
    {
        public string Id { get; set; }

        public string TestResult { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string TestScenarioId { get; set; }

        public string TestScenarioName { get; set; }

        public string ProviderId { get; set; }

        public string ProviderName { get; set; }

        [JsonProperty("lastUpdatedDate")]
        public DateTime? LastUpdatedDate { get; set; }
        
    }
}
