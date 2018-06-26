namespace CalculateFunding.Frontend.ViewModels.Common
{
    using System.Collections.Generic;

    public class SearchFacetViewModel
    {
        public string Name { get; set; }

        public IEnumerable<SearchFacetValueViewModel> FacetValues { get; set; }
    }
}
