namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using System.Collections.Generic;
    using System.Linq;
    using Newtonsoft.Json;

    public class Specification : SpecificationSummary
    {
        public Specification()
        {
            Policies = Enumerable.Empty<Policy>();
        }

        [JsonProperty("policies")]
        public IEnumerable<Policy> Policies { get; set; }
    }
}