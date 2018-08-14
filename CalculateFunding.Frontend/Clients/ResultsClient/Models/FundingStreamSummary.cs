using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class FundingStreamSummary
    {
        public string Name { get; set; }

        public IEnumerable<AllocationLineSummary> AllocationLines { get; set; }
    }
}
