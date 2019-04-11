using Newtonsoft.Json;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class PublishedProviderProfile
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("profilePeriods")]
        public IEnumerable<ProfilingPeriod> ProfilingPeriods { get; set; }

        [JsonProperty("financialEnvelopes")]
        public IEnumerable<FinancialEnvelope> FinancialEnvelopes { get; set; }
    }
}
