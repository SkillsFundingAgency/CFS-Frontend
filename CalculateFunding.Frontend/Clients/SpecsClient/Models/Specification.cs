namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using System.Collections.Generic;
    using System.Linq;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;

    public class Specification : Reference
    {
        public Specification()
        {
            Policies = Enumerable.Empty<Policy>();
        }

        [JsonProperty("academicYear")]
        public Reference AcademicYear { get; set; }

        [JsonProperty("fundingStreams")]
        public IEnumerable<Reference> FundingStreams { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("policies")]
        public IEnumerable<Policy> Policies { get; set; }
    }
}