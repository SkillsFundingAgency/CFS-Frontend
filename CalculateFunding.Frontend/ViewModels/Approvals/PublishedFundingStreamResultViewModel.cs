using CalculateFunding.Frontend.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class PublishedFundingStreamResultViewModel
    {
        public PublishedFundingStreamResultViewModel()
        {
            AllocationLineResults = Enumerable.Empty<PublishedAllocationLineResultViewModel>();
        }

        public string FundingStreamName { get; set; }

        public string FundingStreamId { get; set; }

        public IEnumerable<PublishedAllocationLineResultViewModel> AllocationLineResults { get; set; }

        public decimal FundingAmount { get; set; }

        public string FundingAmountDisplay
        {
            get
            {
                return String.Format(FormatStrings.MoneyFormatString, FundingAmount);
            }
        }

        public int TotalAllocationLines { get; set; }

        public int NumberHeld { get; set; }

        public int NumberApproved { get; set; }

        public int NumberPublished { get; set; }

        public DateTimeOffset LastUpdated { get; set; }

        public string LastUpdatedDateDisplay
        {
            get
            {
                return LastUpdated.ToString(FormatStrings.DateFormatString);
            }
        }

        public string LastUpdatedTimeDisplay
        {
            get
            {
                return LastUpdated.ToString(FormatStrings.TimeFormatString);
            }
        }
    }
}
