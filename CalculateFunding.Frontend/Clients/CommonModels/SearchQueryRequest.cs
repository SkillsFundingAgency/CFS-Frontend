namespace CalculateFunding.Frontend.Clients.CommonModels
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.Helpers;

    internal class SearchQueryRequest
    {
        public int PageNumber { get; set; }

        public int Top { get; set; }

        public string SearchTerm { get; set; }

        public bool IncludeFacets { get; set; }

        public IDictionary<string, string[]> Filters { get; set; }

        public static SearchQueryRequest FromSearchFilterRequest(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest result = new SearchQueryRequest()
            {
                PageNumber = filterOptions.Page,
                Top = filterOptions.PageSize,
                SearchTerm = filterOptions.SearchTerm,
                IncludeFacets = filterOptions.IncludeFacets,
                Filters = filterOptions.Filters,
            };

            return result;
        }
    }
}
