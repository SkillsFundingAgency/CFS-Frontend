
namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;
    using System;

    public class CurrentScenario : Reference
    {
        [JsonProperty("description")]
        public string ScenarioDescription { get; set; }

        [JsonProperty("date")]
        public DateTime LastModified { get; set; }

        [JsonProperty("author")]
        public Reference LastModifiedBy { get; set; }

        [JsonProperty("version")]
        public int Version { get; set; }
    }
}
