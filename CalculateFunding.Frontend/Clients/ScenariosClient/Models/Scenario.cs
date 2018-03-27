
namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;
    using System;
    public class Scenario : Reference
    {
       // [JsonProperty("specificationId")]
      //  public string SpecificationId { get; set; }

      //  public string PeriodName { get; set; }

        [JsonProperty("description")]
        public string ScenarioDescription { get; set; }

        [JsonProperty("publishStatus")]
        public string Status { get; set; }

        [JsonProperty("Gherkin ")]
        public string GherkinCode { get; set; }

        [JsonProperty("date")]
        public DateTime LastModified { get; set; }

        [JsonProperty("author")]
        public Reference LastModifiedBy { get; set; }

        [JsonProperty("version")]
        public int Version { get; set; }
    }
}
