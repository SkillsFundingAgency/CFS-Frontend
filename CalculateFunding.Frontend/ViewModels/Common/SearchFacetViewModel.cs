using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Common
{
    public class SearchFacetViewModel
    {
        public string Name { get; set; }

        public IEnumerable<SearchFacetValueViewModel> FacetValues { get; set; }
    }
}
