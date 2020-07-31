using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class PagedSpecficationSearchResults
    {
        public int TotalCount { get; set; }
		
        public int StartItemNumber { get; set; }
		
        public int EndItemNumber { get; set; }
		
        public IEnumerable<SpecificationSearchResultItem> Items { get; set; }
		
        public IEnumerable<SearchFacet> Facets { get; set; }
        
        public PagerState PagerState { get; set; }
    }
}