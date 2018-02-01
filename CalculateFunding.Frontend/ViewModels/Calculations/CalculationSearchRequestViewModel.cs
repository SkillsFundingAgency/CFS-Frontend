using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationSearchRequestViewModel
    {
        public int? PageNumber { get; set; }

        public string SearchTerm { get; set; }

        public bool IncludeFacets { get; set; }

        public IDictionary<string, string[]> Filters { get; set; }
    }
}
