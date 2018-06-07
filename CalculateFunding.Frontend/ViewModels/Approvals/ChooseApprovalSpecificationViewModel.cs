using CalculateFunding.Frontend.ViewModels.Common;
using System;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class ChooseApprovalSpecificationViewModel
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public IEnumerable<ReferenceViewModel> FundingStreams { get; set; }

        public decimal FundingAmount { get; set; }

        public string FundingAmountFormatted
        {
            get
            {
                return String.Format("{0:n}", FundingAmount);
            }
        }

        public PublishStatusViewModel ApprovalStatus { get; set; }

        public decimal ProviderQaCoverage { get; set; }

        public int QaTestsPassed { get; set; }

        public int QaTestsTotal { get; set; }

        public int CalculationsApproved { get; set; }

        public int CalculationsTotal { get; set; }

        public bool CanBeChosen { get; set; }

        public bool IsSelectedForFunding { get; set; }

        public string ApprovalStatusCssClass
        {
            get
            {
                switch (ApprovalStatus)
                {
                    case PublishStatusViewModel.Approved:
                        return "status-approved";
                    case PublishStatusViewModel.Draft:
                        return "status-draft";
                    case PublishStatusViewModel.Updated:
                        return "status-updated";
                    default:
                        return string.Empty;
                }
            }
        }
    }
}
