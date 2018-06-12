using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class PublishedAllocationLineResult
    {
        public string AllocationLineId { get; set; }

        public string AllocationLineName { get; set; }

        public decimal FundingAmount { get; set; }

        public AllocationLineStatus Status { get; set; }

        public DateTimeOffset? LastUpdated { get; set; }
    }
}
