namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using Newtonsoft.Json;
    using System.Collections.Generic;

    public class CreateSpecificationModel
    {
        [JsonProperty("academicYearId")]
        public string AcademicYearId { get; set; }

        [JsonProperty("fundingStreamIds")]
        public IEnumerable<string> FundingStreamIds { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }
    }
}
