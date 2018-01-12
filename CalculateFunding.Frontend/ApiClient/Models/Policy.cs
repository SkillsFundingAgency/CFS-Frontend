using System.Collections.Generic;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class Policy : Reference
    {
        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("calculations")]
        public List<CalculationSpecification> Calculations { get; set; }

        [JsonProperty("subPolicies")]
        public List<Policy> SubPolicies { get; set; }
    }
}