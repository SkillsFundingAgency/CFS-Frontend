using Newtonsoft.Json;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models.Results
{
    public class ProviderResults
    {
        [JsonProperty("calcResults")]
        public IEnumerable<CalculationResultItem> CalculationResults { get; set; }

        [JsonProperty("allocationLineResults")]
        public IEnumerable<AllocationLineResultItem> AllocationResults { get; set; }
    }
}
