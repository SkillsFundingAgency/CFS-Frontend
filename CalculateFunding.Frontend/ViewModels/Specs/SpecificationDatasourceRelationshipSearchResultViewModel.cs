namespace CalculateFunding.Frontend.ViewModels.Specs
{
    using System.Collections.Generic;
    using System.Linq;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class SpecificationDatasourceRelationshipSearchResultViewModel : SearchResultViewModel
    {
        public SpecificationDatasourceRelationshipSearchResultViewModel()
        {
            SpecRelationships = Enumerable.Empty<SpecificationDatasourceRelationshipSearchResultItemViewModel>();
        }

        public IEnumerable<SpecificationDatasourceRelationshipSearchResultItemViewModel> SpecRelationships { get; set; }
    }
}
