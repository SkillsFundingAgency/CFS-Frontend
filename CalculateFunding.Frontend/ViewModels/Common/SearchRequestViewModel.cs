namespace CalculateFunding.Frontend.ViewModels.Common
{
    using CalculateFunding.Common.ApiClient.Models;
    using System.Collections.Generic;

    public class SearchRequestViewModel
    {
        public int? PageNumber { get; set; }

        public string SearchTerm { get; set; }

        public string ErrorToggle { get; set; }

        public bool IncludeFacets { get; set; }

        public IDictionary<string, string[]> Filters { get; set; }

        public int? PageSize { get; set; }

        public int FacetCount { get; set; } = 10;

        public SearchMode SearchMode { get;  set; }
    }
}