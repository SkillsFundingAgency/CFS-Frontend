using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class FundingPolicySummary : ResultSummary
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public List<AllocationLineSummary> AllocationLines { get; set; }

    }
}
