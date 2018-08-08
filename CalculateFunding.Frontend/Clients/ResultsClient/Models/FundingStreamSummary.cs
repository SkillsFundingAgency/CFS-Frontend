using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class FundingStreamSummary
    {
        public string Name { get; set; }

        public List<AllocationLineSummary> AllocationLines { get; set; }
    }
}
