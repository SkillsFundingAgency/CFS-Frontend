using System.Collections.Generic;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class SpecificationSearchResultViewModel : SearchResultViewModel
    {
        public IEnumerable<SpecificationSearchResultItemViewModel> Specifications { get; set; }
    }
}
