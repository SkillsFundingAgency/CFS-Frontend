using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class ConfirmPublishApprove
    {
        public int NumberOfProviders { get; set; }

        public IEnumerable<string> ProviderTypes { get; set; }

        public IEnumerable<string> LocalAuthorities { get; set; }

        public string FundingPeriod { get; set; }

        public IEnumerable<FundingStreamSummary> FundingStreams { get; set; }

        public decimal TotalFundingApproved { get; set; }
    }
}
