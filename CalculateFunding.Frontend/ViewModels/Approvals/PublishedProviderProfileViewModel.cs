using Newtonsoft.Json;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class PublishedProviderProfileViewModel
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("profilePeriods")]
        public IEnumerable<ProfilingPeriodViewModel> ProfilingPeriods { get; set; }

        [JsonProperty("financialEnvelopes")]
        public IEnumerable<FinancialEnvelopeViewModel> FinancialEnvelopes { get; set; }
    }
}
