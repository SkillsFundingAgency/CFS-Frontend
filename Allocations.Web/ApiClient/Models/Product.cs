using System.Collections.Generic;
using CalculateFunding.Web.ApiClient.Models.Results;
using Newtonsoft.Json;

namespace CalculateFunding.Web.ApiClient.Models
{

    public class Product : ResultSummary
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("calculation")]
        public ProductCalculation Calculation { get; set; }
        [JsonProperty("testScenarios")]
        public List<ProductTestScenario> TestScenarios { get; set; }
        [JsonProperty("testProviders")]
        public Reference[] TestProviders { get; set; }
    }


}