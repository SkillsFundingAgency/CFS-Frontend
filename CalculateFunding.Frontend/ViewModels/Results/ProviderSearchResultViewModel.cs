namespace CalculateFunding.Frontend.ViewModels.Results
{
    using System.Collections.Generic;
    using System.Linq;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class ProviderSearchResultViewModel : SearchResultViewModel
    {
        public ProviderSearchResultViewModel()
        {
            Providers = Enumerable.Empty<ProviderSearchResultItemViewModel>();
        }

        public IEnumerable<ProviderSearchResultItemViewModel> Providers { get; set; }
    }
}
