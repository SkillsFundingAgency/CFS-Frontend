namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using System;
    using System.Collections.Generic;
    using CalculateFunding.Common.ApiClient.Models;
    using Newtonsoft.Json;

    public class Policy : Reference
    {
        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("calculations")]
        public List<Calculation> Calculations { get; set; }

        [JsonProperty("subPolicies")]
        public List<Policy> SubPolicies { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}