using System.Collections.Generic;
using CalculateFunding.Frontend.Clients.Models;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{

    public class Product : ResultSummary
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("allocationLine")]
        public Reference AllocationLine { get; set; }

        [JsonProperty("calculation")]
        public ProductCalculation Calculation { get; set; }
        [JsonProperty("testScenarios")]
        public List<ProductTestScenario> TestScenarios { get; set; }
        [JsonProperty("testProviders")]
        public Reference[] TestProviders { get; set; }
    }


}