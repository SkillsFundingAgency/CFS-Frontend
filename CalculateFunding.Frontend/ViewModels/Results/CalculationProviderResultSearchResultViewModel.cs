namespace CalculateFunding.Frontend.ViewModels.Results
{
    using System.Collections.Generic;
    using System.Linq;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class CalculationProviderResultSearchResultViewModel : SearchResultViewModel
    {
        public CalculationProviderResultSearchResultViewModel()
        {
            CalculationProviderResults = Enumerable.Empty<CalculationProviderResultSearchResultItemViewModel>();
        }

        public IEnumerable<CalculationProviderResultSearchResultItemViewModel> CalculationProviderResults { get; set; }
    }
}
