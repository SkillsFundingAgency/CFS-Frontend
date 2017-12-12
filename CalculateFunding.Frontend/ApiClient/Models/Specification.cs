using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class Specification
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("academicYear")]
        public Reference AcademicYear { get; set; }

        [JsonProperty("fundingStream")]
        public Reference FundingStream { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }


        //[JsonProperty("fundingPolicies")]
        //public FundingPolicy[] FundingPolicies { get; set; }

        //[JsonProperty("datasetDefinitions")]
        //public DatasetDefinition[] DatasetDefinitions { get; set; }

    }
}

