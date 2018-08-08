using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class ConfirmPublishApproveViewModel
    {
        public int NumberOfProviders { get; set; }

        public string[] ProviderTypes { get; set; }

        public string[] LocalAuthorities { get; set; }

        public string FundingPeriods { get; set; }

        public string SpecificationName { get; set; }

        public List<FundingStreamSummaryViewModel> FundingStreams { get; set; }

        public decimal TotalFundingApproved { get; set; }
    }
}
