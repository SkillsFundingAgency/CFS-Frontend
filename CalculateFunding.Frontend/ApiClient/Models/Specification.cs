using CalculateFunding.Frontend.ApiClient.Models;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class Policy
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }
    }

    public class SpecificationSnapshot
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("specification")]
        public Specification Specification { get; set; }


        //[JsonProperty("fundingPolicies")]
        //public FundingPolicy[] FundingPolicies { get; set; }

        //[JsonProperty("datasetDefinitions")]
        //public DatasetDefinition[] DatasetDefinitions { get; set; }

    }


public class Specification
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("currentSnapshotId")]
        public string CurrentSnaphotId { get; set; }

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

