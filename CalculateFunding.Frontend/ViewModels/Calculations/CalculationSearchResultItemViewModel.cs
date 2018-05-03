using CalculateFunding.Frontend.Helpers;
using System;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationSearchResultItemViewModel
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string SpecificationName { get; set; }

        public string PeriodName { get; set; }

        public string Status { get; set; }

        public string CalculationType { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }

        public string LastUpdatedDateDisplay
        {
            get { return LastUpdatedDate.HasValue ? LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString) : "Unknown" ; }
        }
    }
}
