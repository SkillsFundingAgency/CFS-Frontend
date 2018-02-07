using System.Collections.Generic;
using CalculateFunding.Frontend.Clients.CommonModels;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class Policy : Reference
    {
        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("calculations")]
        public List<Calculation> Calculations { get; set; }

        [JsonProperty("subPolicies")]
        public List<Policy> SubPolicies { get; set; }
    }
}