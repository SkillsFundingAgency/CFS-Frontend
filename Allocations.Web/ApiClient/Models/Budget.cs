using Newtonsoft.Json;

namespace CalculateFunding.Web.ApiClient.Models
{

    public class Budget 
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("academicYear")]
        public string AcademicYear { get; set; }

        [JsonProperty("fundingStream")]
        public string FundingStream { get; set; }

        [JsonProperty("fundingPolicies")]
        public FundingPolicy[] FundingPolicies { get; set; }

        [JsonProperty("datasetDefinitions")]
        public DatasetDefinition[] DatasetDefinitions { get; set; }

    }
}

