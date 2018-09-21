using System;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class PublishedFundingStreamResult
    {
        public IEnumerable<PublishedAllocationLineResult> AllocationLineResults { get; set; }

        public string FundingStreamName { get; set; }

        public string FundingStreamId { get; set; }

        public decimal FundingAmount { get; set; }

        public DateTimeOffset? LastUpdated { get; set; }

        public int NumberHeld { get; set; }

        public int NumberApproved { get; set; }

        public int NumberUpdated { get; set; }

        public int NumberPublished { get; set; }

        public int TotalAllocationLines { get; set; }
    }
}
