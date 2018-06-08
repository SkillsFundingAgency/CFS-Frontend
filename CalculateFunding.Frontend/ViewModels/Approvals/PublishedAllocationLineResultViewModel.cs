using CalculateFunding.Frontend.Helpers;
using System;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class PublishedAllocationLineResultViewModel
    {
        public string AllocationLineId { get; set; }

        public string AllocationLineName { get; set; }

        public AllocationLineStatusViewModel Status { get; set; }

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

        public decimal FundingAmount { get; set; }

        public string FundingAmountDisplay
        {
            get
            {
                return String.Format(FormatStrings.MoneyFormatString, FundingAmount);
            }
        }
    }
}
