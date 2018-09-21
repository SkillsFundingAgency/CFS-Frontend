using System;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class PublishedProviderResult
    {
        public IEnumerable<PublishedFundingStreamResult> FundingStreamResults { get; set; }

        public string SpecificationId { get; set; }

        public string ProviderName { get; set; }

        public string ProviderId { get; set; }

        public string Ukprn { get; set; }

        public decimal FundingAmount{ get; set; }

        public int TotalAllocationLines { get; set; }

        public int NumberHeld { get; set; }

        public int NumberApproved { get; set; }

        public int NumberUpdated { get; set; }

        public int NumberPublished { get; set; }

        public DateTimeOffset? LastUpdated { get; set; }
    }
}
