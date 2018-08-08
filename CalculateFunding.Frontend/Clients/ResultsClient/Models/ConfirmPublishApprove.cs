using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class ConfirmPublishApprove
    {
        public int NumberOfProviders { get; set; }

        public string[] ProviderTypes { get; set; }

        public string[] LocalAuthorities { get; set; }

        public string FundingPeriod { get; set; }

        public List<FundingStreamSummary> FundingStreams { get; set; }

        public decimal TotalFundingApproved { get; set; }
    }
}
