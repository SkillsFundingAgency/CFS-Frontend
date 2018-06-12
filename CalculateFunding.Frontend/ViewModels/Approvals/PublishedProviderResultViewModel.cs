using CalculateFunding.Frontend.Helpers;
using System;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class PublishedProviderResultViewModel
    {
        public string ProviderName { get; set; }

        public string ProviderId { get; set; }

        public string Ukprn { get; set; }

        public IEnumerable<PublishedFundingStreamResultViewModel> FundingStreamResults { get; set; }

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

        public int TestCoveragePercent { get; set; }

        public int TestsPassed { get; set; }

        public int TestsTotal { get; set; }

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
