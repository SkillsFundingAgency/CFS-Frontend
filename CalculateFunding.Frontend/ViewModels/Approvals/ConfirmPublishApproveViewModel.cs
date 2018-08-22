using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class ConfirmPublishApproveViewModel
    {
        public int NumberOfProviders { get; set; }

        public string ProviderTypesJson { get; set; }

        public string LocalAuthoritiesJson { get; set; }

        public string FundingPeriod { get; set; }

        public string SpecificationName { get; set; }

        public IEnumerable<FundingStreamSummaryViewModel> FundingStreams { get; set; }

        public decimal TotalFundingApproved { get; set; }
    }
}
