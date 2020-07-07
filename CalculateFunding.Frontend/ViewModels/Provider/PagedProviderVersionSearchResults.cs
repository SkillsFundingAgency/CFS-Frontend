using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Provider
{
    public class PagedProviderVersionSearchResults
    {
		public int TotalCount { get; set; }
		public int StartItemNumber { get; set; }
		public int EndItemNumber { get; set; }
		public IEnumerable<ProviderVersionSearchResult> Items { get; set; }
		public IEnumerable<Facet> Facets { get; set; }
        public PagerState PagerState { get; set; }
    }
}
