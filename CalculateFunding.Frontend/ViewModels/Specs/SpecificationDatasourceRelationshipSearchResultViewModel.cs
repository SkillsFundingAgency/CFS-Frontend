using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
	public class SpecificationDatasourceRelationshipSearchResultViewModel
    {
		public IEnumerable<SpecificationDatasourceRelationshipSearchResultItem> Items { get; set; }
        public PagerState PagerState { get; set; }
		public int TotalCount { get; set; }
		public int StartItemNumber { get; set; }
		public int EndItemNumber { get; set; }
        public IEnumerable<SearchFacetViewModel> Facets { get; set; }
    }
}
