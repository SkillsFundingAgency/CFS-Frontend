using System;
using System.Collections.Generic;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class SpecificationSearchResultItemViewModel : ReferenceViewModel
    {
        public string FundingPeriodName { get; set; }

        public string FundingPeriodId { get; set; }

        public IEnumerable<string> FundingStreamNames { get; set; }

        public IEnumerable<string> FundingStreamIds { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }

        public string Status { get; set; }

        public string Description { get; set; }

        public bool IsSelectedForFunding { get; set; }

        public string LastUpdatedDateDisplay
        {
            get { return LastUpdatedDate.HasValue ? LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString) : "Unknown"; }
        }

        public string LastUpdatedDateFormatted
        {
            get
            {
                return LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString);
            }
        }
    }
}
