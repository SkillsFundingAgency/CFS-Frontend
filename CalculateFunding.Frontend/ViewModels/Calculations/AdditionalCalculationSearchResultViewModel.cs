using System;
using CalculateFunding.Frontend.Helpers;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class AdditionalCalculationSearchResultViewModel
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string Status { get; set; }

        public string ValueType { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }

        public object Value { get; set; }

        public string LastUpdatedDateDisplay
        {
            get { return LastUpdatedDate.HasValue ? LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString) : "Unknown"; }
        }

        public string ExceptionMessage { get; set; }
    }
}
